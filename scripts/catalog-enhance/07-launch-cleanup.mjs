/**
 * Final launch cleanup.
 *
 *   node --env-file=.env.local scripts/catalog-enhance/07-launch-cleanup.mjs          # dry run
 *   node --env-file=.env.local scripts/catalog-enhance/07-launch-cleanup.mjs --apply
 *
 * Unpublishes every product that cannot actually be delivered, demotes hero
 * images that misrepresent the product, and reports the human-review queue.
 *
 * Nothing is deleted. Unpublishing is `status='draft'` +
 * `assetStatus='preview_only'`, which the storefront filter
 * (lib/queries/catalog.ts `publiclyVisible()`) already excludes from listings,
 * search, recommendations, compare, sitemap and direct slug access, and which
 * `addToCart` and `computeOrderPricing` already refuse.
 */
import { Pool } from "pg"
import { readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs"

const APPLY = process.argv.includes("--apply")
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const PREVIEW_MARKER = "catalog%2Fpreviews"

/** Hero images that are marketing renders rather than the product itself. */
function heroIsMisleading(url) {
  if (!url) return true
  // The seeded hero art lives under products/images/ on the public blob host
  // and is AI marketing photography (boardrooms, desks, lifestyle scenes).
  // Generated previews live under catalog/previews and are layout drawings.
  return /public\.blob\.vercel-storage\.com\/products\/images\//.test(url)
}

async function main() {
  if (!APPLY) await pool.query("SET default_transaction_read_only = on")

  const assetPath = "scripts/audit/out/asset-reachability.json"
  if (!existsSync(assetPath)) {
    console.error("Run scripts/audit/asset-reachability.mjs first — it determines which files really exist.")
    process.exitCode = 1
    return
  }
  const assets = JSON.parse(readFileSync(assetPath, "utf8"))
  const fileByProduct = new Map()
  for (const r of assets.results) fileByProduct.set(r.productId, r)

  const { rows: products } = await pool.query(`
    SELECT p.id, p.slug, p.name, p.status, p."assetStatus", p."rightsStatus", p."isFree",
           p."isBundle", p."basePrice", p."thumbnailUrl", p."coverImageUrl",
           coalesce(array_length(p."fileFormats",1),0) AS n_formats,
           c.name AS category,
           (SELECT count(*)::int FROM product_files f WHERE f."productId"=p.id) AS n_files,
           (SELECT count(*)::int FROM product_licenses l WHERE l."productId"=p.id) AS n_licenses,
           (SELECT count(*)::int FROM product_images i WHERE i."productId"=p.id) AS n_images,
           (SELECT count(*)::int FROM bundle_items b WHERE b."bundleProductId"=p.id) AS n_bundle_items,
           (SELECT min(price::numeric) FROM product_licenses l WHERE l."productId"=p.id) AS min_price
    FROM products p JOIN categories c ON c.id=p."categoryId"
    ORDER BY p.id`)

  const { rows: previewImages } = await pool.query(
    `SELECT "productId", url, "sortOrder", alt FROM product_images ORDER BY "productId", "sortOrder"`,
  )
  const imagesByProduct = new Map()
  for (const i of previewImages) {
    if (!imagesByProduct.has(i.productId)) imagesByProduct.set(i.productId, [])
    imagesByProduct.get(i.productId).push(i)
  }

  const APPROVED_RIGHTS = new Set(["original", "licensed_for_distribution", "supplier_verified"])

  const toUnpublish = []
  const heroReplacements = []
  const reviewQueue = []

  for (const p of products) {
    const asset = fileByProduct.get(p.id)
    const reasons = []

    // --- deliverability ---------------------------------------------------
    if (p.isBundle) {
      // A bundle is only deliverable if fulfilment expands it — which it does
      // not (verified in lib/checkout-core.ts and the Polar webhook).
      reasons.push(
        p.n_bundle_items > 0
          ? "bundle: fulfilment does not grant entitlements for included products"
          : "bundle: no included products identified",
      )
    } else if (p.n_files === 0) {
      reasons.push("no product_files row")
    } else if (!asset || !asset.present) {
      reasons.push("blob object missing")
    }

    // --- other publish preconditions --------------------------------------
    if (!APPROVED_RIGHTS.has(p.rightsStatus)) reasons.push(`rightsStatus=${p.rightsStatus}`)
    if (p.n_licenses === 0) reasons.push("no licence tiers")
    if (!p.isFree && (p.min_price === null || Number(p.min_price) <= 0)) reasons.push("paid product with no positive price")
    if (p.n_images === 0) reasons.push("no images")
    if (p.n_formats === 0) reasons.push("no file formats recorded")

    if (p.status === "published" && reasons.length) {
      toUnpublish.push({ ...p, reasons })
    }

    // --- hero image -------------------------------------------------------
    const imgs = imagesByProduct.get(p.id) ?? []
    const generated = imgs.filter((i) => i.url.includes(PREVIEW_MARKER))
    if (heroIsMisleading(p.thumbnailUrl) && generated.length > 0) {
      heroReplacements.push({
        id: p.id,
        slug: p.slug,
        from: p.thumbnailUrl,
        to: generated[0].url,
        alt: generated[0].alt,
      })
    }

    // --- derived review state --------------------------------------------
    // finalReviewStatus could not be stored: ALTER TABLE requires table
    // ownership, which the available role does not have. It is derived here
    // from live data instead, which cannot go stale.
    const stubFile = asset?.present && (asset.actualSize ?? 0) < 20000
    let review = "pending"
    const reviewReasons = []
    if (reasons.length) {
      review = "changes_required"
      reviewReasons.push(...reasons)
    } else if (stubFile) {
      reviewReasons.push(`file is only ${asset.actualSize} bytes — cannot match the description`)
    }
    reviewQueue.push({
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      status: p.status,
      review,
      reasons: reviewReasons,
      fileBytes: asset?.present ? asset.actualSize : null,
    })
  }

  // --- duplicate detection -----------------------------------------------
  const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()
  const byTitle = new Map()
  for (const p of products) {
    const k = norm(p.name.replace(/^[a-z]+\s*[—–-]\s*/i, ""))
    if (!byTitle.has(k)) byTitle.set(k, [])
    byTitle.get(k).push(p)
  }
  const duplicateTitles = [...byTitle.values()].filter((g) => g.length > 1)

  const { rows: dupFiles } = await pool.query(`
    SELECT "blobPathname", count(*)::int n, array_agg("productId") AS ids
    FROM product_files GROUP BY 1 HAVING count(*) > 1`)
  const { rows: dupSku } = await pool.query(`
    SELECT sku, count(*)::int n FROM products WHERE sku IS NOT NULL GROUP BY 1 HAVING count(*) > 1`)

  // --- report --------------------------------------------------------------
  console.log(`products                      : ${products.length}`)
  console.log(`published now                 : ${products.filter((p) => p.status === "published").length}`)
  console.log(`TO UNPUBLISH                  : ${toUnpublish.length}`)
  console.log(`   of which bundles           : ${toUnpublish.filter((p) => p.isBundle).length}`)
  console.log(`hero images to replace        : ${heroReplacements.length}`)
  console.log(`duplicate title groups        : ${duplicateTitles.length}`)
  console.log(`shared blob files             : ${dupFiles.length}`)
  console.log(`duplicate SKUs                : ${dupSku.length}`)
  console.log(`review: changes_required      : ${reviewQueue.filter((r) => r.review === "changes_required").length}`)
  console.log(`review: pending               : ${reviewQueue.filter((r) => r.review === "pending").length}`)

  const reasonCounts = {}
  for (const p of toUnpublish) for (const r of p.reasons) reasonCounts[r.split(":")[0]] = (reasonCounts[r.split(":")[0]] ?? 0) + 1
  console.log("\nunpublish reasons:")
  for (const [k, v] of Object.entries(reasonCounts).sort((a, b) => b[1] - a[1])) console.log(`   ${String(v).padStart(4)}  ${k}`)

  mkdirSync("scripts/catalog-enhance/out", { recursive: true })
  writeFileSync(
    "scripts/catalog-enhance/out/launch-cleanup.json",
    JSON.stringify({ generatedAt: new Date().toISOString(), toUnpublish, heroReplacements, reviewQueue, duplicateTitles: duplicateTitles.map((g) => g.map((p) => ({ id: p.id, name: p.name }))), dupFiles, dupSku }, null, 2),
  )

  if (!APPLY) {
    console.log("\nDRY RUN — nothing written. Re-run with --apply.")
    return
  }

  const client = await pool.connect()
  try {
    await client.query("SET default_transaction_read_only = off")
    await client.query("BEGIN")

    for (const p of toUnpublish) {
      await client.query(
        `UPDATE products SET status='draft', "assetStatus"='preview_only', "updatedAt"=now() WHERE id=$1`,
        [p.id],
      )
    }
    for (const h of heroReplacements) {
      await client.query(`UPDATE products SET "thumbnailUrl"=$2, "coverImageUrl"=$2, "updatedAt"=now() WHERE id=$1`, [
        h.id,
        h.to,
      ])
    }

    await client.query("COMMIT")
    console.log(`\nAPPLIED — ${toUnpublish.length} unpublished, ${heroReplacements.length} hero images replaced.`)
  } catch (e) {
    await client.query("ROLLBACK")
    throw e
  } finally {
    client.release()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => pool.end())

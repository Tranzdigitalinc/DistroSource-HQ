/**
 * Generates 4 concept previews per product, uploads them to Blob, and links
 * them as gallery images.
 *
 *   node --env-file=.env.local scripts/catalog-enhance/02-generate-previews.mjs            # dry run
 *   node --env-file=.env.local scripts/catalog-enhance/02-generate-previews.mjs --apply
 *   ... --limit 5
 *
 * SAFETY
 *  - Uploads only under `catalog/previews/<slug>/`, a namespace nothing else
 *    uses, so no existing asset can be overwritten.
 *  - Never deletes a Blob object.
 *  - Existing product_images rows are preserved; the original image keeps
 *    sortOrder 0 and the generated views are appended after it.
 *  - Re-runnable: a product that already has generated previews is skipped
 *    unless --force is passed.
 */
import { Pool } from "pg"
import { put } from "@vercel/blob"
import { detectArchetype, splitName, subjectOf } from "./lib/archetype.mjs"
import { renderPreviews } from "./lib/preview.mjs"

const APPLY = process.argv.includes("--apply")
const FORCE = process.argv.includes("--force")
const limitArg = process.argv.indexOf("--limit")
const LIMIT = limitArg > -1 ? Number(process.argv[limitArg + 1]) : null

const PREVIEW_PREFIX = "catalog/previews/"
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

/** Matches how the storefront already references private Blob imagery. */
const proxyUrl = (pathname) => `/api/blob-image?pathname=${encodeURIComponent(pathname)}`

function titleCaseWords(s) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase())
}

async function main() {
  const { rows: products } = await pool.query(
    `SELECT p.id, p.slug, p.name, p.tagline, c.name AS category_name
     FROM products p JOIN categories c ON c.id = p."categoryId"
     WHERE p.status = 'published'
     ORDER BY p.id ${LIMIT ? `LIMIT ${Number(LIMIT)}` : ""}`,
  )

  const { rows: existingImages } = await pool.query(
    `SELECT "productId", url, "sortOrder" FROM product_images ORDER BY "productId", "sortOrder"`,
  )
  const imagesByProduct = new Map()
  for (const i of existingImages) {
    if (!imagesByProduct.has(i.productId)) imagesByProduct.set(i.productId, [])
    imagesByProduct.get(i.productId).push(i)
  }

  let generated = 0
  let uploaded = 0
  let linked = 0
  let skipped = 0
  const failures = []

  for (const p of products) {
    const current = imagesByProduct.get(p.id) ?? []
    // The stored URL is the proxy form with an encoded pathname
    // (`?pathname=catalog%2Fpreviews%2F...`), so a raw substring match on
    // "catalog/previews/" never fires and every product looks unprocessed.
    // Decode before comparing.
    const alreadyHasPreviews = current.some((i) => decodeURIComponent(i.url).includes(PREVIEW_PREFIX))
    if (alreadyHasPreviews && !FORCE) {
      skipped++
      continue
    }

    const archetypeId = detectArchetype(p, p.category_name)
    const { brand } = splitName(p.name)
    const subjectTitle = titleCaseWords(subjectOf(p.name, p.tagline))

    const views = renderPreviews({
      id: p.id,
      name: p.name,
      brand,
      subjectTitle,
      archetypeId,
    })
    generated += views.length

    if (!APPLY) continue

    const client = await pool.connect()
    try {
      await client.query("SET default_transaction_read_only = off")
      await client.query("BEGIN")

      // The pre-existing image stays first; generated views follow it.
      let sortOrder = current.length ? Math.max(...current.map((i) => i.sortOrder ?? 0)) + 1 : 1

      for (const [idx, view] of views.entries()) {
        const pathname = `${PREVIEW_PREFIX}${p.slug}/${String(idx + 1).padStart(2, "0")}-${view.label
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")}.svg`

        const blob = await put(pathname, view.svg, {
          access: "private",
          contentType: "image/svg+xml",
          addRandomSuffix: false,
          allowOverwrite: true, // only ever overwrites our own preview namespace
        })
        uploaded++

        await client.query(
          `INSERT INTO product_images ("productId", url, alt, "sortOrder") VALUES ($1, $2, $3, $4)`,
          [p.id, proxyUrl(blob.pathname), view.alt, sortOrder++],
        )
        linked++
      }

      await client.query("COMMIT")
    } catch (e) {
      await client.query("ROLLBACK").catch(() => {})
      failures.push({ id: p.id, slug: p.slug, error: e.message })
    } finally {
      client.release()
    }
  }

  console.log(`published products      : ${products.length}`)
  console.log(`skipped (already done)  : ${skipped}`)
  console.log(`previews generated      : ${generated}`)
  if (APPLY) {
    console.log(`uploaded to Blob        : ${uploaded}`)
    console.log(`gallery rows inserted   : ${linked}`)
    console.log(`failures                : ${failures.length}`)
    for (const f of failures.slice(0, 10)) console.log(`   #${f.id} ${f.slug}: ${f.error}`)
  } else {
    console.log("\nDRY RUN — nothing uploaded or written. Re-run with --apply.")
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => pool.end())

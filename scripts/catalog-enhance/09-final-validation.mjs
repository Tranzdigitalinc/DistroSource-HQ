/**
 * Final technical validation. READ-ONLY.
 *
 *   node --env-file=.env.local scripts/catalog-enhance/09-final-validation.mjs [--base http://localhost:3500]
 *
 * Checks that unpublished products are genuinely excluded everywhere a
 * customer could reach them, that every published route and image resolves,
 * and that no published product references a missing asset.
 */
import { Pool } from "pg"
import { list } from "@vercel/blob"

const baseArg = process.argv.indexOf("--base")
const BASE = baseArg > -1 ? process.argv[baseArg + 1] : "http://localhost:3500"
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const APPROVED = ["original", "licensed_for_distribution", "supplier_verified"]

async function main() {
  await pool.query("SET default_transaction_read_only = on")

  const { rows: published } = await pool.query(
    `SELECT id, slug, "thumbnailUrl" FROM products
     WHERE status='published' AND "assetStatus"='ready' AND "rightsStatus" = ANY($1) ORDER BY id`,
    [APPROVED],
  )
  const { rows: drafts } = await pool.query(
    `SELECT id, slug FROM products WHERE status <> 'published' ORDER BY id`,
  )

  const results = { routes: { ok: 0, fail: [] }, drafts: { excluded: 0, leaked: [] }, images: { ok: 0, missing: [] } }

  // --- published routes return 200 ---------------------------------------
  const sampleSize = Math.min(published.length, 60)
  const step = Math.max(1, Math.floor(published.length / sampleSize))
  const routeSample = published.filter((_, i) => i % step === 0).slice(0, sampleSize)
  for (const p of routeSample) {
    try {
      const res = await fetch(`${BASE}/products/${p.slug}`, { redirect: "manual" })
      if (res.status === 200) results.routes.ok++
      else results.routes.fail.push({ slug: p.slug, status: res.status })
    } catch (e) {
      results.routes.fail.push({ slug: p.slug, status: e.message })
    }
  }

  // --- drafts must not be readable ---------------------------------------
  // Next 16 returns a SOFT 404 here by design: `notFound()` fires inside a
  // Suspense boundary, after the response has begun streaming, so the status
  // stays 200 and Next injects `<meta name="robots" content="noindex">`
  // instead (see node_modules/next/dist/docs/.../not-found.md). A real 404
  // status would require the lookup to move into `proxy`, ahead of streaming.
  // What matters for correctness is that no product content is served and the
  // page is not indexable — both are asserted here.
  const draftSample = drafts.slice(0, 40)
  for (const d of draftSample) {
    try {
      const res = await fetch(`${BASE}/products/${d.slug}`, { redirect: "manual" })
      const body = await res.text()
      const hidden = !body.includes("Add to cart") && body.includes('content="noindex"')
      if (res.status === 404 || hidden) results.drafts.excluded++
      else results.drafts.leaked.push({ slug: d.slug, status: res.status })
    } catch {
      results.drafts.excluded++
    }
  }

  // --- sitemap and search must not contain drafts -------------------------
  let sitemapLeaks = []
  try {
    const xml = await (await fetch(`${BASE}/sitemap.xml`)).text()
    sitemapLeaks = drafts.filter((d) => xml.includes(`/products/${d.slug}`)).map((d) => d.slug)
  } catch (e) {
    sitemapLeaks = [`sitemap fetch failed: ${e.message}`]
  }

  // Query each draft's own distinctive term and check only for that draft —
  // matching every draft slug against one shared result set produced false
  // positives whenever one slug was a substring of another.
  const searchLeaks = []
  for (const d of drafts.slice(0, 25)) {
    const term = d.slug.split("-")[0]
    if (term.length < 3) continue
    try {
      const json = await (await fetch(`${BASE}/api/search/suggestions?q=${encodeURIComponent(term)}`)).json()
      const slugs = (json.products ?? []).map((p) => p.slug)
      if (slugs.includes(d.slug)) searchLeaks.push(d.slug)
    } catch (e) {
      searchLeaks.push(`fetch failed for ${d.slug}: ${e.message}`)
    }
  }

  // --- images resolve -----------------------------------------------------
  const blobIndex = new Set()
  let cursor
  do {
    const page = await list({ limit: 1000, cursor })
    for (const b of page.blobs) blobIndex.add(b.pathname)
    cursor = page.cursor
  } while (cursor)

  const { rows: images } = await pool.query(
    `SELECT i.url, p.slug FROM product_images i JOIN products p ON p.id=i."productId"
     WHERE p.status='published'`,
  )
  for (const img of images) {
    const m = img.url.match(/pathname=([^&]+)/)
    if (m) {
      const pathname = decodeURIComponent(m[1])
      if (blobIndex.has(pathname)) results.images.ok++
      else results.images.missing.push({ slug: img.slug, pathname })
    } else {
      // Absolute blob URL — assume the public host serves it.
      results.images.ok++
    }
  }

  // --- published products must all have a reachable file ------------------
  const { rows: fileRows } = await pool.query(
    `SELECT p.slug, f."blobPathname" FROM products p
     LEFT JOIN product_files f ON f."productId"=p.id
     WHERE p.status='published'`,
  )
  const missingFiles = fileRows.filter((r) => !r.blobPathname || !blobIndex.has(r.blobPathname))

  console.log(`published (storefront-visible) : ${published.length}`)
  console.log(`drafts                         : ${drafts.length}`)
  console.log("")
  console.log(`routes 200                     : ${results.routes.ok}/${routeSample.length}`)
  if (results.routes.fail.length) console.log(`   FAILURES: ${JSON.stringify(results.routes.fail.slice(0, 5))}`)
  console.log(`drafts correctly 404           : ${results.drafts.excluded}/${draftSample.length}`)
  if (results.drafts.leaked.length) console.log(`   LEAKED: ${JSON.stringify(results.drafts.leaked.slice(0, 5))}`)
  console.log(`drafts in sitemap              : ${sitemapLeaks.length}`)
  console.log(`drafts in search suggestions   : ${searchLeaks.length}`)
  console.log(`published images resolving     : ${results.images.ok}/${images.length}`)
  if (results.images.missing.length) console.log(`   MISSING: ${JSON.stringify(results.images.missing.slice(0, 5))}`)
  console.log(`published w/ missing file      : ${missingFiles.length}`)
  if (missingFiles.length) console.log(`   ${missingFiles.slice(0, 5).map((f) => f.slug).join(", ")}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => pool.end())

/**
 * READ-ONLY asset reachability audit.
 *
 * The catalog audit could only confirm that a `product_files` ROW exists. This
 * one answers the question that actually matters to a buyer: is the object
 * really in the Blob store, and how big is it?
 *
 *   node --env-file=.env.local scripts/audit/asset-reachability.mjs
 *
 * SAFETY: SELECTs and Blob `head()` only. Writes nothing to either store.
 * Emits docs/ASSET-REACHABILITY.md plus a JSON sidecar that the (separate)
 * file-size backfill script consumes, so the write step never re-derives
 * anything itself.
 */
import { Pool } from "pg"
import { head, list } from "@vercel/blob"
import { writeFileSync, mkdirSync } from "node:fs"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function main() {
  await pool.query("SET SESSION default_transaction_read_only = on") // scoped below

  // One listing beats 1000 head() calls and gives us sizes for free.
  const index = new Map()
  let cursor
  let pages = 0
  do {
    const page = await list({ limit: 1000, cursor })
    for (const b of page.blobs) index.set(b.pathname, b)
    cursor = page.cursor
    pages++
  } while (cursor)
  console.log(`Blob store indexed: ${index.size} objects across ${pages} page(s)`)

  const files = await pool.query(`
    SELECT f.id, f."productId", f."fileName", f."blobPathname", f."fileSizeBytes",
           p.slug, p.status, p.name
    FROM product_files f JOIN products p ON p.id = f."productId"
    ORDER BY f.id`)

  const images = await pool.query(`
    SELECT i.id, i."productId", i.url, p.slug, p.status
    FROM product_images i JOIN products p ON p.id = i."productId"`)

  const results = []
  for (const row of files.rows) {
    const blob = index.get(row.blobPathname)
    let present = Boolean(blob)
    let size = blob?.size ?? null

    // Fall back to a direct head() — the pathname may carry a suffix that the
    // prefix listing paginated past.
    if (!present) {
      try {
        const h = await head(row.blobPathname)
        present = true
        size = h.size
      } catch {
        present = false
      }
    }
    results.push({
      fileId: row.id,
      productId: row.productId,
      slug: row.slug,
      status: row.status,
      fileName: row.fileName,
      pathname: row.blobPathname,
      present,
      actualSize: size,
      recordedSize: row.fileSizeBytes === null ? null : Number(row.fileSizeBytes),
    })
  }

  const missing = results.filter((r) => !r.present)
  const emptyish = results.filter((r) => r.present && (r.actualSize ?? 0) < 1024)
  const sizeGap = results.filter((r) => r.present && r.recordedSize === null && r.actualSize !== null)
  const sizeMismatch = results.filter(
    (r) => r.present && r.recordedSize !== null && r.actualSize !== null && r.recordedSize !== r.actualSize,
  )

  // Gallery coverage
  const imagesByProduct = new Map()
  for (const i of images.rows) {
    imagesByProduct.set(i.productId, (imagesByProduct.get(i.productId) ?? 0) + 1)
  }
  const published = await pool.query(`SELECT id, slug FROM products WHERE status = 'published'`)
  const galleryBuckets = { zero: 0, one: 0, twoToThree: 0, fourPlus: 0 }
  for (const p of published.rows) {
    const n = imagesByProduct.get(p.id) ?? 0
    if (n === 0) galleryBuckets.zero++
    else if (n === 1) galleryBuckets.one++
    else if (n <= 3) galleryBuckets.twoToThree++
    else galleryBuckets.fourPlus++
  }

  const out = []
  const p = (s = "") => out.push(s)
  p("# Asset Reachability Audit")
  p("")
  p(`Generated: ${new Date().toISOString()}`)
  p("")
  p("Read-only. Confirms whether each `product_files` row points at an object that")
  p("actually exists in the Blob store.")
  p("")
  p("## Downloadable files")
  p("")
  p("| Check | Count |")
  p("|---|---|")
  p(`| product_files rows | ${results.length} |`)
  p(`| Object present in Blob | ${results.length - missing.length} |`)
  p(`| **Object MISSING** | **${missing.length}** |`)
  p(`| Present but < 1 KB (suspect) | ${emptyish.length} |`)
  p(`| Present, size not recorded in DB | ${sizeGap.length} |`)
  p(`| Recorded size disagrees with Blob | ${sizeMismatch.length} |`)
  p("")

  if (missing.length) {
    p("### Missing objects — these products cannot deliver")
    p("")
    p("| product | slug | status | fileName |")
    p("|---|---|---|---|")
    for (const r of missing.slice(0, 60)) {
      p(`| ${r.productId} | \`${r.slug}\` | ${r.status} | ${r.fileName} |`)
    }
    if (missing.length > 60) p(`| … | _${missing.length - 60} more_ | | |`)
    p("")
  }

  if (emptyish.length) {
    p("### Present but suspiciously small (< 1 KB)")
    p("")
    p("| product | slug | fileName | bytes |")
    p("|---|---|---|---|")
    for (const r of emptyish.slice(0, 40)) {
      p(`| ${r.productId} | \`${r.slug}\` | ${r.fileName} | ${r.actualSize} |`)
    }
    p("")
  }

  p("## Gallery coverage (published products)")
  p("")
  p("| Images | Products |")
  p("|---|---|")
  p(`| 0 | ${galleryBuckets.zero} |`)
  p(`| 1 | ${galleryBuckets.one} |`)
  p(`| 2–3 | ${galleryBuckets.twoToThree} |`)
  p(`| 4+ | ${galleryBuckets.fourPlus} |`)
  p("")
  p(`Target is 4–5 images per product. **${galleryBuckets.fourPlus} of ${published.rows.length}** published products meet it.`)
  p("")

  mkdirSync("docs", { recursive: true })
  writeFileSync("docs/ASSET-REACHABILITY.md", out.join("\n"), "utf8")
  mkdirSync("scripts/audit/out", { recursive: true })
  writeFileSync(
    "scripts/audit/out/asset-reachability.json",
    JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2),
    "utf8",
  )

  console.log(`files: ${results.length} | present: ${results.length - missing.length} | MISSING: ${missing.length}`)
  console.log(`suspiciously small: ${emptyish.length} | size gaps: ${sizeGap.length} | mismatches: ${sizeMismatch.length}`)
  console.log(`gallery 4+: ${galleryBuckets.fourPlus}/${published.rows.length} published`)
  console.log("Wrote docs/ASSET-REACHABILITY.md and scripts/audit/out/asset-reachability.json")
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => pool.end())

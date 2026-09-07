// Post-seed verification: every original exists in the database with three
// licences, one image, one version and one file, and its Blob objects are
// really there. Requires DATABASE_URL and BLOB_READ_WRITE_TOKEN.
import { Pool } from "pg"
import { head } from "@vercel/blob"
import { PRODUCTS } from "./catalog.mjs"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const c = await pool.connect()
let bad = 0
try {
  const rows = await c.query(
    `SELECT p.id, p.slug, p.sku, p.status, p."assetStatus", p."coverImageUrl", p."fileSizeMb",
            (SELECT count(*) FROM product_licenses l WHERE l."productId" = p.id) AS licences,
            (SELECT count(*) FROM product_images i WHERE i."productId" = p.id) AS images,
            (SELECT count(*) FROM product_versions v WHERE v."productId" = p.id) AS versions,
            (SELECT "blobPathname" FROM product_files f WHERE f."productId" = p.id LIMIT 1) AS file
       FROM products p WHERE p.sku LIKE 'DS-ORG-%' ORDER BY p.sku`,
  )
  const bySlug = new Map(rows.rows.map((r) => [r.slug, r]))
  for (const p of PRODUCTS) {
    const r = bySlug.get(p.slug)
    const issues = []
    if (!r) issues.push("missing row")
    else {
      if (r.status !== "published" || r.assetStatus !== "ready") issues.push(`status ${r.status}/${r.assetStatus}`)
      if (Number(r.licences) !== 3) issues.push(`${r.licences} licences`)
      if (Number(r.images) !== 1) issues.push(`${r.images} images`)
      if (Number(r.versions) !== 1) issues.push(`${r.versions} versions`)
      if (!r.file) issues.push("no file")
      const imgPath = decodeURIComponent((r.coverImageUrl || "").split("pathname=")[1] || "")
      for (const [label, pathname] of [["cover", imgPath], ["zip", r.file]]) {
        if (!pathname) continue
        try { await head(pathname) } catch { issues.push(`${label} blob missing`) }
      }
    }
    if (issues.length) { bad++; console.log(`✗ ${p.slug}: ${issues.join(", ")}`) }
  }
  console.log(`${rows.rows.length} originals in DB; ${bad ? bad + " with issues" : "all verified"}`)
} finally {
  c.release()
  await pool.end()
}
process.exit(bad ? 1 : 0)

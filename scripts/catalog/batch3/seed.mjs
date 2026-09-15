// Upserts the batch-3 DistroSource Originals into the database: product row,
// three images, three licence tiers, one version and one download file.
// Idempotent by slug. Requires DATABASE_URL and the manifest from upload.mjs.
//
//   node --env-file=.env.local scripts/catalog/batch3/seed.mjs [slug-filter,...]
import fs from "node:fs"
import { Pool } from "pg"
import { PRODUCTS } from "./catalog.mjs"
import { listingFor } from "./listing.mjs"
import { contents } from "./package.mjs"
import { MANIFEST_PATH } from "./upload.mjs"

const filters = process.argv[2]?.split(",").filter(Boolean)
const list = PRODUCTS.filter((p) => !filters || filters.some((f) => p.slug.includes(f)))
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"))
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const client = await pool.connect()
const ALTS = ["cover", "preview", "detail"]

try {
  const cats = await client.query(`SELECT id, slug FROM categories`)
  const categoryId = Object.fromEntries(cats.rows.map((r) => [r.slug, r.id]))
  await client.query("BEGIN")
  let created = 0, updated = 0
  for (const p of list) {
    const entry = manifest[p.slug]
    if (!entry) throw new Error(`No manifest entry for ${p.slug} — run upload.mjs first`)
    if (!categoryId[p.category]) throw new Error(`Unknown category ${p.category}`)
    const L = listingFor(p, contents(p).files, entry.file.fileSizeBytes)

    const existing = await client.query(`SELECT id FROM products WHERE slug = $1`, [p.slug])
    const res = await client.query(
      `INSERT INTO products (
         slug, sku, name, tagline, description, "categoryId", status, "basePrice", "compareAtPrice",
         "thumbnailUrl", "coverImageUrl", "fileFormats", "fileSizeMb", "softwareCompatibility",
         "currentVersion", "includedFiles", documentation, tags, "isFeatured", "isNewRelease",
         "isFree", "isBundle", "seoTitle", "seoDescription", "assetStatus", subcategory, features,
         "searchKeywords", "releaseDate", "sourceType", "rightsStatus", "updatedAt"
       ) VALUES (
         $1, $2, $3, $4, $5, $6, 'published', $7, NULL, $8, $8, $9, $10, $11, '1.0.0', $12, $13, $14,
         false, true, false, false, $15, $16, 'ready', $17, $18, $19, now(), 'distrosource_original', 'original', now()
       )
       ON CONFLICT (slug) DO UPDATE SET
         sku = EXCLUDED.sku, name = EXCLUDED.name, tagline = EXCLUDED.tagline, description = EXCLUDED.description,
         "categoryId" = EXCLUDED."categoryId", status = 'published', "basePrice" = EXCLUDED."basePrice",
         "thumbnailUrl" = EXCLUDED."thumbnailUrl", "coverImageUrl" = EXCLUDED."coverImageUrl",
         "fileFormats" = EXCLUDED."fileFormats", "fileSizeMb" = EXCLUDED."fileSizeMb",
         "softwareCompatibility" = EXCLUDED."softwareCompatibility", "includedFiles" = EXCLUDED."includedFiles",
         documentation = EXCLUDED.documentation, tags = EXCLUDED.tags, "isNewRelease" = true,
         "seoTitle" = EXCLUDED."seoTitle", "seoDescription" = EXCLUDED."seoDescription", "assetStatus" = 'ready',
         subcategory = EXCLUDED.subcategory, features = EXCLUDED.features, "searchKeywords" = EXCLUDED."searchKeywords",
         "sourceType" = 'distrosource_original', "rightsStatus" = 'original', "updatedAt" = now()
       RETURNING id`,
      [p.slug, p.sku, p.name, p.tagline, L.description, categoryId[p.category], p.prices[0], entry.images[0], L.fileFormats, L.fileSizeMb, L.softwareCompatibility, L.includedFiles, L.documentation, L.tags, L.seoTitle, L.seoDescription, p.subcategory, L.features, L.searchKeywords],
    )
    const id = res.rows[0].id
    existing.rows.length ? updated++ : created++

    await client.query(`DELETE FROM product_images WHERE "productId" = $1`, [id])
    for (const [i, url] of entry.images.entries()) {
      await client.query(`INSERT INTO product_images ("productId", url, alt, "sortOrder") VALUES ($1, $2, $3, $4)`, [id, url, `${p.name} — ${ALTS[i]}`, i])
    }

    await client.query(`DELETE FROM product_licenses WHERE "productId" = $1`, [id])
    for (const [i, [tier, text]] of p.licences.entries()) {
      await client.query(`INSERT INTO product_licenses ("productId", "licenseType", price, description, "sortOrder") VALUES ($1, $2, $3, $4, $5)`, [id, tier, p.prices[i], text, i])
    }

    await client.query(`DELETE FROM product_versions WHERE "productId" = $1`, [id])
    await client.query(`INSERT INTO product_versions ("productId", version, changelog, "releasedAt") VALUES ($1, '1.0.0', $2, now())`, [id, L.changelog])

    await client.query(`DELETE FROM product_files WHERE "productId" = $1`, [id])
    await client.query(`INSERT INTO product_files ("productId", "fileName", "blobPathname", "fileSizeBytes", "fileType", "sortOrder") VALUES ($1, $2, $3, $4, 'zip', 0)`, [id, entry.file.fileName, entry.file.blobPathname, entry.file.fileSizeBytes])
  }
  await client.query("COMMIT")
  console.log(`Seeded ${list.length} batch-3 originals (${created} created, ${updated} updated).`)
} catch (e) {
  await client.query("ROLLBACK")
  throw e
} finally {
  client.release()
  await pool.end()
}

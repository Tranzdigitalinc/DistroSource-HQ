// Idempotent seed runner for the 200-product batch-2 catalog expansion.
// Categories already exist (batch2 products map onto the existing category
// set — no new categories are created). Upserts products by slug and
// replaces child rows deterministically so reruns never duplicate data.
import fs from "node:fs"
import path from "node:path"
import { Pool } from "pg"
import { PRODUCTS } from "./products-batch2.mjs"

const MANIFEST_PATH = path.resolve(".v0/catalog-batch2-seed-manifest.json")
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"))
  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    const catRes = await client.query(`SELECT id, slug FROM categories`)
    const categoryIdBySlug = {}
    for (const row of catRes.rows) categoryIdBySlug[row.slug] = row.id

    let created = 0
    let updated = 0
    for (const product of PRODUCTS) {
      const entry = manifest[product.slug]
      if (!entry) throw new Error(`No manifest entry for ${product.slug} — run upload-batch2.mjs first.`)

      const categoryId = categoryIdBySlug[product.category]
      if (!categoryId) throw new Error(`Unknown category slug ${product.category} for ${product.slug}`)

      const existing = await client.query(`SELECT id FROM products WHERE slug = $1`, [product.slug])
      const isNew = existing.rows.length === 0

      const seoTitle = `${product.name} | DistroSource`
      const seoDescription = product.tagline
      const searchKeywords = Array.from(
        new Set([
          ...product.tags,
          product.subcategory.toLowerCase(),
          ...product.name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean),
        ]),
      )

      const res = await client.query(
        `INSERT INTO products (
           slug, sku, name, tagline, description, "categoryId", status, "basePrice", "compareAtPrice",
           "thumbnailUrl", "coverImageUrl", "fileFormats", "fileSizeMb", "softwareCompatibility",
           "currentVersion", "includedFiles", documentation, tags, "isFeatured", "isNewRelease",
           "isFree", "isBundle", "seoTitle", "seoDescription", "assetStatus", subcategory, features,
           "searchKeywords", "releaseDate", "updatedAt"
         ) VALUES (
           $1, $2, $3, $4, $5, $6, 'published', $7, $8, $9, $9, $10, $11, $12, $13, $14,
           'Full documentation and setup instructions are included in the download.',
           $15, $16, $17, $18, $19, $20, $21, 'ready', $22, $23, $24, now(), now()
         )
         ON CONFLICT (slug) DO UPDATE SET
           sku = EXCLUDED.sku, name = EXCLUDED.name, tagline = EXCLUDED.tagline, description = EXCLUDED.description,
           "categoryId" = EXCLUDED."categoryId", status = 'published', "basePrice" = EXCLUDED."basePrice",
           "compareAtPrice" = EXCLUDED."compareAtPrice", "thumbnailUrl" = EXCLUDED."thumbnailUrl",
           "coverImageUrl" = EXCLUDED."coverImageUrl", "fileFormats" = EXCLUDED."fileFormats",
           "fileSizeMb" = EXCLUDED."fileSizeMb", "softwareCompatibility" = EXCLUDED."softwareCompatibility",
           "currentVersion" = EXCLUDED."currentVersion", "includedFiles" = EXCLUDED."includedFiles",
           tags = EXCLUDED.tags, "isFeatured" = EXCLUDED."isFeatured", "isNewRelease" = EXCLUDED."isNewRelease",
           "isFree" = EXCLUDED."isFree", "isBundle" = EXCLUDED."isBundle", "seoTitle" = EXCLUDED."seoTitle",
           "seoDescription" = EXCLUDED."seoDescription", "assetStatus" = 'ready', subcategory = EXCLUDED.subcategory,
           features = EXCLUDED.features, "searchKeywords" = EXCLUDED."searchKeywords", "updatedAt" = now()
         RETURNING id`,
        [
          product.slug,
          product.sku,
          product.name,
          product.tagline,
          product.description,
          categoryId,
          product.basePrice,
          product.compareAtPrice,
          entry.imageUrl,
          product.fileFormats,
          product.fileSizeMb,
          product.softwareCompatibility,
          product.version,
          product.includedFiles,
          product.tags,
          product.isFeatured,
          product.isNewRelease,
          product.isFree,
          product.isBundle,
          seoTitle,
          seoDescription,
          product.subcategory,
          product.features,
          searchKeywords,
        ],
      )
      const productId = res.rows[0].id
      isNew ? created++ : updated++

      await client.query(`DELETE FROM product_images WHERE "productId" = $1`, [productId])
      await client.query(
        `INSERT INTO product_images ("productId", url, alt, "sortOrder") VALUES ($1, $2, $3, 0)`,
        [productId, entry.imageUrl, product.name],
      )

      await client.query(`DELETE FROM product_licenses WHERE "productId" = $1`, [productId])
      await client.query(
        `INSERT INTO product_licenses ("productId", "licenseType", price, description, "sortOrder")
         VALUES ($1, 'personal', $2, 'Use in a single end product for yourself or one client.', 0)`,
        [productId, product.basePrice],
      )

      await client.query(`DELETE FROM product_versions WHERE "productId" = $1`, [productId])
      await client.query(
        `INSERT INTO product_versions ("productId", version, changelog, "releasedAt") VALUES ($1, $2, $3, now())`,
        [productId, product.version, product.changelog],
      )

      await client.query(`DELETE FROM product_files WHERE "productId" = $1`, [productId])
      await client.query(
        `INSERT INTO product_files ("productId", "fileName", "blobPathname", "fileSizeBytes", "fileType", "sortOrder")
         VALUES ($1, $2, $3, $4, 'zip', 0)`,
        [productId, entry.file.fileName, entry.file.blobPathname, entry.file.fileSizeBytes],
      )
    }

    await client.query("COMMIT")
    console.log(`Seeded ${PRODUCTS.length} batch-2 products (${created} created, ${updated} updated).`)
  } catch (err) {
    await client.query("ROLLBACK")
    throw err
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

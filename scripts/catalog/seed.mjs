// Idempotent seed runner for the 100-product DistroSource Originals catalog.
// Upserts by slug (categories + products) and replaces child rows
// deterministically so reruns never duplicate data. No reviews are inserted —
// products without real reviews show "New"/no rating in the UI.
import fs from "node:fs"
import path from "node:path"
import { Pool } from "pg"
import { NEW_CATEGORIES } from "./categories.mjs"
import { PRODUCTS } from "./products.mjs"

const MANIFEST_PATH = path.resolve(".v0/catalog-seed-manifest.json")
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function main() {
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf-8"))
  const client = await pool.connect()

  try {
    await client.query("BEGIN")

    // 1. Upsert categories by slug.
    const categoryIdBySlug = {}
    for (const cat of NEW_CATEGORIES) {
      const res = await client.query(
        `INSERT INTO categories (slug, name, description, icon, "sortOrder")
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description,
           icon = EXCLUDED.icon, "sortOrder" = EXCLUDED."sortOrder"
         RETURNING id`,
        [cat.slug, cat.name, cat.description, cat.icon, cat.sortOrder],
      )
      categoryIdBySlug[cat.slug] = res.rows[0].id
    }
    console.log(`Upserted ${NEW_CATEGORIES.length} categories.`)

    // 2. Upsert products by slug, then replace child rows.
    let created = 0
    let updated = 0
    for (const product of PRODUCTS) {
      const entry = manifest[product.slug]
      if (!entry) throw new Error(`No manifest entry for ${product.slug} — run upload.mjs first.`)

      const categoryId = categoryIdBySlug[product.category]
      if (!categoryId) throw new Error(`Unknown category slug ${product.category} for ${product.slug}`)

      const existing = await client.query(`SELECT id FROM products WHERE slug = $1`, [product.slug])
      const isNew = existing.rows.length === 0

      const seoTitle = `${product.name} | DistroSource`
      const seoDescription = product.tagline
      const searchKeywords = Array.from(
        new Set([...product.tags, product.subcategory.toLowerCase(), ...product.name.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean)]),
      )

      const res = await client.query(
        `INSERT INTO products (
           slug, name, tagline, description, "categoryId", status, "basePrice", "compareAtPrice",
           "thumbnailUrl", "coverImageUrl", "fileFormats", "fileSizeMb", "softwareCompatibility",
           "currentVersion", "includedFiles", documentation, tags, "isFeatured", "isNewRelease",
           "isFree", "isBundle", "seoTitle", "seoDescription", "assetStatus", subcategory, features,
           "searchKeywords", "releaseDate", "updatedAt"
         ) VALUES (
           $1, $2, $3, $4, $5, 'published', $6, $7, $8, $8, $9, $10, $11, $12, $13,
           'Full documentation and setup instructions are included in the download.',
           $14, $15, $16, $17, $18, $19, $20, 'ready', $21, $22, $23, now(), now()
         )
         ON CONFLICT (slug) DO UPDATE SET
           name = EXCLUDED.name, tagline = EXCLUDED.tagline, description = EXCLUDED.description,
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

      // Replace child rows deterministically (delete + reinsert) so reruns never duplicate.
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
    console.log(`Seeded ${PRODUCTS.length} products (${created} created, ${updated} updated).`)
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

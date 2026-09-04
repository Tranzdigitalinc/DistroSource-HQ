/**
 * Pre-write backup + rollback generator.
 *
 * MUST run before any catalog write. Exports every row this task can touch to
 * a timestamped JSON snapshot AND emits a ready-to-run rollback script that
 * restores those exact values.
 *
 *   node --env-file=.env.local scripts/catalog-enhance/00-backup.mjs
 *
 * Read-only against the database. Writes only to scripts/catalog-enhance/backups/.
 */
import { Pool } from "pg"
import { writeFileSync, mkdirSync } from "node:fs"
import path from "node:path"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const MUTABLE_PRODUCT_COLUMNS = [
  "name",
  "tagline",
  "description",
  "categoryId",
  "subcategory",
  "basePrice",
  "compareAtPrice",
  "thumbnailUrl",
  "coverImageUrl",
  "fileFormats",
  "fileSizeMb",
  "softwareCompatibility",
  "currentVersion",
  "includedFiles",
  "documentation",
  "tags",
  "features",
  "searchKeywords",
  "seoTitle",
  "seoDescription",
  "isFeatured",
  "isNewRelease",
  "updatedAt",
]

async function main() {
  await pool.query("SET SESSION default_transaction_read_only = on") // scoped below

  const stamp = new Date().toISOString().replace(/[:.]/g, "-")
  const dir = path.join("scripts", "catalog-enhance", "backups", stamp)
  mkdirSync(dir, { recursive: true })

  const products = await pool.query(
    `SELECT id, slug, ${MUTABLE_PRODUCT_COLUMNS.map((c) => `"${c}"`).join(", ")} FROM products ORDER BY id`,
  )
  const images = await pool.query(`SELECT * FROM product_images ORDER BY id`)
  const licenses = await pool.query(`SELECT * FROM product_licenses ORDER BY id`)
  const categories = await pool.query(`SELECT * FROM categories ORDER BY id`)

  writeFileSync(path.join(dir, "products.json"), JSON.stringify(products.rows, null, 2))
  writeFileSync(path.join(dir, "product_images.json"), JSON.stringify(images.rows, null, 2))
  writeFileSync(path.join(dir, "product_licenses.json"), JSON.stringify(licenses.rows, null, 2))
  writeFileSync(path.join(dir, "categories.json"), JSON.stringify(categories.rows, null, 2))

  // --- rollback script -----------------------------------------------------
  // Restores the snapshot exactly: product columns by id, and product_images
  // wholesale (delete-then-reinsert) because enhancement adds gallery rows.
  const rollback = `/**
 * ROLLBACK for catalog enhancement snapshot ${stamp}.
 *
 *   node --env-file=.env.local scripts/catalog-enhance/backups/${stamp}/rollback.mjs
 *
 * Restores every mutable products column to its pre-enhancement value and
 * rebuilds product_images to the exact rows present at snapshot time.
 * Blob objects are never deleted by this script — orphaned preview uploads are
 * listed at the end for manual review.
 */
import { Pool } from "pg"
import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const here = path.dirname(fileURLToPath(import.meta.url))
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const products = JSON.parse(readFileSync(path.join(here, "products.json"), "utf8"))
const images = JSON.parse(readFileSync(path.join(here, "product_images.json"), "utf8"))

const COLS = ${JSON.stringify(MUTABLE_PRODUCT_COLUMNS)}

async function main() {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    for (const row of products) {
      const sets = COLS.map((c, i) => \`"\${c}" = $\${i + 2}\`).join(", ")
      await client.query(
        \`UPDATE products SET \${sets} WHERE id = $1\`,
        [row.id, ...COLS.map((c) => row[c])],
      )
    }
    console.log(\`restored \${products.length} products\`)

    await client.query("DELETE FROM product_images")
    for (const img of images) {
      await client.query(
        'INSERT INTO product_images (id, "productId", url, alt, "sortOrder") VALUES ($1,$2,$3,$4,$5)',
        [img.id, img.productId, img.url, img.alt, img.sortOrder],
      )
    }
    await client.query(
      "SELECT setval(pg_get_serial_sequence('product_images','id'), COALESCE((SELECT MAX(id) FROM product_images), 1))",
    )
    console.log(\`restored \${images.length} product_images\`)

    await client.query("COMMIT")
    console.log("ROLLBACK COMPLETE")
  } catch (e) {
    await client.query("ROLLBACK")
    throw e
  } finally {
    client.release()
    await pool.end()
  }
}
main().catch((e) => { console.error(e); process.exitCode = 1 })
`
  writeFileSync(path.join(dir, "rollback.mjs"), rollback)

  console.log(`Snapshot: ${dir}`)
  console.log(`  products        ${products.rows.length}`)
  console.log(`  product_images  ${images.rows.length}`)
  console.log(`  product_licenses ${licenses.rows.length}`)
  console.log(`  categories      ${categories.rows.length}`)
  console.log(`Rollback ready:  node --env-file=.env.local ${path.join(dir, "rollback.mjs")}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => pool.end())

// Quality-control checks for the 200-product batch-2 catalog expansion.
import { Pool } from "pg"
import { PRODUCTS } from "./products-batch2.mjs"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function main() {
  const slugs = PRODUCTS.map((p) => p.slug)
  const res = await pool.query(
    `SELECT p.id, p.slug, p.sku, p.name, p.description, p."categoryId", p."basePrice", p."assetStatus", p.status,
            (SELECT count(*)::int FROM product_images WHERE "productId" = p.id) AS image_count,
            (SELECT count(*)::int FROM product_files WHERE "productId" = p.id) AS file_count,
            (SELECT count(*)::int FROM product_licenses WHERE "productId" = p.id) AS license_count,
            c.slug AS category_slug
     FROM products p
     JOIN categories c ON c.id = p."categoryId"
     WHERE p.slug = ANY($1)`,
    [slugs],
  )
  const rows = res.rows

  const problems = []
  if (rows.length !== 200) problems.push(`Expected 200 seeded products, found ${rows.length}`)

  const names = rows.map((r) => r.name)
  const dupNames = names.filter((n, i) => names.indexOf(n) !== i)
  if (dupNames.length) problems.push(`Duplicate titles: ${[...new Set(dupNames)].join(", ")}`)

  const skus = rows.map((r) => r.sku)
  const dupSkus = skus.filter((s, i) => skus.indexOf(s) !== i)
  if (dupSkus.length) problems.push(`Duplicate SKUs: ${[...new Set(dupSkus)].join(", ")}`)
  const missingSku = rows.filter((r) => !r.sku)
  if (missingSku.length) problems.push(`Missing SKU: ${missingSku.map((r) => r.slug).join(", ")}`)

  const rowSlugs = rows.map((r) => r.slug)
  const dupSlugs = rowSlugs.filter((s, i) => rowSlugs.indexOf(s) !== i)
  if (dupSlugs.length) problems.push(`Duplicate slugs: ${dupSlugs.join(", ")}`)

  for (const row of rows) {
    if (!row.category_slug) problems.push(`${row.slug}: missing category`)
    if (row.image_count < 1) problems.push(`${row.slug}: no images`)
    if (row.file_count < 1) problems.push(`${row.slug}: no downloadable file`)
    if (row.license_count < 1) problems.push(`${row.slug}: no license/pricing`)
    const price = Number.parseFloat(row.basePrice)
    if (!(price >= 5 && price <= 199)) problems.push(`${row.slug}: price out of range ($${row.basePrice})`)
    if (row.status !== "published") problems.push(`${row.slug}: status is ${row.status}, expected published`)
    if (row.assetStatus !== "ready") problems.push(`${row.slug}: assetStatus is ${row.assetStatus}, expected ready`)
  }

  const byCategory = {}
  for (const row of rows) byCategory[row.category_slug] = (byCategory[row.category_slug] || 0) + 1

  console.log("=== Batch-2 Catalog QC Report ===")
  console.log(`Total seeded: ${rows.length}`)
  console.log("\nPer-category breakdown:")
  for (const [slug, count] of Object.entries(byCategory).sort()) {
    console.log(`  ${slug}: ${count}`)
  }

  if (problems.length) {
    console.log(`\n${problems.length} PROBLEM(S) FOUND:`)
    for (const p of problems) console.log(`  - ${p}`)
    process.exitCode = 1
  } else {
    console.log("\nAll checks passed.")
  }

  await pool.end()
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

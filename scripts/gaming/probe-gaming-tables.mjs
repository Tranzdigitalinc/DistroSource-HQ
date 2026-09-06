/**
 * Read-only: what is actually inside gaming_products, gaming_product_images
 * and gaming_categories in production, and how it relates to the code-backed
 * catalogue in lib/gaming/products.ts.
 *
 * Run from the repo root:  node --env-file=.env.local scripts/gaming/probe-gaming-tables.mjs
 */
import { Pool } from "pg"
import { readFileSync } from "node:fs"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const client = await pool.connect()
const q = async (label, sql) => {
  try {
    return (await client.query(sql)).rows
  } catch (e) {
    return { error: `${label}: ${e.message}` }
  }
}
const show = (label, rows, fmt) => {
  console.log(`\n=== ${label}`)
  if (!Array.isArray(rows)) return console.log("  " + rows.error)
  if (rows.length === 0) return console.log("  (none)")
  for (const r of rows) console.log("  " + fmt(r))
}

try {
  await client.query("SET SESSION default_transaction_read_only = on")

  const cols = await q(
    "columns",
    `SELECT table_name, column_name, data_type, is_nullable
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND table_name IN ('gaming_products','gaming_product_images','gaming_categories')
     ORDER BY table_name, ordinal_position`,
  )
  show("column shapes", cols, (r) => `${r.table_name}.${r.column_name}  ${r.data_type}${r.is_nullable === "NO" ? "  NOT NULL" : ""}`)

  const counts = await q(
    "counts",
    `SELECT (SELECT count(*)::int FROM gaming_products) AS products,
            (SELECT count(*)::int FROM gaming_product_images) AS images,
            (SELECT count(*)::int FROM gaming_categories) AS categories`,
  )
  show("row counts", counts, (r) => JSON.stringify(r))

  const products = await q("products", `SELECT * FROM gaming_products ORDER BY 1 LIMIT 60`)
  if (Array.isArray(products) && products.length) {
    console.log("\n=== gaming_products columns present on rows:", Object.keys(products[0]).join(", "))
  }
  show("gaming_products (slug / title / published?)", products, (r) => {
    const slug = r.slug ?? "?"
    const title = r.title ?? r.name ?? "?"
    const pub = r.published ?? r.is_published ?? r.status ?? ""
    return `${String(r.id).padStart(3)}  ${slug}  —  ${title}  ${pub !== "" ? `[${pub}]` : ""}`
  })

  const images = await q("images", `SELECT * FROM gaming_product_images ORDER BY 1 LIMIT 40`)
  if (Array.isArray(images) && images.length) {
    console.log("\n=== gaming_product_images columns present on rows:", Object.keys(images[0]).join(", "))
  }
  show("gaming_product_images", images, (r) => JSON.stringify(r))

  const cats = await q("categories", `SELECT * FROM gaming_categories ORDER BY 1 LIMIT 40`)
  show("gaming_categories", cats, (r) => JSON.stringify(r))

  // Overlap with the code-backed catalogue this branch ships.
  const src = readFileSync("lib/gaming/products.ts", "utf8")
  const mine = new Set([...src.matchAll(/\n    slug: "([a-z0-9-]+)"/g)].map((m) => m[1]))
  const dbSlugs = Array.isArray(products) ? products.map((r) => r.slug).filter(Boolean) : []
  const overlap = dbSlugs.filter((s) => mine.has(s))
  console.log(`\n=== overlap: code catalogue has ${mine.size} slugs, DB has ${dbSlugs.length}; slugs in BOTH: ${overlap.length}`)
  if (overlap.length) console.log("  " + overlap.join("\n  "))
} finally {
  client.release()
  await pool.end()
}

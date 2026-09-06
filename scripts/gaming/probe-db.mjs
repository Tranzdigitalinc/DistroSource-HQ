/**
 * Read-only audit of production for Gaming imagery work.
 *
 * Answers, without writing anything:
 *   - do the gaming_* tables declared in lib/db/schema.ts exist in Postgres?
 *   - what shape is product_images, and how many rows does it hold?
 *   - do any rows in products look like Gaming products?
 *
 * The session is forced read-only before any query. The connection string
 * is never printed.
 *
 * Run from the repo root:  node --env-file=.env.local scripts/gaming/probe-db.mjs
 */
import { Pool } from "pg"

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set")
  process.exit(1)
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const client = await pool.connect()

async function q(label, sql) {
  try {
    const r = await client.query(sql)
    return r.rows
  } catch (e) {
    return { error: `${label}: ${e.code ?? ""} ${e.message}`.trim() }
  }
}

try {
  await client.query("SET SESSION default_transaction_read_only = on")

  const gamingTables = await q(
    "gaming tables",
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name ILIKE '%gaming%' ORDER BY 1`,
  )
  const imgCols = await q(
    "product_images columns",
    `SELECT column_name, data_type FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'product_images' ORDER BY ordinal_position`,
  )
  const counts = await q(
    "counts",
    `SELECT (SELECT count(*)::int FROM products) AS products,
            (SELECT count(*)::int FROM product_images) AS product_images`,
  )
  const gamingLike = await q(
    "gaming-like products",
    `SELECT id, slug, name FROM products
     WHERE slug ILIKE ANY (ARRAY['%mlo%','%fivem%','%minecraft%','%gaming%','%tebex%','%eup%','%anticheat%'])
     ORDER BY id LIMIT 20`,
  )
  const tableList = await q(
    "all tables",
    `SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY 1`,
  )

  console.log("=== gaming_* tables in production:")
  console.log(Array.isArray(gamingTables) ? (gamingTables.length ? gamingTables.map((r) => "  " + r.table_name).join("\n") : "  (none)") : "  " + gamingTables.error)
  console.log("\n=== product_images shape:")
  console.log(Array.isArray(imgCols) ? imgCols.map((r) => `  ${r.column_name}: ${r.data_type}`).join("\n") : "  " + imgCols.error)
  console.log("\n=== row counts:")
  console.log(Array.isArray(counts) ? "  " + JSON.stringify(counts[0]) : "  " + counts.error)
  console.log("\n=== products that look like Gaming (slug match):")
  console.log(Array.isArray(gamingLike) ? (gamingLike.length ? gamingLike.map((r) => `  #${r.id} ${r.slug}`).join("\n") : "  (none)") : "  " + gamingLike.error)
  console.log("\n=== all public tables:")
  console.log(Array.isArray(tableList) ? "  " + tableList.map((r) => r.table_name).join(", ") : "  " + tableList.error)
} finally {
  client.release()
  await pool.end()
}

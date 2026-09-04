/**
 * READ-ONLY schema drift audit: production database vs lib/db/schema.ts.
 *
 *   node --env-file=.env.local scripts/audit/schema-drift.mjs
 *
 * SAFETY
 *   - Sets default_transaction_read_only = on.
 *   - Reads information_schema / pg_catalog only. No DDL, no drizzle-kit push.
 *
 * Writes docs/SCHEMA-DRIFT.md.
 */
import { Pool } from "pg"
import { writeFileSync, mkdirSync } from "node:fs"
import * as schema from "../../lib/db/schema.ts"

const connectionString = process.env.DATABASE_URL
if (!connectionString) {
  console.error("DATABASE_URL is not set.")
  process.exit(1)
}
const pool = new Pool({ connectionString })

async function q(sql, params = []) {
  const { rows } = await pool.query(sql, params)
  return rows
}

async function main() {
  await pool.query("SET SESSION default_transaction_read_only = on") // scoped below

  // Reflect what schema.ts declares, via Drizzle's table symbols.
  const expected = new Map()
  for (const value of Object.values(schema)) {
    if (!value || typeof value !== "object") continue
    const sym = Object.getOwnPropertySymbols(value).find((s) => s.description?.includes("Name"))
    const name = sym ? value[sym] : undefined
    if (typeof name !== "string") continue
    const cols = {}
    for (const [, col] of Object.entries(value)) {
      if (col && typeof col === "object" && "name" in col && "columnType" in col) {
        cols[col.name] = { type: col.columnType, notNull: col.notNull, hasDefault: col.hasDefault }
      }
    }
    if (Object.keys(cols).length) expected.set(name, cols)
  }

  const dbTables = await q(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE' ORDER BY 1`)
  const dbTableNames = new Set(dbTables.map((r) => r.table_name))

  const dbColumns = await q(`
    SELECT table_name, column_name, data_type, is_nullable, column_default
    FROM information_schema.columns WHERE table_schema = 'public' ORDER BY 1, 2`)
  const byTable = new Map()
  for (const c of dbColumns) {
    if (!byTable.has(c.table_name)) byTable.set(c.table_name, new Map())
    byTable.get(c.table_name).set(c.column_name, c)
  }

  const indexes = await q(`
    SELECT tablename, indexname, indexdef FROM pg_indexes
    WHERE schemaname='public' ORDER BY 1,2`)
  const constraints = await q(`
    SELECT tc.table_name, tc.constraint_name, tc.constraint_type
    FROM information_schema.table_constraints tc
    WHERE tc.table_schema='public' AND tc.constraint_type IN ('UNIQUE','PRIMARY KEY','FOREIGN KEY','CHECK')
    ORDER BY 1,3,2`)

  const out = []
  const p = (s = "") => out.push(s)
  p("# Schema Drift — production vs lib/db/schema.ts")
  p("")
  p(`Generated: ${new Date().toISOString()}`)
  p("")
  p("Read-only introspection. Nothing was altered.")
  p("")

  const missingTables = [...expected.keys()].filter((t) => !dbTableNames.has(t))
  const extraTables = [...dbTableNames].filter((t) => !expected.has(t) && t !== "__drizzle_migrations")

  p("## Tables")
  p("")
  p(`Declared in schema.ts: ${expected.size} · Present in database: ${dbTableNames.size}`)
  p("")
  p(`**In schema.ts but MISSING from production (${missingTables.length}):**`)
  p(missingTables.length ? missingTables.map((t) => `- \`${t}\``).join("\n") : "- none")
  p("")
  p(`**In production but NOT in schema.ts (${extraTables.length}):**`)
  p(extraTables.length ? extraTables.map((t) => `- \`${t}\``).join("\n") : "- none")
  p("")

  p("## Columns")
  p("")
  let colDrift = 0
  for (const [table, cols] of expected) {
    if (!dbTableNames.has(table)) continue
    const dbCols = byTable.get(table) ?? new Map()
    const missing = Object.keys(cols).filter((c) => !dbCols.has(c))
    const extra = [...dbCols.keys()].filter((c) => !(c in cols))
    const nullMismatch = Object.entries(cols)
      .filter(([name, def]) => dbCols.has(name) && def.notNull === (dbCols.get(name).is_nullable === "YES"))
      .map(([name, def]) => `${name} (schema notNull=${def.notNull}, db nullable=${dbCols.get(name).is_nullable})`)

    if (missing.length || extra.length || nullMismatch.length) {
      colDrift++
      p(`### \`${table}\``)
      p("")
      if (missing.length) p(`- **Missing in production:** ${missing.map((c) => `\`${c}\``).join(", ")}`)
      if (extra.length) p(`- **Extra in production (not in schema.ts):** ${extra.map((c) => `\`${c}\``).join(", ")}`)
      if (nullMismatch.length) p(`- **Nullability mismatch:** ${nullMismatch.join("; ")}`)
      p("")
    }
  }
  if (!colDrift) {
    p("No column-level drift detected.")
    p("")
  }

  // Constraints/indexes the audit recommended.
  p("## Constraints and indexes")
  p("")
  const uniq = new Set(constraints.filter((c) => c.constraint_type === "UNIQUE").map((c) => c.constraint_name))
  const idxDefs = indexes.map((i) => i.indexdef.toLowerCase())
  const wanted = [
    ["entitlements", 'unique ("orderId", "orderItemId")', /entitlements.*unique.*orderid.*orderitemid/],
    ["orders", 'unique ("polarCheckoutId")', /orders.*unique.*polarcheckoutid/],
    ["orders", 'unique ("polarOrderId")', /orders.*unique.*polarorderid/],
    ["orders", 'unique ("paypalOrderId")', /orders.*unique.*paypalorderid/],
    ["cart_items", 'unique ("userId","productId","licenseId")', /cart_items.*unique.*userid/],
    ["entitlements", 'index ("userId")', /on public\.entitlements.*\("?userid"?\)/],
    ["orders", 'index ("userId")', /on public\.orders.*\("?userid"?\)/],
    ["order_items", 'index ("orderId")', /on public\.order_items.*\("?orderid"?\)/],
    ["download_events", 'index ("userId")', /on public\.download_events.*\("?userid"?\)/],
  ]
  p("| Table | Recommended | Present? |")
  p("|---|---|---|")
  for (const [table, label, re] of wanted) {
    const present = idxDefs.some((d) => re.test(d))
    p(`| ${table} | ${label} | ${present ? "yes" : "**NO**"} |`)
  }
  p("")
  p(`Total unique constraints in database: ${uniq.size}`)
  p(`Total indexes in database: ${indexes.length}`)
  p("")

  p("## Baseline verdict")
  p("")
  if (!missingTables.length && !extraTables.length && !colDrift) {
    p("**Schema matches `schema.ts`. Safe to baseline** per docs/DATABASE-MIGRATIONS.md.")
  } else {
    p("**DO NOT baseline yet.** Drift is listed above. Reconcile each item —")
    p("decide whether `schema.ts` is wrong or production is behind — before")
    p("generating migration `0000`. Baselining over drift means the next")
    p("generated migration will contain unintended DDL, possibly against live")
    p("order data.")
  }
  p("")

  mkdirSync("docs", { recursive: true })
  writeFileSync("docs/SCHEMA-DRIFT.md", out.join("\n"), "utf8")
  console.log(`Tables: expected ${expected.size}, in db ${dbTableNames.size}`)
  console.log(`Missing tables: ${missingTables.length} | Extra tables: ${extraTables.length} | Tables with column drift: ${colDrift}`)
  console.log("Report written to docs/SCHEMA-DRIFT.md")
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => pool.end())

// Applies scripts/db/add-gaming-tebex.sql with the app's own role. The role
// usually cannot run DDL (that is an owner job in the Neon console), so this
// reports clearly rather than failing obscurely. Safe to rerun.
//
//   node --env-file=.env.local scripts/db/add-gaming-tebex.mjs
import fs from "node:fs"
import path from "node:path"
import { Pool } from "pg"

const sql = fs.readFileSync(path.join(import.meta.dirname, "add-gaming-tebex.sql"), "utf8")
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const client = await pool.connect()
try {
  await client.query(sql)
  const { rows } = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'gaming_subscriptions' AND column_name IN ('provider','tebexRecurringReference')
    ORDER BY column_name`)
  console.log(`gaming_subscriptions now has: ${rows.map((r) => r.column_name).join(", ")}`)
  console.log("Migration complete.")
} catch (error) {
  const permission = error?.code === "42501"
  console.error(permission ? "The app's database role may not run DDL." : "Migration failed.", error?.message ?? error)
  if (permission) console.error("Run scripts/db/add-gaming-tebex.sql as the owner in the Neon SQL editor, then rerun the app.")
  process.exitCode = 1
} finally {
  client.release()
  await pool.end()
}

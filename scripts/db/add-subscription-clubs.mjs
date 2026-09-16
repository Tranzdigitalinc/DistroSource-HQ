// Applies scripts/db/add-subscription-clubs.sql with the app's own role.
// The role usually cannot run DDL (that is an owner job in the Neon console),
// so this reports clearly rather than failing obscurely. Safe to rerun.
//
//   node --env-file=.env.local scripts/db/add-subscription-clubs.mjs
import fs from "node:fs"
import path from "node:path"
import { Pool } from "pg"

const sql = fs.readFileSync(path.join(import.meta.dirname, "add-subscription-clubs.sql"), "utf8")
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const client = await pool.connect()
try {
  await client.query(sql)
  const { rows } = await client.query(`
    SELECT column_name FROM information_schema.columns
    WHERE table_name = 'membership_plans' AND column_name IN ('kind','scopeCategorySlugs','fungiesProductId','fungiesPlanId','gamingClaims')
    ORDER BY column_name`)
  console.log(`membership_plans now has: ${rows.map((r) => r.column_name).join(", ")}`)
  console.log("Migration complete.")
} catch (error) {
  const permission = error?.code === "42501"
  console.error(permission ? "The app's database role may not run DDL." : "Migration failed.", error?.message ?? error)
  if (permission) console.error("Run scripts/db/add-subscription-clubs.sql as the owner in the Neon SQL editor, then rerun the seed.")
  process.exitCode = 1
} finally {
  client.release()
  await pool.end()
}

// Applies scripts/db/add-plan-images.sql, then points every club, drop,
// bundle and All-Access plan at its generated cover in public/images/plans.
// The DDL usually needs the database owner (the app's role cannot run it), so
// a permission error is reported with the exact remedy. Safe to rerun.
//
//   node --env-file=.env.local scripts/db/add-plan-images.mjs
import fs from "node:fs"
import path from "node:path"
import { Pool } from "pg"

const COVERS_DIR = path.join(import.meta.dirname, "..", "..", "public", "images", "plans")

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const client = await pool.connect()
try {
  const sql = fs.readFileSync(path.join(import.meta.dirname, "add-plan-images.sql"), "utf8")
  await client.query(sql)
  console.log('membership_plans now has "imageUrl".')

  // Every plan that has a generated cover file gets its imageUrl set; plans
  // without a file (the three tiers) stay NULL and render without an image.
  const covers = fs.readdirSync(COVERS_DIR).filter((f) => f.endsWith(".webp"))
  let set = 0
  for (const file of covers) {
    const slug = file.replace(/\.webp$/, "")
    const { rowCount } = await client.query(
      `UPDATE membership_plans SET "imageUrl" = $1 WHERE slug = $2`,
      [`/images/plans/${file}`, slug],
    )
    if (rowCount > 0) {
      set += rowCount
      console.log(`${slug.padEnd(28)} -> /images/plans/${file}`)
    }
  }
  console.log(`\nimageUrl set on ${set} plans (${covers.length} cover files found).`)
} catch (error) {
  const permission = error?.code === "42501"
  console.error(permission ? "The app's database role may not run DDL." : "Migration failed.", error?.message ?? error)
  if (permission) console.error("Run scripts/db/add-plan-images.sql as the owner in the Neon SQL editor, then rerun this script.")
  process.exitCode = 1
} finally {
  client.release()
  await pool.end()
}

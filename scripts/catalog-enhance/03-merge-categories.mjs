/**
 * Merges duplicate/overlapping subcategories.
 *
 *   node --env-file=.env.local scripts/catalog-enhance/03-merge-categories.mjs          # dry run
 *   node --env-file=.env.local scripts/catalog-enhance/03-merge-categories.mjs --apply
 *
 * Each merge repoints products from a redundant subcategory to the canonical
 * one, then leaves the emptied category in place (it is NOT deleted — an
 * unused row is harmless, and keeping it means the change is trivially
 * reversible and no foreign key anywhere can dangle).
 *
 * `products.subcategory` is a free-text label; it is refreshed to the
 * canonical name so search facets and breadcrumbs agree with categoryId.
 */
import { Pool } from "pg"

const APPLY = process.argv.includes("--apply")
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

/**
 * from -> into. Chosen so the surviving category is the one with the clearer
 * name and the larger existing population.
 */
const MERGES = [
  { from: "Graphics & Icons", into: "Graphics", why: "duplicate of Graphics; Icons already exists separately for icon sets" },
  { from: "3D & Print Files", into: "3D Assets", why: "single product; 3D Assets is the established category" },
  { from: "Bundles", into: "Digital Bundles", why: "same concept, and the department is already called Bundles" },
  { from: "Templates & Documents", into: "Business Templates", why: "same concept; Business Templates is the clearer label" },
  { from: "Productivity Tools", into: "Productivity & Planners", why: "overlapping concepts with no distinct purpose" },
  { from: "Code & Web Templates", into: "Website Templates", why: "generic catch-all overlapping Website Templates" },
]

async function main() {
  const { rows: cats } = await pool.query(
    `SELECT c.id, c.name, c."parentId", d.name AS dept,
            (SELECT count(*)::int FROM products p WHERE p."categoryId" = c.id) AS total,
            (SELECT count(*)::int FROM products p WHERE p."categoryId" = c.id AND p.status='published') AS published
     FROM categories c LEFT JOIN categories d ON d.id = c."parentId"`,
  )
  const byName = new Map(cats.map((c) => [c.name, c]))

  const plan = []
  for (const m of MERGES) {
    const from = byName.get(m.from)
    const into = byName.get(m.into)
    if (!from || !into) {
      console.log(`SKIP ${m.from} -> ${m.into} (category not found)`)
      continue
    }
    // Products must never hang off a department directly — the storefront
    // treats departments as containers of subcategories. Moving a department's
    // orphaned products down into one of its own subcategories is therefore a
    // valid merge even though the parentIds differ.
    const isDepartmentToOwnChild = from.parentId === null && into.parentId === from.id
    if (from.parentId !== into.parentId && !isDepartmentToOwnChild) {
      console.log(`SKIP ${m.from} -> ${m.into} (different departments: ${from.dept} vs ${into.dept})`)
      continue
    }
    if (isDepartmentToOwnChild) {
      m.why = `products were attached directly to the ${from.name} department instead of a subcategory`
    }
    plan.push({ ...m, fromId: from.id, intoId: into.id, moving: from.total, published: from.published })
  }

  console.log("MERGE PLAN")
  for (const p of plan) {
    console.log(`  ${p.from} (${p.moving} products) -> ${p.into}`)
    console.log(`      ${p.why}`)
  }
  console.log(`\ntotal products repointed: ${plan.reduce((s, p) => s + p.moving, 0)}`)

  if (!APPLY) {
    console.log("\nDRY RUN — nothing written. Re-run with --apply.")
    return
  }

  const client = await pool.connect()
  try {
    await client.query("SET default_transaction_read_only = off")
    await client.query("BEGIN")
    let moved = 0
    for (const p of plan) {
      const res = await client.query(
        `UPDATE products SET "categoryId" = $1, subcategory = $2, "updatedAt" = now() WHERE "categoryId" = $3`,
        [p.intoId, p.into, p.fromId],
      )
      moved += res.rowCount
      console.log(`  moved ${res.rowCount} from "${p.from}" into "${p.into}"`)
    }
    await client.query("COMMIT")
    console.log(`\nAPPLIED — ${moved} products repointed. Emptied categories were left in place.`)
  } catch (e) {
    await client.query("ROLLBACK")
    throw e
  } finally {
    client.release()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exitCode = 1
  })
  .finally(() => pool.end())

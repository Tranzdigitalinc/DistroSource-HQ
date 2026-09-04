/**
 * Rewrites product copy, documentation, features, SEO and search metadata.
 *
 *   node --env-file=.env.local scripts/catalog-enhance/01-enhance-content.mjs          # dry run
 *   node --env-file=.env.local scripts/catalog-enhance/01-enhance-content.mjs --apply  # write
 *   ... --limit 5 --slug some-product        # scope a trial run
 *
 * Dry run by default. Writes only the columns listed in COLUMNS, all of which
 * are captured in the 00-backup snapshot.
 */
import { Pool } from "pg"
import { writeFileSync, mkdirSync } from "node:fs"
import { generateContent, lintContent } from "./lib/generate.mjs"

const APPLY = process.argv.includes("--apply")
const limitArg = process.argv.indexOf("--limit")
const LIMIT = limitArg > -1 ? Number(process.argv[limitArg + 1]) : null
const slugArg = process.argv.indexOf("--slug")
const SLUG = slugArg > -1 ? process.argv[slugArg + 1] : null

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const COLUMNS = [
  "name",
  "tagline",
  "description",
  "documentation",
  "features",
  "seoTitle",
  "seoDescription",
  "searchKeywords",
  "tags",
  "updatedAt",
]

async function main() {
  if (!APPLY) await pool.query("SET default_transaction_read_only = on")

  const { rows: products } = await pool.query(
    `SELECT p.*, c.name AS category_name, c."parentId" AS category_parent,
            d.name AS department_name
     FROM products p
     JOIN categories c ON c.id = p."categoryId"
     LEFT JOIN categories d ON d.id = c."parentId"
     ${SLUG ? "WHERE p.slug = $1" : ""}
     ORDER BY p.id
     ${LIMIT ? `LIMIT ${Number(LIMIT)}` : ""}`,
    SLUG ? [SLUG] : [],
  )

  const { rows: licenseRows } = await pool.query(`SELECT * FROM product_licenses ORDER BY "productId", "sortOrder"`)
  const licensesByProduct = new Map()
  for (const l of licenseRows) {
    if (!licensesByProduct.has(l.productId)) licensesByProduct.set(l.productId, [])
    licensesByProduct.get(l.productId).push(l)
  }

  const results = []
  const lintProblems = []
  const archetypeCounts = {}

  for (const p of products) {
    const content = generateContent(p, {
      categoryName: p.category_name,
      departmentName: p.department_name,
      licenses: licensesByProduct.get(p.id) ?? [],
    })
    archetypeCounts[content.archetypeId] = (archetypeCounts[content.archetypeId] ?? 0) + 1

    const problems = lintContent(content.description)
    if (problems.length) lintProblems.push({ id: p.id, slug: p.slug, problems })

    results.push({
      id: p.id,
      slug: p.slug,
      name: p.name,
      newName: content.name,
      nameChanged: content.nameChanged,
      archetype: content.archetypeId,
      before: {
        descriptionChars: (p.description ?? "").length,
        features: (p.features ?? []).length,
        keywords: (p.searchKeywords ?? []).length,
      },
      after: {
        descriptionChars: content.description.length,
        features: content.features.length,
        keywords: content.searchKeywords.length,
      },
      content,
    })
  }

  // --- Repetition check: how many products share an identical description? --
  const byDescription = new Map()
  for (const r of results) {
    const k = r.content.description
    byDescription.set(k, (byDescription.get(k) ?? 0) + 1)
  }
  const duplicateDescriptions = [...byDescription.values()].filter((n) => n > 1).reduce((a, b) => a + b, 0)

  const avgBefore = Math.round(results.reduce((s, r) => s + r.before.descriptionChars, 0) / results.length)
  const avgAfter = Math.round(results.reduce((s, r) => s + r.after.descriptionChars, 0) / results.length)

  console.log(`products processed        : ${results.length}`)
  console.log(`avg description chars     : ${avgBefore} -> ${avgAfter}`)
  console.log(`avg features              : ${Math.round(results.reduce((s, r) => s + r.before.features, 0) / results.length)} -> ${Math.round(results.reduce((s, r) => s + r.after.features, 0) / results.length)}`)
  console.log(`identical descriptions    : ${duplicateDescriptions}`)
  console.log(`banned-phrase violations  : ${lintProblems.length}`)
  console.log(`titles repaired           : ${results.filter((r) => r.nameChanged).length}`)
  console.log(`archetypes                : ${Object.entries(archetypeCounts).sort((a, b) => b[1] - a[1]).map(([k, v]) => `${k}:${v}`).join(", ")}`)

  mkdirSync("scripts/catalog-enhance/out", { recursive: true })
  writeFileSync(
    "scripts/catalog-enhance/out/content-preview.json",
    JSON.stringify({ generatedAt: new Date().toISOString(), results }, null, 2),
  )

  if (lintProblems.length) {
    console.log("\nLINT PROBLEMS:")
    for (const p of lintProblems.slice(0, 10)) console.log(`  #${p.id} ${p.slug}: ${p.problems.join("; ")}`)
  }

  if (!APPLY) {
    console.log("\nDRY RUN — nothing written. Re-run with --apply to persist.")
    console.log("Sample output written to scripts/catalog-enhance/out/content-preview.json")
    return
  }

  if (lintProblems.length) {
    console.error("\nRefusing to apply: banned phrases detected. Fix the copy vocabulary first.")
    process.exitCode = 1
    return
  }

  const client = await pool.connect()
  let written = 0
  try {
    // The read-only audit scripts in this repo issue a session-level
    // `SET default_transaction_read_only = on`, and Neon can hand back a
    // backend session that still carries it. Set it off explicitly on the
    // write connection so the outcome does not depend on which session we are
    // given. This is not a database- or role-level control: `pg_roles.rolconfig`
    // and `pg_db_role_setting` are both empty, and the endpoint is the primary.
    await client.query("SET default_transaction_read_only = off")
    await client.query("BEGIN")
    for (const r of results) {
      const c = r.content
      await client.query(
        `UPDATE products SET
           name = $2, tagline = $3, description = $4, documentation = $5, features = $6,
           "seoTitle" = $7, "seoDescription" = $8, "searchKeywords" = $9, tags = $10,
           "updatedAt" = now()
         WHERE id = $1`,
        [r.id, c.name, c.tagline, c.description, c.documentation, c.features, c.seoTitle, c.seoDescription, c.searchKeywords, c.tags],
      )
      written++
    }
    await client.query("COMMIT")
    console.log(`\nAPPLIED — ${written} products updated in one transaction.`)
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

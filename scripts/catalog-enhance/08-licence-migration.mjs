/**
 * Migrates the licence ladder to Personal / Commercial / Agency and validates
 * every tier.
 *
 *   node --env-file=.env.local scripts/catalog-enhance/08-licence-migration.mjs          # dry run
 *   node --env-file=.env.local scripts/catalog-enhance/08-licence-migration.mjs --apply
 *
 * Why the rename: "Extended Commercial" is widely read as extended *rights* —
 * resale, redistribution, source-file resale. DistroSource grants none of
 * those. "Agency" describes what the tier actually permits (use across
 * multiple client projects) without implying resale.
 *
 * Validation performed:
 *  - duplicate tiers per product
 *  - non-increasing progression (commercial <= personal, agency <= commercial)
 *  - extreme multipliers
 *  - zero/negative prices on paid products
 *  - free products must keep exactly one $0 tier
 */
import { Pool } from "pg"
import { writeFileSync, mkdirSync } from "node:fs"

const APPLY = process.argv.includes("--apply")
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const ORDER = { personal: 0, commercial: 1, agency: 2 }
const LABEL = {
  personal: "For your own private, non-commercial projects. Not for client work.",
  commercial: "For one commercial project or one client project.",
  agency: "For multiple client projects, up to the limits stated on this page.",
}
/**
 * Ceiling on agency/personal. The ladder is built at 2x and 3.5x; rounding to
 * retail endings nudges some products a little past 4x, which is not
 * "extreme" and is not worth repricing into untidy figures like 8. 4.5x is
 * the point at which a ladder genuinely looks arbitrary.
 */
const MAX_AGENCY_MULTIPLE = 4.5

async function main() {
  if (!APPLY) await pool.query("SET default_transaction_read_only = on")

  const { rows: licences } = await pool.query(
    `SELECT l.*, p.slug, p."isFree", p.status FROM product_licenses l
     JOIN products p ON p.id = l."productId" ORDER BY l."productId", l."sortOrder"`,
  )
  const byProduct = new Map()
  for (const l of licences) {
    if (!byProduct.has(l.productId)) byProduct.set(l.productId, [])
    byProduct.get(l.productId).push(l)
  }

  const renames = licences.filter((l) => l.licenseType === "extended_commercial")
  const legacy = licences.filter((l) => l.licenseType === "regular_license")

  const problems = { duplicate: [], progression: [], extreme: [], zeroPaid: [], freeMultiTier: [] }
  const priceFixes = []

  for (const [productId, tiers] of byProduct) {
    const p = tiers[0]

    // Duplicates
    const seen = new Map()
    for (const t of tiers) {
      const type = t.licenseType === "extended_commercial" ? "agency" : t.licenseType
      if (seen.has(type)) problems.duplicate.push({ productId, slug: p.slug, type })
      else seen.set(type, t)
    }

    if (p.isFree) {
      const paid = tiers.filter((t) => Number(t.price) > 0)
      if (paid.length) problems.freeMultiTier.push({ productId, slug: p.slug, paidTiers: paid.length })
      continue
    }

    const personal = seen.get("personal")
    const commercial = seen.get("commercial")
    const agency = seen.get("agency")

    for (const t of tiers) {
      if (Number(t.price) <= 0) problems.zeroPaid.push({ productId, slug: p.slug, type: t.licenseType })
    }

    if (personal && commercial && Number(commercial.price) <= Number(personal.price)) {
      problems.progression.push({ productId, slug: p.slug, issue: "commercial <= personal", personal: Number(personal.price), commercial: Number(commercial.price) })
    }
    if (commercial && agency && Number(agency.price) <= Number(commercial.price)) {
      problems.progression.push({ productId, slug: p.slug, issue: "agency <= commercial", commercial: Number(commercial.price), agency: Number(agency.price) })
    }
    if (personal && agency) {
      const mult = Number(agency.price) / Number(personal.price)
      if (mult > MAX_AGENCY_MULTIPLE) {
        // Pull the agency tier back to the ceiling rather than leaving an
        // arbitrary-looking figure.
        const capped = Math.round(Number(personal.price) * MAX_AGENCY_MULTIPLE)
        problems.extreme.push({ productId, slug: p.slug, multiple: Number(mult.toFixed(2)), from: Number(agency.price), to: capped })
        priceFixes.push({ id: agency.id, price: capped })
      }
    }
  }

  console.log(`licence tiers                 : ${licences.length}`)
  console.log(`to rename extended_commercial : ${renames.length}`)
  console.log(`legacy regular_license tiers  : ${legacy.length} (left as-is; draft products only)`)
  console.log(`duplicate tiers               : ${problems.duplicate.length}`)
  console.log(`progression violations        : ${problems.progression.length}`)
  console.log(`extreme multipliers (>${MAX_AGENCY_MULTIPLE}x)     : ${problems.extreme.length}`)
  console.log(`zero/negative on paid product : ${problems.zeroPaid.length}`)
  console.log(`free products with paid tiers : ${problems.freeMultiTier.length}`)

  if (problems.extreme.length) {
    console.log("\nsample extreme multipliers:")
    for (const e of problems.extreme.slice(0, 5)) console.log(`   ${e.slug.slice(0, 46).padEnd(48)} ${e.multiple}x  $${e.from} -> $${e.to}`)
  }

  mkdirSync("scripts/catalog-enhance/out", { recursive: true })
  writeFileSync("scripts/catalog-enhance/out/licence-audit.json", JSON.stringify({ problems, renames: renames.length, priceFixes }, null, 2))

  if (!APPLY) {
    console.log("\nDRY RUN — nothing written. Re-run with --apply.")
    return
  }

  const client = await pool.connect()
  try {
    await client.query("SET default_transaction_read_only = off")
    await client.query("BEGIN")

    const r = await client.query(
      `UPDATE product_licenses SET "licenseType"='agency', description=$1, "sortOrder"=$2
       WHERE "licenseType"='extended_commercial'`,
      [LABEL.agency, ORDER.agency],
    )
    // Keep the other two tiers' wording and ordering consistent with /licenses.
    await client.query(`UPDATE product_licenses SET description=$1, "sortOrder"=$2 WHERE "licenseType"='personal'`, [LABEL.personal, ORDER.personal])
    await client.query(`UPDATE product_licenses SET description=$1, "sortOrder"=$2 WHERE "licenseType"='commercial'`, [LABEL.commercial, ORDER.commercial])

    for (const f of priceFixes) {
      await client.query(`UPDATE product_licenses SET price=$2 WHERE id=$1`, [f.id, f.price.toFixed(2)])
    }

    await client.query("COMMIT")
    console.log(`\nAPPLIED — ${r.rowCount} tiers renamed to agency, ${priceFixes.length} extreme prices capped.`)
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

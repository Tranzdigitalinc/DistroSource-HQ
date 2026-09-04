/**
 * Gives every paid product the full Personal / Commercial / Extended
 * Commercial ladder.
 *
 *   node --env-file=.env.local scripts/catalog-enhance/05-license-tiers.mjs          # dry run
 *   node --env-file=.env.local scripts/catalog-enhance/05-license-tiers.mjs --apply
 *
 * Most of the catalog offered only a Personal licence, which left a buyer who
 * needs commercial rights with nothing to buy — and contradicted the licence
 * model stated on /licenses and in every product description.
 *
 * Free products keep their single $0 tier: a paid tier on a free product would
 * break the free-claim path, which requires the cheapest tier to cost nothing.
 * Legacy `regular_license` rows are left untouched for the draft products that
 * carry them.
 */
import { Pool } from "pg"

const APPLY = process.argv.includes("--apply")
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const MULTIPLIER = { commercial: 2, extended_commercial: 3.5 }

const DESCRIPTION = {
  personal: "For your own private, non-commercial projects.",
  commercial: "For one commercial project or one client project.",
  extended_commercial: "For multiple client projects, within the limits stated on this page.",
}

const SORT = { personal: 0, commercial: 1, extended_commercial: 2 }

function tidy(n) {
  const whole = Math.round(n)
  if (whole <= 20) return whole
  const base = Math.floor(whole / 10) * 10
  return base + 9 >= whole ? base + 9 : base + 19
}

async function main() {
  const { rows: products } = await pool.query(
    `SELECT id, slug, "isFree", status FROM products ORDER BY id`,
  )
  const { rows: licenses } = await pool.query(`SELECT * FROM product_licenses ORDER BY "productId", "sortOrder"`)
  const byProduct = new Map()
  for (const l of licenses) {
    if (!byProduct.has(l.productId)) byProduct.set(l.productId, [])
    byProduct.get(l.productId).push(l)
  }

  const toInsert = []
  const toUpdateDesc = []
  let freeSkipped = 0
  let alreadyComplete = 0

  for (const p of products) {
    const tiers = byProduct.get(p.id) ?? []
    if (p.isFree) {
      freeSkipped++
      continue
    }
    const personal = tiers.find((t) => t.licenseType === "personal")
    if (!personal) continue // nothing to base the ladder on

    const has = new Set(tiers.map((t) => t.licenseType))
    if (has.has("commercial") && has.has("extended_commercial")) {
      alreadyComplete++
    }

    const basePrice = Number(personal.price)
    if (basePrice <= 0) continue

    for (const type of ["commercial", "extended_commercial"]) {
      if (has.has(type)) continue
      toInsert.push({
        productId: p.id,
        slug: p.slug,
        licenseType: type,
        price: tidy(basePrice * MULTIPLIER[type]).toFixed(2),
        description: DESCRIPTION[type],
        sortOrder: SORT[type],
      })
    }

    // Keep tier descriptions consistent with /licenses wording.
    for (const t of tiers) {
      if (DESCRIPTION[t.licenseType] && t.description !== DESCRIPTION[t.licenseType]) {
        toUpdateDesc.push({ id: t.id, description: DESCRIPTION[t.licenseType], sortOrder: SORT[t.licenseType] ?? t.sortOrder })
      }
    }
  }

  console.log(`products                     : ${products.length}`)
  console.log(`free (single $0 tier kept)   : ${freeSkipped}`)
  console.log(`already had all three tiers  : ${alreadyComplete}`)
  console.log(`tiers to create              : ${toInsert.length}`)
  console.log(`tier descriptions to align   : ${toUpdateDesc.length}`)

  const sample = toInsert.slice(0, 4)
  if (sample.length) {
    console.log("\nsample:")
    for (const s of sample) console.log(`   ${s.slug.slice(0, 44).padEnd(46)} ${s.licenseType.padEnd(20)} $${s.price}`)
  }

  if (!APPLY) {
    console.log("\nDRY RUN — nothing written. Re-run with --apply.")
    return
  }

  const client = await pool.connect()
  try {
    await client.query("SET default_transaction_read_only = off")
    await client.query("BEGIN")
    for (const t of toInsert) {
      await client.query(
        `INSERT INTO product_licenses ("productId", "licenseType", price, description, "sortOrder")
         VALUES ($1, $2, $3, $4, $5)`,
        [t.productId, t.licenseType, t.price, t.description, t.sortOrder],
      )
    }
    for (const u of toUpdateDesc) {
      await client.query(`UPDATE product_licenses SET description = $2, "sortOrder" = $3 WHERE id = $1`, [
        u.id,
        u.description,
        u.sortOrder,
      ])
    }
    await client.query("COMMIT")
    console.log(`\nAPPLIED — ${toInsert.length} tiers created, ${toUpdateDesc.length} descriptions aligned.`)
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

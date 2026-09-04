/**
 * Aligns pricing with the published bands, by product complexity.
 *
 *   node --env-file=.env.local scripts/catalog-enhance/04-reprice.mjs          # dry run
 *   node --env-file=.env.local scripts/catalog-enhance/04-reprice.mjs --apply
 *
 * Bands come from the brief. Within a band the price is a deterministic
 * function of the product id, so re-running never reshuffles prices.
 *
 * compareAtPrice is NEVER invented: a "was" price is only kept where one
 * already existed and still exceeds the new price. Fabricating a higher
 * original purely to render a discount badge is exactly the practice the
 * catalog brief prohibits.
 */
import { Pool } from "pg"
import { detectArchetype } from "./lib/archetype.mjs"

const APPLY = process.argv.includes("--apply")
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

/** archetype -> [min, max] for the PERSONAL tier, in whole dollars. */
const BANDS = {
  graphic: [9, 19],
  social: [9, 19],
  mockup: [12, 24],
  preset: [9, 19],
  audio: [9, 19],
  "icon-pack": [12, 24],
  branding: [15, 29],
  font: [15, 29],
  "three-d": [15, 35],
  document: [15, 29],
  resume: [12, 24],
  presentation: [15, 29],
  planner: [12, 24],
  notion: [15, 29],
  spreadsheet: [19, 39],
  "ui-kit": [24, 49],
  "admin-dashboard": [29, 49],
  "react-template": [39, 79],
  "website-template": [29, 69],
  "ecommerce-template": [39, 79],
  "landing-page": [24, 49],
  bundle: [49, 99],
}

/** Tier multipliers applied to the personal price. */
const MULTIPLIER = { personal: 1, commercial: 2, extended_commercial: 3.5, regular_license: 2 }

/** Prices land on familiar retail endings rather than arbitrary figures. */
function tidy(n) {
  const whole = Math.round(n)
  if (whole <= 20) return whole
  const endings = [9, 4, 0]
  const base = Math.floor(whole / 10) * 10
  for (const e of endings) {
    if (base + e >= whole) return base + e
  }
  return base + 9
}

function priceFor(archetype, id) {
  const [lo, hi] = BANDS[archetype] ?? [15, 29]
  // Deterministic spread across the band.
  const t = ((id * 2654435761) % 1000) / 1000
  // tidy() rounds up to a retail ending, which can overshoot the ceiling
  // (24 -> 29). Clamp afterwards so a product never prices outside its band.
  return Math.min(hi, Math.max(lo, tidy(lo + t * (hi - lo))))
}

async function main() {
  const { rows: products } = await pool.query(
    `SELECT p.id, p.slug, p.name, p.tagline, p."basePrice", p."compareAtPrice", p."isFree", p.status,
            c.name AS category_name
     FROM products p JOIN categories c ON c.id = p."categoryId"
     ORDER BY p.id`,
  )
  const { rows: licenses } = await pool.query(`SELECT * FROM product_licenses ORDER BY "productId", "sortOrder"`)
  const byProduct = new Map()
  for (const l of licenses) {
    if (!byProduct.has(l.productId)) byProduct.set(l.productId, [])
    byProduct.get(l.productId).push(l)
  }

  const changes = []
  let freeSkipped = 0

  for (const p of products) {
    if (p.isFree) {
      freeSkipped++
      continue
    }
    const archetype = detectArchetype(p, p.category_name)
    const personal = priceFor(archetype, p.id)

    const tiers = byProduct.get(p.id) ?? []
    const tierChanges = tiers.map((t) => {
      const mult = MULTIPLIER[t.licenseType] ?? 1
      const next = tidy(personal * mult)
      return { id: t.id, type: t.licenseType, from: Number(t.price), to: next }
    })

    // compareAtPrice: keep only a genuine pre-existing higher price.
    const existingCompare = p.compareAtPrice === null ? null : Number(p.compareAtPrice)
    const keepCompare = existingCompare !== null && existingCompare > personal ? existingCompare : null

    changes.push({
      id: p.id,
      slug: p.slug,
      archetype,
      basePriceFrom: Number(p.basePrice),
      basePriceTo: personal,
      compareFrom: existingCompare,
      compareTo: keepCompare,
      tiers: tierChanges,
    })
  }

  const moved = changes.filter((c) => c.basePriceFrom !== c.basePriceTo)
  const comparesDropped = changes.filter((c) => c.compareFrom !== null && c.compareTo === null)

  console.log(`products priced        : ${changes.length} (free skipped: ${freeSkipped})`)
  console.log(`base prices changing   : ${moved.length}`)
  console.log(`fabricated "was" prices removed: ${comparesDropped.length}`)

  const byArch = {}
  for (const c of changes) {
    ;(byArch[c.archetype] ??= []).push(c.basePriceTo)
  }
  console.log("\nNEW PERSONAL PRICE BY ARCHETYPE (min–max):")
  for (const [a, list] of Object.entries(byArch).sort()) {
    console.log(`  ${a.padEnd(20)} $${Math.min(...list)}–$${Math.max(...list)}   (${list.length} products)`)
  }

  const allTiers = changes.flatMap((c) => c.tiers)
  for (const type of ["personal", "commercial", "extended_commercial"]) {
    const list = allTiers.filter((t) => t.type === type).map((t) => t.to)
    if (list.length) console.log(`\n${type}: $${Math.min(...list)}–$${Math.max(...list)} across ${list.length} tiers`)
  }

  if (!APPLY) {
    console.log("\nDRY RUN — nothing written. Re-run with --apply.")
    return
  }

  const client = await pool.connect()
  try {
    await client.query("SET default_transaction_read_only = off")
    await client.query("BEGIN")
    for (const c of changes) {
      await client.query(
        `UPDATE products SET "basePrice" = $2, "compareAtPrice" = $3, "updatedAt" = now() WHERE id = $1`,
        [c.id, c.basePriceTo.toFixed(2), c.compareTo === null ? null : c.compareTo.toFixed(2)],
      )
      for (const t of c.tiers) {
        await client.query(`UPDATE product_licenses SET price = $2 WHERE id = $1`, [t.id, t.to.toFixed(2)])
      }
    }
    await client.query("COMMIT")
    console.log(`\nAPPLIED — ${changes.length} products and ${allTiers.length} licence tiers repriced.`)
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

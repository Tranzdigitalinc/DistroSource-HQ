// Seeds (or updates) the three DistroSource membership tiers. Idempotent:
// re-running upserts by slug, so pricing/perk tweaks are safe to reapply.
// Annual price = 10x monthly (two months free).
import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

const PLANS = [
  {
    slug: "starter",
    name: "Starter",
    tagline: "For solo makers getting going",
    description: "Everyday savings and a handful of free downloads each month.",
    monthlyPriceUsd: "24.99",
    annualPriceUsd: "249.90",
    discountPercent: 10,
    monthlyCredits: 5,
    creditValueCapUsd: "40.00",
    perks: [
      "10% off every purchase",
      "5 download credits each month",
      "Credits cover any product up to $40",
      "Priority email support",
      "Member-only newsletter",
    ],
    isPopular: false,
    sortOrder: 1,
  },
  {
    slug: "pro",
    name: "Pro",
    tagline: "For working freelancers and studios",
    description: "Bigger discount, more credits, and early access to new releases.",
    monthlyPriceUsd: "49.99",
    annualPriceUsd: "499.90",
    discountPercent: 20,
    monthlyCredits: 15,
    creditValueCapUsd: "75.00",
    perks: [
      "20% off every purchase",
      "15 download credits each month",
      "Credits cover any product up to $75",
      "Early access to new releases",
      "Priority support",
      "Pro member badge",
    ],
    isPopular: true,
    sortOrder: 2,
  },
  {
    slug: "elite",
    name: "Elite",
    tagline: "For teams that ship constantly",
    description: "Maximum discount, unlimited credits, and exclusive member-only drops.",
    monthlyPriceUsd: "99.99",
    annualPriceUsd: "999.90",
    discountPercent: 30,
    monthlyCredits: null, // unlimited
    creditValueCapUsd: null, // no cap
    perks: [
      "30% off every purchase",
      "Unlimited download credits",
      "Exclusive member-only products",
      "First-look at new drops",
      "Dedicated support manager",
    ],
    isPopular: false,
    sortOrder: 3,
  },
]

async function main() {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    for (const p of PLANS) {
      await client.query(
        `INSERT INTO membership_plans
           (slug, name, tagline, description, "monthlyPriceUsd", "annualPriceUsd",
            "discountPercent", "monthlyCredits", "creditValueCapUsd", perks,
            "isPopular", "isActive", "sortOrder")
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10::jsonb,$11,true,$12)
         ON CONFLICT (slug) DO UPDATE SET
           name = EXCLUDED.name,
           tagline = EXCLUDED.tagline,
           description = EXCLUDED.description,
           "monthlyPriceUsd" = EXCLUDED."monthlyPriceUsd",
           "annualPriceUsd" = EXCLUDED."annualPriceUsd",
           "discountPercent" = EXCLUDED."discountPercent",
           "monthlyCredits" = EXCLUDED."monthlyCredits",
           "creditValueCapUsd" = EXCLUDED."creditValueCapUsd",
           perks = EXCLUDED.perks,
           "isPopular" = EXCLUDED."isPopular",
           "isActive" = true,
           "sortOrder" = EXCLUDED."sortOrder"`,
        [
          p.slug,
          p.name,
          p.tagline,
          p.description,
          p.monthlyPriceUsd,
          p.annualPriceUsd,
          p.discountPercent,
          p.monthlyCredits,
          p.creditValueCapUsd,
          JSON.stringify(p.perks),
          p.isPopular,
          p.sortOrder,
        ],
      )
      console.log(`membership_plans: upserted "${p.slug}".`)
    }
    await client.query("COMMIT")
    console.log("Seed complete.")
  } catch (error) {
    await client.query("ROLLBACK")
    throw error
  } finally {
    client.release()
    await pool.end()
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})

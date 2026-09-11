// One-off migration: creates the membership tables that lib/db/schema.ts
// declares — membership_plans, subscriptions, membership_credit_ledger —
// used by the Fungies-billed DistroSource membership. Safe to rerun.
import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function main() {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    await client.query(`
      CREATE TABLE IF NOT EXISTS membership_plans (
        id serial PRIMARY KEY,
        slug text NOT NULL UNIQUE,
        name text NOT NULL,
        tagline text,
        description text,
        "monthlyPriceUsd" numeric(10, 2) NOT NULL,
        "annualPriceUsd" numeric(10, 2) NOT NULL,
        "discountPercent" integer NOT NULL DEFAULT 0,
        "monthlyCredits" integer,
        "creditValueCapUsd" numeric(10, 2),
        perks jsonb NOT NULL DEFAULT '[]'::jsonb,
        "isPopular" boolean NOT NULL DEFAULT false,
        "isActive" boolean NOT NULL DEFAULT true,
        "sortOrder" integer NOT NULL DEFAULT 0,
        "createdAt" timestamp NOT NULL DEFAULT now()
      )
    `)
    console.log("membership_plans: table ensured.")

    await client.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id serial PRIMARY KEY,
        reference text NOT NULL UNIQUE,
        "userId" text,
        "guestEmail" text,
        "planId" integer NOT NULL REFERENCES membership_plans(id),
        interval text NOT NULL,
        status text NOT NULL DEFAULT 'pending',
        "priceUsd" numeric(10, 2) NOT NULL,
        "billingName" text,
        "billingEmail" text NOT NULL,
        "fungiesOfferId" text,
        "fungiesSubscriptionId" text UNIQUE,
        "fungiesCustomerId" text,
        "currentPeriodStart" timestamp,
        "currentPeriodEnd" timestamp,
        "cancelAtPeriodEnd" boolean NOT NULL DEFAULT false,
        "canceledAt" timestamp,
        "createdAt" timestamp NOT NULL DEFAULT now(),
        "updatedAt" timestamp NOT NULL DEFAULT now()
      )
    `)
    console.log("subscriptions: table ensured.")

    // Fast lookups the webhook and account pages rely on.
    await client.query(`CREATE INDEX IF NOT EXISTS subscriptions_user_idx ON subscriptions ("userId")`)
    await client.query(`CREATE INDEX IF NOT EXISTS subscriptions_guest_email_idx ON subscriptions ("guestEmail")`)
    await client.query(`CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions (status)`)

    await client.query(`
      CREATE TABLE IF NOT EXISTS membership_credit_ledger (
        id serial PRIMARY KEY,
        "subscriptionId" integer NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
        delta integer NOT NULL,
        reason text NOT NULL,
        "periodStart" timestamp,
        "productId" integer REFERENCES products(id),
        "orderId" integer REFERENCES orders(id),
        "entitlementId" integer REFERENCES entitlements(id),
        "createdAt" timestamp NOT NULL DEFAULT now()
      )
    `)
    console.log("membership_credit_ledger: table ensured.")

    await client.query(
      `CREATE INDEX IF NOT EXISTS membership_credit_ledger_sub_idx ON membership_credit_ledger ("subscriptionId")`,
    )

    await client.query("COMMIT")
    console.log("Migration complete.")
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

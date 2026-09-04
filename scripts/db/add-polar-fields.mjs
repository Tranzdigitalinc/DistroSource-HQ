// One-off migration: adds the Polar customer/paid/refund tracking columns to
// `orders`, plus a `polar_webhook_events` table used to make webhook
// processing idempotent by delivery id ("webhook-id" header). Safe to rerun.
import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function main() {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")

    await client.query(`
      ALTER TABLE orders
        ADD COLUMN IF NOT EXISTS "polarCustomerId" text,
        ADD COLUMN IF NOT EXISTS "polarPaidAmount" numeric(10, 2),
        ADD COLUMN IF NOT EXISTS "polarPaidCurrency" text,
        ADD COLUMN IF NOT EXISTS "polarPaidAt" timestamp,
        ADD COLUMN IF NOT EXISTS "polarRefundedAmount" numeric(10, 2),
        ADD COLUMN IF NOT EXISTS "polarRefundedAt" timestamp
    `)
    console.log("orders: Polar tracking columns ensured.")

    await client.query(`
      CREATE TABLE IF NOT EXISTS polar_webhook_events (
        id text PRIMARY KEY,
        "eventType" text NOT NULL,
        "orderId" integer REFERENCES orders(id),
        payload jsonb,
        "processedAt" timestamp NOT NULL DEFAULT now()
      )
    `)
    console.log("polar_webhook_events: table ensured.")

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

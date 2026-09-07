// One-off migration: creates the `card2crypto_payments` table that
// lib/db/schema.ts declares (one row per order paid through Card2Crypto).
// Nothing on `orders` changes. Safe to rerun.
import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })

async function main() {
  const client = await pool.connect()
  try {
    await client.query("BEGIN")
    await client.query(`
      CREATE TABLE IF NOT EXISTS card2crypto_payments (
        id serial PRIMARY KEY,
        "orderId" integer NOT NULL UNIQUE REFERENCES orders(id),
        "addressIn" text NOT NULL,
        "polygonAddress" text NOT NULL,
        "ipnToken" text NOT NULL,
        "callbackToken" text NOT NULL,
        "paidAt" timestamp,
        "paidAmount" numeric(10, 2),
        txid text,
        "createdAt" timestamp NOT NULL DEFAULT now()
      )
    `)
    console.log("card2crypto_payments: table ensured.")
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

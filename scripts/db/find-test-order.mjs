import { Pool } from "pg"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const { rows } = await pool.query(
  `select id, "orderNumber", status, "polarCheckoutId", "userId", "totalUsd", "polarCustomerId" from orders where "billingEmail" = 'polar-e2e-test@gmail.com' order by id desc limit 3`
)
console.log(JSON.stringify(rows, null, 2))
await pool.end()

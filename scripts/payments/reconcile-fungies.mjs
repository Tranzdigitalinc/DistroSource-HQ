// Finds DistroSource orders stuck on `pending_payment` for Fungies and asks
// Fungies whether they were actually paid.
//
// A stuck order means one of two things: the buyer never finished (nothing to
// do), or they paid and the webhook never landed (they are owed their files).
// This tells them apart, and can repair the second case.
//
// Repair works by replaying the provider's own payment record through our
// normal webhook route, signed with FUNGIES_WEBHOOK_SECRET. Nothing here
// fulfils an order directly, so the same verification, matching and
// idempotency rules apply as for a live delivery.
//
//   node --env-file=.env.local scripts/payments/reconcile-fungies.mjs
//   node --env-file=.env.local scripts/payments/reconcile-fungies.mjs --fulfil
//
// Env: DATABASE_URL, FUNGIES_PUBLIC_KEY, FUNGIES_SECRET_KEY,
//      FUNGIES_WEBHOOK_SECRET, and APP_URL (defaults to http://localhost:3200).
import { createHmac } from "node:crypto"
import { Pool } from "pg"

const FULFIL = process.argv.includes("--fulfil")
const APP_URL = (process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3200").replace(/\/+$/, "")
const API = "https://api.fungies.io/v0"

function requireEnv(name) {
  const v = process.env[name]?.trim()
  if (!v) throw new Error(`${name} is not set`)
  return v
}

const MISSING = ["DATABASE_URL", "FUNGIES_PUBLIC_KEY", "FUNGIES_SECRET_KEY", "FUNGIES_WEBHOOK_SECRET"].filter(
  (n) => !process.env[n]?.trim(),
)
if (MISSING.length) {
  console.error(`Missing: ${MISSING.join(", ")}`)
  console.error("The Fungies keys live in Vercel. Copy them into .env.local, or run this with them set:")
  console.error("  FUNGIES_PUBLIC_KEY=… FUNGIES_SECRET_KEY=… FUNGIES_WEBHOOK_SECRET=… \\")
  console.error("    node --env-file=.env.local scripts/payments/reconcile-fungies.mjs")
  console.error("Set APP_URL to the deployed site to repair production orders.")
  process.exit(1)
}

const headers = {
  "x-fngs-public-key": requireEnv("FUNGIES_PUBLIC_KEY"),
  "x-fngs-secret-key": requireEnv("FUNGIES_SECRET_KEY"),
  "Content-Type": "application/json",
}

async function listPaidPayments() {
  // Fungies has no filter for our own reference, so page recent PAID payments
  // and match on the offer's internalId, which is our order number.
  const out = []
  for (let skip = 0; skip < 500; skip += 100) {
    const url = new URL(`${API}/payments/list`)
    url.searchParams.set("statuses", "PAID")
    url.searchParams.set("take", "100")
    url.searchParams.set("skip", String(skip))
    url.searchParams.set("orderBy", "createdAt")
    url.searchParams.set("orderDirection", "DESC")
    const res = await fetch(url, { headers })
    const body = await res.json().catch(() => ({}))
    if (!res.ok) throw new Error(body?.error?.message ?? `payments/list failed (${res.status})`)
    const page = body?.data?.payments ?? body?.data?.items ?? body?.data ?? []
    const rows = Array.isArray(page) ? page : []
    out.push(...rows)
    if (rows.length < 100) break
  }
  return out
}

/** Our order number for a payment record, from the offer's internalId. */
function orderRef(payment) {
  for (const item of payment?.items ?? []) {
    const ref = item?.offer?.internalId
    if (typeof ref === "string" && ref.trim()) return ref.trim()
  }
  return null
}

async function replay(payment, orderNumber) {
  const event = {
    id: `reconcile_${payment.id ?? orderNumber}`,
    type: "payment_success",
    idempotencyKey: `reconcile_${payment.id ?? orderNumber}`,
    testMode: false,
    data: { items: payment.items ?? [], payment, order: payment.order ?? undefined, user: payment.user ?? undefined },
  }
  const raw = JSON.stringify(event)
  const signature = `sha256_${createHmac("sha256", requireEnv("FUNGIES_WEBHOOK_SECRET")).update(raw, "utf8").digest("hex")}`
  const res = await fetch(`${APP_URL}/api/webhooks/fungies`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-fngs-signature": signature },
    body: raw,
  })
  return `${res.status} ${(await res.text()).slice(0, 120)}`
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
try {
  const { rows: pending } = await pool.query(
    `SELECT "orderNumber", "totalUsd", "billingEmail", "createdAt"
       FROM orders
      WHERE "paymentMethod" = 'fungies' AND status = 'pending_payment'
      ORDER BY "createdAt"`,
  )
  if (pending.length === 0) {
    console.log("No pending Fungies orders. Nothing to reconcile.")
  } else {
    console.log(`${pending.length} pending Fungies order(s). Checking Fungies for payments…\n`)
    const paid = await listPaidPayments()
    const byRef = new Map()
    for (const p of paid) {
      const ref = orderRef(p)
      if (ref) byRef.set(ref, p)
    }

    let owed = 0
    for (const o of pending) {
      const match = byRef.get(o.orderNumber)
      const age = Math.round((Date.now() - new Date(o.createdAt).getTime()) / 60000)
      if (!match) {
        console.log(`  ${o.orderNumber}  $${o.totalUsd}  ${o.billingEmail}  — not paid (abandoned ${age} min ago)`)
        continue
      }
      owed++
      console.log(`  ${o.orderNumber}  $${o.totalUsd}  ${o.billingEmail}  — PAID at Fungies but not fulfilled`)
      if (FULFIL) console.log(`      replayed -> ${await replay(match, o.orderNumber)}`)
    }

    console.log()
    if (owed === 0) console.log("Every pending order is simply unpaid. No customer is owed anything.")
    else if (FULFIL) console.log(`Replayed ${owed} paid order(s) through the webhook. Re-run without --fulfil to confirm they cleared.`)
    else console.log(`${owed} customer(s) paid and have not received their files. Re-run with --fulfil to deliver.`)
  }
} finally {
  await pool.end()
}

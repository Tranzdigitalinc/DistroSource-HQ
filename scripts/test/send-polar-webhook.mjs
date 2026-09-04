// One-off sandbox verification script: builds a properly-signed Polar
// webhook delivery (same signing scheme as @polar-sh/sdk/webhooks ->
// standardwebhooks) and posts it to the local webhook route, so we can
// exercise order.paid / order.refunded / redelivery handling without a real
// card capture. Not part of the app — safe to delete after verification.
import { randomUUID, createHmac } from "node:crypto"

// Re-implements standardwebhooks' signing scheme (the same library
// @polar-sh/sdk/webhooks uses to verify), so this test script has no extra
// dependency: base64Secret = base64(utf8(secret)); sign `${id}.${ts}.${body}`
// with HMAC-SHA256 keyed by the base64-decoded secret, base64-encode the
// digest, and prefix with "v1,".
function signStandardWebhook(secret, id, timestampSeconds, payload) {
  const base64Secret = Buffer.from(secret, "utf-8").toString("base64")
  const key = Buffer.from(base64Secret, "base64")
  const toSign = `${id}.${timestampSeconds}.${payload}`
  const digest = createHmac("sha256", key).update(toSign).digest("base64")
  return `v1,${digest}`
}

const secret = process.env.POLAR_WEBHOOK_SECRET
if (!secret) throw new Error("POLAR_WEBHOOK_SECRET not set")

const base = process.argv[2] ?? "http://localhost:3000"
const eventType = process.argv[3] ?? "order.paid"
const internalOrderId = Number(process.argv[4] ?? 7)
const netAmountCents = Number(process.argv[5] ?? 5000)
const checkoutId = process.argv[6] ?? "8f095ee2-ed2c-41ea-93f0-1f6ac0ff7f37"
const overrideWebhookId = process.argv[7] // for redelivery test
const refundedAmountCents = Number(process.argv[8] ?? 0)

const now = new Date().toISOString()
const orderId = `test_order_${randomUUID()}`
const customerId = `test_customer_${randomUUID()}`

const baseOrder = {
  id: orderId,
  created_at: now,
  modified_at: now,
  status: eventType === "order.refunded" ? "refunded" : "paid",
  paid: true,
  subtotal_amount: netAmountCents,
  discount_amount: 0,
  net_amount: netAmountCents,
  tax_amount: 0,
  total_amount: netAmountCents,
  applied_balance_amount: 0,
  due_amount: 0,
  refunded_amount: refundedAmountCents,
  refunded_tax_amount: 0,
  currency: "usd",
  billing_reason: "purchase",
  billing_name: "Polar Test Buyer",
  billing_address: null,
  invoice_number: null,
  is_invoice_generated: false,
  receipt_number: null,
  customer_id: customerId,
  product_id: process.env.POLAR_PRODUCT_ID ?? "a86bafe4-b86c-4cc4-adf2-b9459f7a3c76",
  discount_id: null,
  subscription_id: null,
  checkout_id: checkoutId,
  metadata: { distrosourceOrderId: internalOrderId, customerId: "guest_f0d7716a-df63-4915-abfc-2ab76feb0bda", cartItemCount: 1 },
  platform_fee_amount: 0,
  platform_fee_currency: null,
  customer: {
    id: customerId,
    created_at: now,
    modified_at: null,
    metadata: {},
    external_id: null,
    email: "polar-e2e-test@gmail.com",
    email_verified: true,
    type: "guest",
    name: "Polar Test Buyer",
    billing_name: "Polar Test Buyer",
    billing_address: null,
    tax_id: null,
    locale: null,
    organization_id: "test_org",
    default_payment_method_id: null,
    deleted_at: null,
    avatar_url: null,
  },
  product: null,
  discount: null,
  subscription: null,
  items: [
    {
      created_at: now,
      modified_at: null,
      id: `item_${randomUUID()}`,
      label: "Ivoryhaven — Multiplayer Game Leaderboard App Next.js Starter",
      amount: netAmountCents,
      tax_amount: 0,
      proration: false,
      product_price_id: null,
    },
  ],
  description: "DistroSource Digital Order",
  refundable_amount: netAmountCents - refundedAmountCents,
  refundable_tax_amount: 0,
}

const payload = JSON.stringify({ type: eventType, timestamp: now, data: baseOrder })

const webhookId = overrideWebhookId ?? `msg_${randomUUID()}`
const timestampSeconds = Math.floor(Date.now() / 1000)
const signature = signStandardWebhook(secret, webhookId, timestampSeconds, payload)

const res = await fetch(`${base}/api/webhooks/polar`, {
  method: "POST",
  headers: {
    "content-type": "application/json",
    "webhook-id": webhookId,
    "webhook-timestamp": String(timestampSeconds),
    "webhook-signature": signature,
  },
  body: payload,
})

const text = await res.text()
console.log(`[send-polar-webhook] ${eventType} -> HTTP ${res.status}`)
console.log(`[send-polar-webhook] webhook-id: ${webhookId}`)
console.log(`[send-polar-webhook] response: ${text}`)

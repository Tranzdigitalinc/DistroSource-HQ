import { NextResponse } from "next/server"
import crypto from "node:crypto"
import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { orders } from "@/lib/db/schema"
import { getWhopWebhookSecret } from "@/lib/env"
import { fulfillPendingOrder } from "@/lib/checkout-core"

/**
 * Whop webhook — the single source of truth for Whop fulfilment, same role
 * as the Polar `order.paid` handler. `createWhopCheckout` (lib/actions/checkout.ts)
 * only ever writes a *pending* order; this route is the only place a Whop
 * order is marked completed and entitlements are granted.
 *
 * SIGNATURE VERIFICATION IS NOT YET ACTIVE. Whop's signing secret
 * (`WHOP_WEBHOOK_SECRET`) has not been provided yet. Until it is set, this
 * route trusts the payload's shape but not its origin — it still requires
 * the DistroSource order to exist, be `pending_payment`, and match the
 * amount, but an attacker who knows an order's id and total could otherwise
 * forge a completion. Do not rely on this route to move real money until
 * `WHOP_WEBHOOK_SECRET` is configured and verification below is exercised.
 *
 * Once the secret is available, no code changes are needed here beyond
 * confirming Whop's actual header name/HMAC scheme — verification already
 * runs whenever the secret is present.
 */

interface WhopPaymentEvent {
  action: string
  data: {
    id: string
    status?: string
    metadata?: Record<string, string | number | boolean> | null
    final_amount?: number
    subtotal?: number
    currency?: string
    checkout_configuration_id?: string | null
  }
}

function verifyWhopSignature(body: string, signatureHeader: string | null, secret: string): boolean {
  if (!signatureHeader) return false
  const expected = crypto.createHmac("sha256", secret).update(body).digest("hex")
  // Constant-time comparison — a naive `===` leaks timing information about
  // how many leading bytes matched.
  const provided = Buffer.from(signatureHeader)
  const expectedBuf = Buffer.from(expected)
  if (provided.length !== expectedBuf.length) return false
  return crypto.timingSafeEqual(provided, expectedBuf)
}

export async function POST(request: Request) {
  const body = await request.text()
  const secret = getWhopWebhookSecret()

  if (secret) {
    const signature = request.headers.get("x-whop-signature")
    if (!verifyWhopSignature(body, signature, secret)) {
      console.error("[v0] Whop webhook verification failed")
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 })
    }
  } else {
    console.warn("[v0] WHOP_WEBHOOK_SECRET is not set — accepting Whop webhook without signature verification.")
  }

  let event: WhopPaymentEvent
  try {
    event = JSON.parse(body) as WhopPaymentEvent
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 })
  }

  // payment.succeeded (event name TBD — confirm against Whop's actual
  // payload once real webhooks are being received) is the ONLY event that
  // fulfills an order. Every other event, including checkout expiry, is
  // acknowledged and ignored.
  if (event.action !== "payment.succeeded" && event.action !== "payment.completed") {
    return NextResponse.json({ received: true })
  }

  const payment = event.data
  const metadata = payment.metadata ?? {}
  const internalOrderId = Number(metadata.distrosourceOrderId)
  if (!Number.isInteger(internalOrderId) || internalOrderId <= 0) {
    return NextResponse.json({ error: "Missing DistroSource order metadata" }, { status: 400 })
  }

  const [order] = await db.select().from(orders).where(eq(orders.id, internalOrderId)).limit(1)
  if (!order) return NextResponse.json({ error: "Internal order not found" }, { status: 404 })
  // Idempotent: a redelivered webhook for an already-completed order is a
  // no-op rather than an error.
  if (order.status === "completed") return NextResponse.json({ received: true, duplicate: true })
  if (order.status !== "pending_payment") return NextResponse.json({ error: "Order is not payable" }, { status: 409 })

  const paidAmount = payment.final_amount ?? payment.subtotal
  const paidCurrency = (payment.currency ?? "usd").toLowerCase()
  if (typeof paidAmount === "number" && (paidCurrency !== order.currency || Math.abs(paidAmount - Number(order.totalUsd)) > 0.01)) {
    return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 })
  }

  await fulfillPendingOrder(order, { whopPaidAt: new Date(), whopMetadata: payment })

  return NextResponse.json({ received: true, orderNumber: order.orderNumber })
}

export const dynamic = "force-dynamic"

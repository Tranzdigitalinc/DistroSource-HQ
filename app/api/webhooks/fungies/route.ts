import { NextResponse } from "next/server"
import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { orders } from "@/lib/db/schema"
import { fulfillPendingOrder } from "@/lib/checkout-core"
import { getFungiesWebhookSecret } from "@/lib/env"
import { orderNumberFromEvent, paidAmountFromEvent, verifyFungiesSignature, type FungiesEvent } from "@/lib/fungies"

export const dynamic = "force-dynamic"

/**
 * Fungies webhook. This is the ONLY thing that fulfils a Fungies order.
 *
 * Every delivery is verified against `x-fngs-signature` — "sha256_" plus the
 * HMAC-SHA256 of the raw body — before the payload is parsed as meaningful.
 * The order is then located by the offer's `internalId`, which is the order
 * number we set as `externalId` when the single-use offer was created.
 *
 * Delivery is at-least-once and unordered, so this stays idempotent:
 * `fulfillPendingOrder` only acts on a `pending_payment` order, and an order
 * already completed answers 200 without doing anything again.
 */
export async function POST(request: Request) {
  // Raw body first: re-serialised JSON would not match the signature.
  const raw = await request.text()

  let secret: string
  try {
    secret = getFungiesWebhookSecret()
  } catch (error) {
    console.error("[v0] Fungies webhook received but FUNGIES_WEBHOOK_SECRET is not set", error)
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
  }

  if (!verifyFungiesSignature(raw, request.headers.get("x-fngs-signature"), secret)) {
    console.error("[v0] Fungies webhook signature verification failed")
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
  }

  let event: FungiesEvent
  try {
    event = JSON.parse(raw) as FungiesEvent
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  // Only a successful payment grants access. Refunds and subscription events
  // are acknowledged so Fungies stops retrying, but change nothing here.
  if (event.type !== "payment_success") {
    return NextResponse.json({ received: true, ignored: event.type ?? "unknown" })
  }

  const orderNumber = orderNumberFromEvent(event)
  if (!orderNumber) {
    console.error("[v0] Fungies payment_success carried no offer internalId", { eventId: event.id })
    return NextResponse.json({ received: true, error: "No order reference" })
  }

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.orderNumber, orderNumber), eq(orders.paymentMethod, "fungies")))
    .limit(1)

  if (!order) {
    console.error("[v0] Fungies payment_success for unknown order", { orderNumber, eventId: event.id })
    return NextResponse.json({ received: true, error: "Unknown order" })
  }

  if (order.status === "completed") {
    // Duplicate delivery, or the buyer's tab confirmed first. Nothing to do.
    return NextResponse.json({ received: true, status: "already_completed" })
  }
  if (order.status !== "pending_payment") {
    console.error("[v0] Fungies payment_success for a non-payable order", { orderNumber, status: order.status })
    return NextResponse.json({ received: true, status: order.status })
  }

  // The amount was fixed server-side when the offer was created and the offer
  // has limit 1, so Fungies cannot have charged a different total. This only
  // records a mismatch for review rather than blocking fulfilment of a
  // payment the provider has already confirmed and settled.
  const paid = paidAmountFromEvent(event)
  const expected = Number.parseFloat(order.totalUsd)
  if (paid !== null && Math.abs(paid - expected) > 0.01) {
    console.error("[v0] Fungies amount mismatch", { orderNumber, expected, paid })
  }

  await fulfillPendingOrder(order)
  return NextResponse.json({ received: true, status: "completed" })
}

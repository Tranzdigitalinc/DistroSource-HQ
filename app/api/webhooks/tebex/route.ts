import { createHash, createHmac, timingSafeEqual } from "node:crypto"
import { and, eq } from "drizzle-orm"
import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { operationEvents, orders } from "@/lib/db/schema"
import { fulfillPendingOrder } from "@/lib/checkout-core"
import {
  fulfillGamingTebexPayment,
  isGamingReference,
  reconcileGamingTebexRecurring,
  type TebexRecurringEvent,
} from "@/lib/gaming/billing"

export const runtime = "nodejs"

function getWebhookSecret() {
  const secret = process.env.TEBEX_WEBHOOK_SECRET?.trim()
  if (!secret) throw new Error("TEBEX_WEBHOOK_SECRET is not configured.")
  return secret
}

function isValidSignature(rawBody: string, signature: string | null) {
  if (!signature) return false
  const bodyHash = createHash("sha256").update(rawBody, "utf8").digest("hex")
  const expected = createHmac("sha256", getWebhookSecret()).update(bodyHash, "utf8").digest("hex")
  const provided = signature.trim().toLowerCase().replace(/^sha256=/, "")
  if (!/^[a-f0-9]{64}$/.test(provided)) return false
  return timingSafeEqual(Buffer.from(expected, "hex"), Buffer.from(provided, "hex"))
}

function findString(value: unknown, keys: string[]): string | null {
  if (!value || typeof value !== "object") return null
  const record = value as Record<string, unknown>
  for (const key of keys) {
    const candidate = record[key]
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim()
  }
  for (const child of Object.values(record)) {
    const found = findString(child, keys)
    if (found) return found
  }
  return null
}

function eventType(payload: Record<string, unknown>) {
  return findString(payload, ["type", "event", "name"])?.toLowerCase() ?? ""
}

function eventId(payload: Record<string, unknown>) {
  return findString(payload, ["id", "event_id", "eventId"]) ?? null
}

/** Our reference rides the basket custom and, for subscriptions, the package custom too. */
function orderNumberFromPayload(payload: Record<string, unknown>) {
  return findString(payload, [
    "distrosource_order_number",
    "gaming_reference",
    "order_number",
    "orderNumber",
    "custom_order_number",
  ])
}

/** Tebex dates look like "2021-08-19T13:03:30.000000Z" or "2022-12-30T16:43:06". */
function parseTebexDate(value: unknown): Date | null {
  if (typeof value !== "string" || !value.trim()) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const RECURRING_TYPES: Record<string, TebexRecurringEvent> = {
  recurringpaymentstarted: "recurring-payment.started",
  recurringpaymentrenewed: "recurring-payment.renewed",
  recurringpaymentended: "recurring-payment.ended",
  recurringpaymentcancellationrequested: "recurring-payment.cancellation.requested",
  recurringpaymentcancellationaborted: "recurring-payment.cancellation.aborted",
}

export async function POST(request: Request) {
  const rawBody = await request.text()

  try {
    if (!isValidSignature(rawBody, request.headers.get("x-signature"))) {
      return NextResponse.json({ error: "Invalid signature." }, { status: 401 })
    }

    const payload = JSON.parse(rawBody) as Record<string, unknown>
    const type = eventType(payload)
    const id = eventId(payload)

    // Tebex uses this handshake when an endpoint is first registered. The
    // response must echo the validation webhook id exactly.
    if (type === "validation.webhook" || type === "validation_webhook") {
      if (!id) return NextResponse.json({ error: "Validation webhook has no id." }, { status: 400 })
      return NextResponse.json({ id })
    }

    if (id) {
      const [alreadyHandled] = await db
        .select({ id: operationEvents.id })
        .from(operationEvents)
        .where(and(eq(operationEvents.eventType, "tebex_webhook"), eq(operationEvents.entityId, id)))
        .limit(1)
      if (alreadyHandled) return NextResponse.json({ received: true, duplicate: true })
    }

    const record = async (status: "resolved" | "ignored", createdBy?: string | null) => {
      if (!id) return
      await db.insert(operationEvents).values({
        eventType: "tebex_webhook",
        entityType: "payment",
        entityId: id,
        status,
        payload,
        createdBy: createdBy ?? null,
        resolvedAt: new Date(),
      })
    }

    const normalizedType = type.replace(/[^a-z0-9]/g, "")

    // --- Gaming subscription renewals and lifecycle -------------------------
    const recurringType = RECURRING_TYPES[normalizedType]
    if (recurringType) {
      const subject = (payload.subject ?? {}) as Record<string, unknown>
      const recurringReference = typeof subject.reference === "string" ? subject.reference.trim() : ""
      if (!recurringReference) {
        await record("ignored")
        return NextResponse.json({ received: true, ignored: "recurring event without a reference" })
      }
      const status = subject.status as Record<string, unknown> | undefined
      const statusId = typeof status?.id === "number" ? status.id : null
      const lastPayment = (subject.last_payment ?? subject.initial_payment ?? {}) as Record<string, unknown>
      const result = await reconcileGamingTebexRecurring({
        type: recurringType,
        recurringReference,
        statusId,
        nextPaymentAt: parseTebexDate(subject.next_payment_at),
        lastPaymentAt: parseTebexDate(lastPayment.created_at),
        cancelReason: typeof subject.cancel_reason === "string" ? subject.cancel_reason : null,
        eventId: id,
      })

      // recurring-payment.started can arrive before payment.completed: when no
      // row holds the reference yet, activate from our GAME- reference instead.
      if (!result.handled && recurringType === "recurring-payment.started") {
        const reference = orderNumberFromPayload(payload)
        if (reference && isGamingReference(reference)) {
          const activated = await fulfillGamingTebexPayment({
            reference,
            recurringReference,
            paidAt: parseTebexDate(lastPayment.created_at) ?? parseTebexDate(subject.created_at),
            eventId: id,
          })
          await record(activated.handled ? "resolved" : "ignored")
          return NextResponse.json({ received: true, fulfilled: activated.handled })
        }
      }

      await record(result.handled ? "resolved" : "ignored")
      return NextResponse.json({ received: true, fulfilled: result.handled })
    }

    if (normalizedType !== "paymentcompleted" && normalizedType !== "paymentcomplete") {
      await record("ignored")
      return NextResponse.json({ received: true, ignored: type || "unknown" })
    }

    const orderNumber = orderNumberFromPayload(payload)
    if (!orderNumber) return NextResponse.json({ error: "Tebex payment has no DistroSource order number." }, { status: 400 })

    // --- Gaming subscription activation -------------------------------------
    if (isGamingReference(orderNumber)) {
      const result = await fulfillGamingTebexPayment({
        reference: orderNumber,
        recurringReference: findString(payload, ["recurring_payment_reference"]),
        paidAt: parseTebexDate(findString(payload, ["settled_at"]) ?? findString(payload, ["created_at"])),
        eventId: id,
      })
      await record(result.handled ? "resolved" : "ignored")
      return NextResponse.json({ received: true, fulfilled: result.handled })
    }

    // --- One-time store order -----------------------------------------------
    const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1)
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 })

    await fulfillPendingOrder(order, { paymentMethod: "tebex" })
    await record("resolved", order.userId)

    return NextResponse.json({ received: true, fulfilled: true })
  } catch (error) {
    console.error("[v0] Tebex webhook failed:", error)
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ endpoint: "tebex", status: "ok" })
}

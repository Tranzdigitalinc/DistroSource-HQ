import { createHash, createHmac, timingSafeEqual } from "node:crypto"
import { and, eq } from "drizzle-orm"
import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { operationEvents, orders } from "@/lib/db/schema"
import { fulfillPendingOrder } from "@/lib/checkout-core"

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

function orderNumberFromPayload(payload: Record<string, unknown>) {
  return findString(payload, [
    "distrosource_order_number",
    "order_number",
    "orderNumber",
    "custom_order_number",
  ])
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

    const normalizedType = type.replace(/[^a-z0-9]/g, "")
    if (normalizedType !== "paymentcompleted" && normalizedType !== "paymentcomplete") {
      if (id) {
        await db.insert(operationEvents).values({
          eventType: "tebex_webhook",
          entityType: "payment",
          entityId: id,
          status: "ignored",
          payload,
          resolvedAt: new Date(),
        })
      }
      return NextResponse.json({ received: true, ignored: type || "unknown" })
    }

    const orderNumber = orderNumberFromPayload(payload)
    if (!orderNumber) return NextResponse.json({ error: "Tebex payment has no DistroSource order number." }, { status: 400 })

    const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1)
    if (!order) return NextResponse.json({ error: "Order not found." }, { status: 404 })

    await fulfillPendingOrder(order, { paymentMethod: "tebex" })

    if (id) {
      await db.insert(operationEvents).values({
        eventType: "tebex_webhook",
        entityType: "payment",
        entityId: id,
        status: "resolved",
        payload,
        createdBy: order.userId,
        resolvedAt: new Date(),
      })
    }

    return NextResponse.json({ received: true, fulfilled: true })
  } catch (error) {
    console.error("[v0] Tebex webhook failed:", error)
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ endpoint: "tebex", status: "ok" })
}

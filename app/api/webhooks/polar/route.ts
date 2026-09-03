import { NextResponse } from "next/server"
import { validateEvent } from "@polar-sh/sdk/webhooks"
import { and, eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { db } from "@/lib/db"
import { operationEvents, orders, user } from "@/lib/db/schema"
import { computeOrderPricing, persistOrder } from "@/lib/actions/checkout"
import { getPolarWebhookSecret } from "@/lib/polar"
import { getSession } from "@/lib/session"

export async function POST(request: Request) {
  const body = await request.text()
  let event: Awaited<ReturnType<typeof validateEvent>>
  try {
    event = validateEvent(body, Object.fromEntries(request.headers.entries()), getPolarWebhookSecret())
  } catch (error) {
    console.error("[v0] Polar webhook verification failed", error)
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 })
  }

  if (event.type !== "order.paid") return NextResponse.json({ received: true })

  const polarOrder = event.data
  const checkoutId = polarOrder.checkoutId
  if (!checkoutId || !polarOrder.paid) return NextResponse.json({ received: true })

  const [existing] = await db.select({ id: orders.id }).from(orders).where(eq(orders.polarCheckoutId, checkoutId)).limit(1)
  if (existing) return NextResponse.json({ received: true, duplicate: true })

  const ownerId = String(polarOrder.metadata.distrosource_owner_id ?? "")
  if (!ownerId) return NextResponse.json({ error: "Missing checkout owner" }, { status: 400 })

  const [account] = await db.select({ email: user.email, name: user.name }).from(user).where(eq(user.id, ownerId)).limit(1)
  if (!account) return NextResponse.json({ error: "Checkout owner not found" }, { status: 400 })

  const pricing = await computeOrderPricing(
    ownerId,
    typeof polarOrder.metadata.distrosource_coupon === "string" ? polarOrder.metadata.distrosource_coupon || undefined : undefined,
    await getSession(),
    await cookies(),
  )
  if (pricing.total !== polarOrder.totalAmount / 100 || polarOrder.currency.toLowerCase() !== "usd") {
    await db.insert(operationEvents).values({ eventType: "polar_amount_mismatch", entityType: "polar_order", entityId: polarOrder.id, status: "open", payload: { expected: pricing.total, received: polarOrder.totalAmount / 100, currency: polarOrder.currency }, createdBy: ownerId })
    return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 })
  }

  const result = await persistOrder(pricing, account.email, polarOrder.billingName ?? account.name ?? "Customer", null, "polar", undefined, { polarCheckoutId: checkoutId, polarOrderId: polarOrder.id })
  return NextResponse.json({ received: true, orderNumber: result.orderNumber })
}

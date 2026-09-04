import { NextResponse } from "next/server"
import { validateEvent } from "@polar-sh/sdk/webhooks"
import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { entitlements, operationEvents, orderItems, orders } from "@/lib/db/schema"
import { getPolarWebhookSecret } from "@/lib/polar"
import { sendOrderConfirmationEmail } from "@/lib/email"

export async function POST(request: Request) {
  const body = await request.text()
  let event: Awaited<ReturnType<typeof validateEvent>>
  try {
    event = validateEvent(body, Object.fromEntries(request.headers.entries()), getPolarWebhookSecret())
  } catch (error) {
    console.error("[v0] Polar webhook verification failed", error)
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 })
  }

  if (event.type !== "order.paid" && event.type !== "checkout.expired") return NextResponse.json({ received: true })
  const polarOrder = event.data as {
    id: string
    paid?: boolean
    metadata?: Record<string, string | number | boolean>
    currency: string
    netAmount: number
    totalAmount: number
    checkoutId?: string | null
  }
  const metadata = polarOrder.metadata ?? {}
  const internalOrderId = Number(metadata.distrosourceOrderId)
  if (!Number.isInteger(internalOrderId) || internalOrderId <= 0) {
    return NextResponse.json({ error: "Missing DistroSource order metadata" }, { status: 400 })
  }

  if (event.type === "order.paid") {
    if (!polarOrder.paid) return NextResponse.json({ received: true })
    const [order] = await db.select().from(orders).where(eq(orders.id, internalOrderId)).limit(1)
    if (!order) return NextResponse.json({ error: "Internal order not found" }, { status: 404 })
    if (order.status === "completed") return NextResponse.json({ received: true, duplicate: true })
    if (order.status !== "pending_payment") return NextResponse.json({ error: "Order is not payable" }, { status: 409 })
    if (polarOrder.currency.toLowerCase() !== order.currency || polarOrder.netAmount !== Math.round(Number(order.totalUsd) * 100)) {
      await db.insert(operationEvents).values({ eventType: "polar_amount_mismatch", entityType: "order", entityId: String(order.id), status: "open", payload: { expected: order.totalUsd, receivedNet: polarOrder.netAmount, receivedTotal: polarOrder.totalAmount, currency: polarOrder.currency }, createdBy: order.userId })
      return NextResponse.json({ error: "Payment amount mismatch" }, { status: 400 })
    }

    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id))
    await db.transaction(async (tx) => {
      await tx.update(orders).set({ status: "completed", polarOrderId: polarOrder.id, polarCheckoutId: polarOrder.checkoutId }).where(and(eq(orders.id, order.id), eq(orders.status, "pending_payment")))
      for (const item of items) {
        const [existing] = await tx.select({ id: entitlements.id }).from(entitlements).where(and(eq(entitlements.orderId, order.id), eq(entitlements.orderItemId, item.id))).limit(1)
        if (!existing) await tx.insert(entitlements).values({ userId: order.userId, productId: item.productId, licenseId: item.licenseId, orderId: order.id, orderItemId: item.id })
      }
      await tx.insert(operationEvents).values({ eventType: "checkout_completed", entityType: "order", entityId: String(order.id), status: "resolved", payload: { paymentMethod: "polar", polarOrderId: polarOrder.id }, createdBy: order.userId, resolvedAt: new Date() })
    })

    let confirmationEmailSent = false
    try {
      confirmationEmailSent = await sendOrderConfirmationEmail(order.billingEmail, order.orderNumber, items.map((item) => ({ productName: item.productName, licenseType: item.licenseType, quantity: item.quantity })))
    } catch (error) {
      console.error("[v0] Polar confirmation email failed", error)
    }
    if (confirmationEmailSent) await db.update(orders).set({ confirmationEmailSent: true }).where(eq(orders.id, order.id))
    return NextResponse.json({ received: true, orderNumber: order.orderNumber })
  }

  if (event.type === "checkout.expired") {
    await db.update(orders).set({ status: "expired" }).where(and(eq(orders.id, internalOrderId), eq(orders.status, "pending_payment")))
  }
  return NextResponse.json({ received: true })
}

export const dynamic = "force-dynamic"

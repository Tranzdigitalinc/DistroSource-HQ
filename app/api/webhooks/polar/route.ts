import { NextResponse } from "next/server"
import { validateEvent } from "@polar-sh/sdk/webhooks"
import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { cartItems, entitlements, operationEvents, orderItems, orders, polarWebhookEvents } from "@/lib/db/schema"
import { getPolarWebhookSecret } from "@/lib/polar"
import { sendOrderConfirmationEmail, sendRefundConfirmationEmail } from "@/lib/email"

type PolarOrderData = {
  id: string
  paid?: boolean
  metadata?: Record<string, string | number | boolean>
  currency: string
  netAmount: number
  totalAmount: number
  refundedAmount?: number
  checkoutId?: string | null
  customerId?: string | null
}

export async function POST(request: Request) {
  const body = await request.text()
  let event: Awaited<ReturnType<typeof validateEvent>>
  try {
    event = validateEvent(body, Object.fromEntries(request.headers.entries()), getPolarWebhookSecret())
  } catch (error) {
    console.error("[v0] Polar webhook verification failed", error)
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 })
  }

  if (event.type !== "order.paid" && event.type !== "checkout.expired" && event.type !== "order.refunded") {
    return NextResponse.json({ received: true })
  }

  const polarOrder = event.data as PolarOrderData
  const metadata = polarOrder.metadata ?? {}
  const internalOrderId = Number(metadata.distrosourceOrderId)
  if (!Number.isInteger(internalOrderId) || internalOrderId <= 0) {
    return NextResponse.json({ error: "Missing DistroSource order metadata" }, { status: 400 })
  }

  // Idempotency: Polar (like any webhook sender) may redeliver the same
  // event on retry or if our response is lost in transit. The "webhook-id"
  // header is a stable per-delivery id (standardwebhooks/svix convention).
  // Claiming it here — before any side effects — means a redelivered event
  // is a no-op even if it arrives concurrently with the original.
  const deliveryId = request.headers.get("webhook-id")
  if (deliveryId) {
    const claimed = await db
      .insert(polarWebhookEvents)
      .values({ id: deliveryId, eventType: event.type, orderId: internalOrderId, payload: polarOrder })
      .onConflictDoNothing()
      .returning({ id: polarWebhookEvents.id })
    if (claimed.length === 0) {
      return NextResponse.json({ received: true, duplicate: true })
    }
  }

  if (event.type === "order.paid") {
    // order.paid is the ONLY event that fulfills an order — checkout
    // completion, the success page, and customer_session_token are purely
    // for display and must never grant entitlements on their own.
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
      await tx
        .update(orders)
        .set({
          status: "completed",
          polarOrderId: polarOrder.id,
          polarCheckoutId: polarOrder.checkoutId,
          polarCustomerId: polarOrder.customerId ?? null,
          polarPaidAmount: (polarOrder.totalAmount / 100).toFixed(2),
          polarPaidCurrency: polarOrder.currency.toLowerCase(),
          polarPaidAt: new Date(),
        })
        .where(and(eq(orders.id, order.id), eq(orders.status, "pending_payment")))
      // Cart is cleared here — once payment is actually confirmed — rather
      // than when the checkout session was created, so an abandoned or
      // declined Polar checkout never leaves the buyer with an empty cart.
      await tx.delete(cartItems).where(eq(cartItems.userId, order.userId))
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

  if (event.type === "order.refunded") {
    const [order] = await db.select().from(orders).where(eq(orders.id, internalOrderId)).limit(1)
    if (!order) return NextResponse.json({ error: "Internal order not found" }, { status: 404 })
    // Only a completed (paid) order can be refunded. If it never reached
    // order.paid, there's nothing to revoke or reverse.
    if (order.status !== "completed" && order.status !== "partially_refunded") {
      return NextResponse.json({ received: true, ignored: true })
    }

    const refundedCents = polarOrder.refundedAmount ?? 0
    const totalCents = Math.round(Number(order.totalUsd) * 100)
    const isFullRefund = refundedCents >= totalCents
    const refundedAmountUsd = (refundedCents / 100).toFixed(2)

    await db.transaction(async (tx) => {
      await tx
        .update(orders)
        .set({
          status: isFullRefund ? "refunded" : "partially_refunded",
          polarRefundedAmount: refundedAmountUsd,
          polarRefundedAt: new Date(),
        })
        .where(eq(orders.id, order.id))

      // Refund policy: only a full refund revokes entitlements and blocks
      // downloads. A partial refund is recorded but the buyer keeps access —
      // it's on support to intervene manually if that's not appropriate for
      // a given case.
      if (isFullRefund) {
        await tx.update(orderItems).set({ isVoided: true }).where(eq(orderItems.orderId, order.id))
        await tx.update(entitlements).set({ isRevoked: true }).where(eq(entitlements.orderId, order.id))
      }

      await tx.insert(operationEvents).values({
        eventType: "order_refunded",
        entityType: "order",
        entityId: String(order.id),
        status: "resolved",
        payload: { paymentMethod: "polar", polarOrderId: polarOrder.id, refundedAmountUsd, isFullRefund },
        createdBy: order.userId,
        resolvedAt: new Date(),
      })
    })

    if (isFullRefund) {
      try {
        await sendRefundConfirmationEmail(order.billingEmail, order.orderNumber, Number(order.totalUsd))
      } catch (error) {
        console.error("[v0] Polar refund confirmation email failed", error)
      }
    }

    return NextResponse.json({ received: true, orderNumber: order.orderNumber, isFullRefund })
  }

  if (event.type === "checkout.expired") {
    await db.update(orders).set({ status: "expired" }).where(and(eq(orders.id, internalOrderId), eq(orders.status, "pending_payment")))
  }
  return NextResponse.json({ received: true })
}

export const dynamic = "force-dynamic"

"use server"

import { and, desc, eq, ilike, or } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { entitlements, operationEvents, orderItems, orders } from "@/lib/db/schema"
import { requireAdmin } from "@/lib/actions/operations"
import { sendRefundConfirmationEmail } from "@/lib/email"
import { refundPaypalCapture } from "@/lib/paypal"
import { getPolarClient } from "@/lib/polar"

export async function searchOrders(query: string) {
  await requireAdmin()
  const trimmed = query.trim()
  if (!trimmed) return db.select().from(orders).orderBy(desc(orders.createdAt)).limit(25)
  return db
    .select()
    .from(orders)
    .where(or(ilike(orders.orderNumber, `%${trimmed}%`), ilike(orders.billingEmail, `%${trimmed}%`)))
    .orderBy(desc(orders.createdAt))
    .limit(25)
}

export async function getOrderForAdmin(orderNumber: string) {
  await requireAdmin()
  const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1)
  if (!order) return null
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id))
  const fraudEvents = await db
    .select()
    .from(operationEvents)
    .where(and(eq(operationEvents.entityType, "order"), eq(operationEvents.entityId, String(order.id)), eq(operationEvents.eventType, "fraud_flagged")))
    .orderBy(desc(operationEvents.createdAt))
  const isFlagged = fraudEvents.some((event) => event.status === "open")
  return { order, items, isFlagged, fraudEvents }
}

/**
 * Refunds an order through whichever provider actually took the money.
 *
 * Provider-aware by necessity: the previous implementation was PayPal-only and
 * required `paypalCaptureId`, which no Polar order has — so admin refunds were
 * impossible for every real order on the store.
 *
 * Polar orders:
 *   The refund is *requested* here via Polar's Refunds API. DistroSource does
 *   NOT mark the order refunded at this point. Polar confirms asynchronously
 *   and the verified `order.refunded` webhook performs the state transition,
 *   entitlement revocation and customer email. That keeps a single
 *   authoritative fulfilment/refund path and makes double-processing
 *   impossible — the webhook is already idempotent on its delivery id.
 *
 * PayPal orders:
 *   Legacy path, retained for historical orders. PayPal has no refund webhook
 *   wired up here, so this path applies the state change itself.
 *
 * Partial refunds are supported: Polar accepts an `amount` in cents, and the
 * order model represents them as `partially_refunded` with a running
 * `polarRefundedAmount`. Per the refund policy, only a FULL refund revokes
 * entitlements; a partial refund leaves the customer's access intact.
 */
export async function refundOrder(
  orderId: number,
  reason: string,
  options?: { amountUsd?: number },
) {
  const userId = await requireAdmin()
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1)
  if (!order) throw new Error("Order not found.")

  // Only money that was actually captured can be returned.
  if (order.status !== "completed" && order.status !== "partially_refunded") {
    throw new Error(
      order.status === "refunded"
        ? "This order has already been fully refunded."
        : `An order with status "${order.status}" has no captured payment to refund.`,
    )
  }

  const totalCents = Math.round(Number(order.totalUsd) * 100)
  const alreadyRefundedCents = Math.round(Number(order.polarRefundedAmount ?? 0) * 100)
  const remainingCents = totalCents - alreadyRefundedCents
  if (remainingCents <= 0) throw new Error("This order has no remaining refundable balance.")

  // Amount is validated against server-side order state, never trusted from
  // the caller beyond an upper bound check.
  const requestedCents =
    options?.amountUsd === undefined ? remainingCents : Math.round(options.amountUsd * 100)
  if (!Number.isInteger(requestedCents) || requestedCents < 1) {
    throw new Error("Enter a refund amount of at least $0.01.")
  }
  if (requestedCents > remainingCents) {
    throw new Error(
      `That exceeds the refundable balance of $${(remainingCents / 100).toFixed(2)} on this order.`,
    )
  }

  const isPolarOrder = order.paymentMethod === "polar" || Boolean(order.polarOrderId)
  const comment = reason.trim() || "Refund issued by DistroSource support"

  if (isPolarOrder) {
    if (!order.polarOrderId) {
      throw new Error(
        "This Polar order has no recorded Polar order id yet, so it cannot be refunded automatically. It may still be awaiting payment confirmation.",
      )
    }

    // Not wrapped in try/catch on purpose: if Polar rejects the refund, the
    // order must stay exactly as it was rather than appear refunded with no
    // money returned.
    const refund = await getPolarClient().refunds.create({
      orderId: order.polarOrderId,
      reason: "customer_request",
      amount: requestedCents,
      comment,
      metadata: { distrosourceOrderId: order.id, requestedBy: userId },
    })

    // Record the request for audit. Deliberately does NOT change order status,
    // void items or revoke entitlements — the order.refunded webhook owns that
    // transition once Polar confirms.
    await db.insert(operationEvents).values({
      eventType: "refund_requested",
      entityType: "order",
      entityId: String(order.id),
      status: refund.status === "succeeded" ? "resolved" : "open",
      payload: {
        provider: "polar",
        orderNumber: order.orderNumber,
        polarOrderId: order.polarOrderId,
        polarRefundId: refund.id,
        refundStatus: refund.status,
        amountUsd: (requestedCents / 100).toFixed(2),
        currency: refund.currency,
        isFullRefund: requestedCents >= remainingCents,
        reason: reason.trim() || null,
      },
      createdBy: userId,
      resolvedAt: refund.status === "succeeded" ? new Date() : null,
    })

    revalidatePath(`/admin/orders/${order.orderNumber}`)
    revalidatePath("/admin/orders")
    revalidatePath("/admin")

    return {
      success: true as const,
      provider: "polar" as const,
      refundId: refund.id,
      status: refund.status,
      amountUsd: (requestedCents / 100).toFixed(2),
      // The customer email and access change are sent by the webhook, not here.
      pendingWebhookConfirmation: true as const,
    }
  }

  // --- Legacy PayPal path -------------------------------------------------
  if (!order.paypalCaptureId) {
    throw new Error(
      "This order has no recorded Polar or PayPal payment reference, so it cannot be refunded automatically. Refund it from the provider dashboard and record it manually.",
    )
  }

  await refundPaypalCapture(order.paypalCaptureId, comment)

  const isFullRefund = requestedCents >= remainingCents
  await db.transaction(async (tx) => {
    await tx
      .update(orders)
      .set({
        status: isFullRefund ? "refunded" : "partially_refunded",
        polarRefundedAmount: ((alreadyRefundedCents + requestedCents) / 100).toFixed(2),
        polarRefundedAt: new Date(),
      })
      .where(eq(orders.id, orderId))

    // Matches the webhook's policy: partial refunds keep customer access.
    if (isFullRefund) {
      await tx.update(orderItems).set({ isVoided: true }).where(eq(orderItems.orderId, orderId))
      await tx.update(entitlements).set({ isRevoked: true }).where(eq(entitlements.orderId, orderId))
    }

    await tx.insert(operationEvents).values({
      eventType: "order_refunded",
      entityType: "order",
      entityId: String(orderId),
      status: "resolved",
      payload: {
        provider: "paypal",
        orderNumber: order.orderNumber,
        reason: reason.trim() || null,
        amountUsd: (requestedCents / 100).toFixed(2),
        isFullRefund,
      },
      createdBy: userId,
      resolvedAt: new Date(),
    })
  })

  if (isFullRefund) {
    await sendRefundConfirmationEmail(
      order.billingEmail,
      order.orderNumber,
      Number(order.totalUsd),
      reason.trim() || undefined,
    )
  }

  revalidatePath(`/admin/orders/${order.orderNumber}`)
  revalidatePath("/admin/orders")
  revalidatePath("/admin")
  return {
    success: true as const,
    provider: "paypal" as const,
    amountUsd: (requestedCents / 100).toFixed(2),
    pendingWebhookConfirmation: false as const,
  }
}

export async function flagOrderForFraud(orderId: number, note: string) {
  const userId = await requireAdmin()
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1)
  if (!order) throw new Error("Order not found.")

  await db.insert(operationEvents).values({
    eventType: "fraud_flagged",
    entityType: "order",
    entityId: String(orderId),
    status: "open",
    payload: { orderNumber: order.orderNumber, note: note.trim() || null },
    createdBy: userId,
  })

  revalidatePath(`/admin/orders/${order.orderNumber}`)
  revalidatePath("/admin")
  return { success: true }
}

export async function clearFraudFlag(orderId: number) {
  const userId = await requireAdmin()
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1)
  if (!order) throw new Error("Order not found.")

  await db
    .update(operationEvents)
    .set({ status: "resolved", resolvedAt: new Date(), createdBy: userId })
    .where(and(eq(operationEvents.entityType, "order"), eq(operationEvents.entityId, String(orderId)), eq(operationEvents.eventType, "fraud_flagged"), eq(operationEvents.status, "open")))

  revalidatePath(`/admin/orders/${order.orderNumber}`)
  revalidatePath("/admin")
  return { success: true }
}

export async function getFraudQueue() {
  await requireAdmin()
  return db
    .select()
    .from(operationEvents)
    .where(and(eq(operationEvents.eventType, "fraud_flagged"), eq(operationEvents.status, "open")))
    .orderBy(desc(operationEvents.createdAt))
    .limit(25)
}

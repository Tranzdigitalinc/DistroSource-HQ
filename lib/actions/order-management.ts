"use server"

import { and, desc, eq, ilike, or } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { entitlements, operationEvents, orderItems, orders } from "@/lib/db/schema"
import { requireAdmin } from "@/lib/actions/operations"
import { sendRefundConfirmationEmail } from "@/lib/email"
import { refundPaypalCapture } from "@/lib/paypal"

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
 * Refunds an order: returns the money via the PayPal capture that was
 * actually charged, then marks the order refunded, voids each order item,
 * and revokes the entitlements it granted so the buyer immediately loses
 * download access and the products drop out of their library.
 *
 * The PayPal refund call happens first and is not caught — if it fails
 * (e.g. already refunded on PayPal's side, capture not found), the order
 * is deliberately left untouched rather than marked "refunded" with no
 * money actually returned.
 */
export async function refundOrder(orderId: number, reason: string) {
  const userId = await requireAdmin()
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1)
  if (!order) throw new Error("Order not found.")
  if (order.status === "refunded") throw new Error("This order has already been refunded.")
  if (!order.paypalCaptureId) {
    throw new Error("This order has no recorded PayPal capture, so it cannot be refunded automatically.")
  }

  await refundPaypalCapture(order.paypalCaptureId, reason.trim() || "Refund issued by DistroSource support")

  await db.update(orders).set({ status: "refunded" }).where(eq(orders.id, orderId))
  await db.update(orderItems).set({ isVoided: true }).where(eq(orderItems.orderId, orderId))
  await db.update(entitlements).set({ isRevoked: true }).where(eq(entitlements.orderId, orderId))

  await db.insert(operationEvents).values({
    eventType: "order_refunded",
    entityType: "order",
    entityId: String(orderId),
    status: "resolved",
    payload: { orderNumber: order.orderNumber, reason: reason.trim() || null, totalUsd: order.totalUsd },
    createdBy: userId,
    resolvedAt: new Date(),
  })

  await sendRefundConfirmationEmail(order.billingEmail, order.orderNumber, Number(order.totalUsd), reason.trim() || undefined)

  revalidatePath(`/admin/orders/${order.orderNumber}`)
  revalidatePath("/admin/orders")
  revalidatePath("/admin")
  return { success: true }
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

"use server"

import { and, desc, eq, ilike, or } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { operationEvents, orderItems, orders } from "@/lib/db/schema"
import { requireAdmin } from "@/lib/actions/operations"
import { generateRedemptionCode } from "@/lib/format"
import { sendRefundConfirmationEmail, sendReplacementCodeEmail } from "@/lib/email"

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

export async function refundOrder(orderId: number, reason: string) {
  const userId = await requireAdmin()
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1)
  if (!order) throw new Error("Order not found.")
  if (order.status === "refunded") throw new Error("This order has already been refunded.")

  await db.update(orders).set({ status: "refunded" }).where(eq(orders.id, orderId))
  await db.update(orderItems).set({ isVoided: true }).where(eq(orderItems.orderId, orderId))

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

export async function replaceOrderItem(orderItemId: number) {
  const userId = await requireAdmin()
  const [item] = await db.select().from(orderItems).where(eq(orderItems.id, orderItemId)).limit(1)
  if (!item) throw new Error("Order item not found.")
  if (item.isVoided) throw new Error("This item has already been voided or replaced.")

  const [order] = await db.select().from(orders).where(eq(orders.id, item.orderId)).limit(1)
  if (!order) throw new Error("Order not found.")

  const newCode = generateRedemptionCode()
  await db.update(orderItems).set({ redemptionCode: newCode, isRevealed: false }).where(eq(orderItems.id, orderItemId))

  await db.insert(operationEvents).values({
    eventType: "replacement_issued",
    entityType: "order_item",
    entityId: String(orderItemId),
    status: "resolved",
    payload: { orderNumber: order.orderNumber, productName: item.productName },
    createdBy: userId,
    resolvedAt: new Date(),
  })

  await sendReplacementCodeEmail(order.billingEmail, order.orderNumber, item.productName, item.denominationLabel, newCode)

  revalidatePath(`/admin/orders/${order.orderNumber}`)
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

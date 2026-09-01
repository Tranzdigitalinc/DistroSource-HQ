"use server"

import { db } from "@/lib/db"
import { bulkGiftRequests, notificationPreferences, operationEvents, orderItems, orders, supportTickets } from "@/lib/db/schema"
import { getUserId, getOptionalUserId, getOptionalOwnerId } from "@/lib/session"
import { and, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { sendOrderConfirmationEmail } from "@/lib/email"

const NOTIFICATION_DEFAULTS = {
  orderUpdates: true,
  deals: true,
  productNews: false,
  accountAlerts: true,
}

export async function getNotificationPreferences() {
  const userId = await getUserId()
  const rows = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1)

  if (rows.length === 0) return NOTIFICATION_DEFAULTS
  const { orderUpdates, deals, productNews, accountAlerts } = rows[0]
  return { orderUpdates, deals, productNews, accountAlerts }
}

export async function updateNotificationPreference(
  key: "orderUpdates" | "deals" | "productNews" | "accountAlerts",
  value: boolean,
) {
  const userId = await getUserId()

  await db
    .insert(notificationPreferences)
    .values({ userId, ...NOTIFICATION_DEFAULTS, [key]: value })
    .onConflictDoUpdate({
      target: notificationPreferences.userId,
      set: { [key]: value, updatedAt: new Date() },
    })

  return { success: true }
}

export async function getUserOrders() {
  const userId = await getOptionalUserId()
  if (!userId) return []
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt))
}

export async function getOrderByNumber(orderNumber: string) {
  const ownerId = await getOptionalOwnerId()
  if (!ownerId) return null

  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1)

  const order = rows[0]
  if (!order || order.userId !== ownerId) return null

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id))
  return { order, items }
}

export async function resendOrderConfirmationEmail(orderNumber: string) {
  const ownerId = await getOptionalOwnerId()
  if (!ownerId) throw new Error("Sign in to resend your confirmation email.")

  const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1)
  if (!order || order.userId !== ownerId) throw new Error("Order not found.")

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id))
  const sent = await sendOrderConfirmationEmail(
    order.billingEmail,
    order.orderNumber,
    items.map((item) => ({
      productName: item.productName,
      denominationLabel: item.denominationLabel,
      quantity: item.quantity,
      redemptionCode: item.redemptionCode,
    })),
  )

  if (!sent) throw new Error("Could not resend the confirmation email. Please try again shortly.")

  await db.update(orders).set({ confirmationEmailSent: true }).where(eq(orders.id, order.id))
  await db
    .update(operationEvents)
    .set({ status: "resolved", resolvedAt: new Date() })
    .where(and(eq(operationEvents.entityType, "order"), eq(operationEvents.entityId, String(order.id)), eq(operationEvents.eventType, "confirmation_email_failed"), eq(operationEvents.status, "open")))

  revalidatePath(`/account/orders/${orderNumber}`)
  return { success: true }
}

export async function getUserOrderItems() {
  const userId = await getOptionalUserId()
  if (!userId) return []

  const userOrders = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt))
  if (userOrders.length === 0) return []

  const results = []
  for (const order of userOrders) {
    const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id))
    results.push({ order, items })
  }
  return results
}

export async function submitSupportTicket(input: {
  subject: string
  category: string
  message: string
  orderNumber?: string
}) {
  const userId = await getUserId()

  const subject = input.subject.trim()
  const message = input.message.trim()
  if (!subject) throw new Error("Enter a subject for your ticket.")
  if (!message || message.length < 10) throw new Error("Enter a message with at least 10 characters.")

  await db.insert(supportTickets).values({
    userId,
    subject,
    category: input.category,
    message,
    orderNumber: input.orderNumber || null,
  })
  revalidatePath("/account/support")
  return { success: true }
}

export async function getUserSupportTickets() {
  const userId = await getOptionalUserId()
  if (!userId) return []
  return db.select().from(supportTickets).where(eq(supportTickets.userId, userId)).orderBy(desc(supportTickets.createdAt))
}

export async function submitBulkGiftRequest(input: {
  companyName: string
  contactName: string
  contactEmail: string
  productInterest?: string
  quantityEstimate?: number
  budgetUsd?: number
  message?: string
}) {
  const userId = await getOptionalUserId()
  await db.insert(bulkGiftRequests).values({
    userId,
    companyName: input.companyName,
    contactName: input.contactName,
    contactEmail: input.contactEmail,
    productInterest: input.productInterest || null,
    quantityEstimate: input.quantityEstimate ?? null,
    budgetUsd: input.budgetUsd?.toFixed(2) ?? null,
    message: input.message || null,
  })
  return { success: true }
}

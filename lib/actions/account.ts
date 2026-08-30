"use server"

import { db } from "@/lib/db"
import { bulkGiftRequests, orderItems, orders, supportTickets } from "@/lib/db/schema"
import { getUserId, getOptionalUserId } from "@/lib/session"
import { desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function getUserOrders() {
  const userId = await getOptionalUserId()
  if (!userId) return []
  return db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt))
}

export async function getOrderByNumber(orderNumber: string) {
  const userId = await getUserId()
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber))
    .limit(1)

  const order = rows[0]
  if (!order || order.userId !== userId) return null

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id))
  return { order, items }
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
  await db.insert(supportTickets).values({
    userId,
    subject: input.subject,
    category: input.category,
    message: input.message,
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

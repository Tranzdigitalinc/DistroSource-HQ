"use server"

import { db } from "@/lib/db"
import {
  downloadEvents,
  entitlements,
  notificationPreferences,
  operationEvents,
  orderItems,
  orders,
  productFiles,
  productLicenses,
  products,
  supportTickets,
  teamLicenseRequests,
} from "@/lib/db/schema"
import { getUserId, getOptionalUserId, getOptionalOwnerId, getSession } from "@/lib/session"
import { and, desc, eq, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { sendOrderConfirmationEmail } from "@/lib/email"

const NOTIFICATION_DEFAULTS = {
  productUpdates: true,
  newReleases: true,
  promotions: true,
  orderUpdates: true,
}

export async function getNotificationPreferences() {
  const userId = await getUserId()
  const rows = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1)

  if (rows.length === 0) return NOTIFICATION_DEFAULTS
  const { productUpdates, newReleases, promotions, orderUpdates } = rows[0]
  return { productUpdates, newReleases, promotions, orderUpdates }
}

export async function updateNotificationPreference(
  key: "productUpdates" | "newReleases" | "promotions" | "orderUpdates",
  value: boolean,
) {
  const userId = await getUserId()

  await db
    .insert(notificationPreferences)
    .values({ userId, ...NOTIFICATION_DEFAULTS, [key]: value })
    .onConflictDoUpdate({
      target: notificationPreferences.userId,
      set: { [key]: value },
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
      licenseType: item.licenseType,
      quantity: item.quantity,
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

// Admin-only variant of the above: looks the order up by number without an
// ownership check, since admins retry confirmation emails on behalf of any
// customer. Callers MUST gate this behind their own admin check — it is not
// exported to any customer-facing surface.
export async function resendOrderConfirmationEmailForAdmin(orderNumber: string) {
  const [order] = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1)
  if (!order) throw new Error("Order not found.")

  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id))
  const sent = await sendOrderConfirmationEmail(
    order.billingEmail,
    order.orderNumber,
    items.map((item) => ({
      productName: item.productName,
      licenseType: item.licenseType,
      quantity: item.quantity,
    })),
  )

  if (!sent) throw new Error("Could not resend the confirmation email. Please try again shortly.")

  await db.update(orders).set({ confirmationEmailSent: true }).where(eq(orders.id, order.id))
  await db
    .update(operationEvents)
    .set({ status: "resolved", resolvedAt: new Date() })
    .where(and(eq(operationEvents.entityType, "order"), eq(operationEvents.entityId, String(order.id)), eq(operationEvents.eventType, "confirmation_email_failed"), eq(operationEvents.status, "open")))

  revalidatePath(`/account/orders/${orderNumber}`)
  revalidatePath("/admin")
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

/**
 * My Library: every product the signed-in user owns via a non-revoked
 * entitlement, with the product record and the files available for that
 * license attached so the page can render download buttons directly.
 */
export async function getUserLibrary() {
  const userId = await getOptionalUserId()
  if (!userId) return []

  const rows = await db
    .select({ entitlement: entitlements, product: products, license: productLicenses })
    .from(entitlements)
    .innerJoin(products, eq(entitlements.productId, products.id))
    .innerJoin(productLicenses, eq(entitlements.licenseId, productLicenses.id))
    .where(and(eq(entitlements.userId, userId), eq(entitlements.isRevoked, false)))
    .orderBy(desc(entitlements.createdAt))

  if (rows.length === 0) return []

  const productIds = rows.map((r) => r.product.id)
  const files = await db.select().from(productFiles).where(inArray(productFiles.productId, productIds))
  const filesByProduct = new Map<number, typeof files>()
  for (const file of files) {
    const list = filesByProduct.get(file.productId) ?? []
    list.push(file)
    filesByProduct.set(file.productId, list)
  }

  return rows.map((row) => ({
    ...row,
    files: (filesByProduct.get(row.product.id) ?? []).filter(
      (file) => file.licenseType === null || file.licenseType === row.license.licenseType,
    ),
  }))
}

/**
 * Download history for the signed-in user, most recent first — real events
 * only, sourced from download_events rows written by the download route.
 */
export async function getUserDownloadHistory(limit = 50) {
  const userId = await getOptionalUserId()
  if (!userId) return []

  return db
    .select({ downloadEvent: downloadEvents, file: productFiles, product: products })
    .from(downloadEvents)
    .innerJoin(productFiles, eq(downloadEvents.productFileId, productFiles.id))
    .innerJoin(products, eq(productFiles.productId, products.id))
    .where(eq(downloadEvents.userId, userId))
    .orderBy(desc(downloadEvents.downloadedAt))
    .limit(limit)
}

export async function submitSupportTicket(input: {
  subject: string
  category: string
  message: string
  orderNumber?: string
}) {
  const userId = await getUserId()
  const session = await getSession()
  const email = session?.user?.email
  if (!email) throw new Error("Sign in to submit a support ticket.")

  const subject = input.subject.trim()
  const message = input.message.trim()
  if (!subject) throw new Error("Enter a subject for your ticket.")
  if (!message || message.length < 10) throw new Error("Enter a message with at least 10 characters.")

  await db.insert(supportTickets).values({
    userId,
    email,
    subject: `[${input.category}] ${subject}`,
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

export async function submitTeamLicenseRequest(input: {
  companyName: string
  contactName: string
  contactEmail: string
  productInterest?: string
  seatsEstimate?: number
  budgetUsd?: number
  message?: string
}) {
  const userId = await getOptionalUserId()
  await db.insert(teamLicenseRequests).values({
    userId,
    companyName: input.companyName,
    contactName: input.contactName,
    contactEmail: input.contactEmail,
    productInterest: input.productInterest || null,
    seatsEstimate: input.seatsEstimate ?? null,
    budgetUsd: input.budgetUsd?.toFixed(2) ?? null,
    message: input.message || null,
  })
  return { success: true }
}

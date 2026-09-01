"use server"

import { and, desc, eq, inArray, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { brands, categories, operationEvents, productVariants, products } from "@/lib/db/schema"
import { getGuestId } from "@/lib/guest"
import { getOptionalOwnerId, getOwnerId, getSession } from "@/lib/session"

/**
 * Reattaches a guest's browsing history (recently viewed events) to their
 * account once they sign in, so anonymous browsing carries over instead of
 * resetting personalized recommendations to zero.
 */
export async function mergeGuestActivityIntoAccount() {
  const session = await getSession()
  const guestId = await getGuestId()
  if (!session?.user || !guestId || session.user.id === guestId) return { success: true }

  await db
    .update(operationEvents)
    .set({ createdBy: session.user.id })
    .where(and(eq(operationEvents.eventType, "product_viewed"), eq(operationEvents.createdBy, guestId)))

  return { success: true }
}

export async function recordRecentlyViewed(productId: number) {
  // Falls back to a guest cookie identity so anonymous visitors still get
  // recently-viewed tracking and personalized recommendations, not just
  // signed-in users.
  const ownerId = await getOwnerId()
  await db.insert(operationEvents).values({ eventType: "product_viewed", entityType: "product", entityId: String(productId), status: "resolved", createdBy: ownerId, resolvedAt: new Date() })
}

export async function getRecentlyViewed(limit = 6) {
  const ownerId = await getOptionalOwnerId()
  if (!ownerId) return []
  const events = await db.select({ entityId: operationEvents.entityId, viewedAt: sql<Date>`max(${operationEvents.createdAt})` }).from(operationEvents).where(and(eq(operationEvents.eventType, "product_viewed"), eq(operationEvents.createdBy, ownerId))).groupBy(operationEvents.entityId).orderBy(desc(sql`max(${operationEvents.createdAt})`)).limit(limit)
  const ids = events.map((event) => Number(event.entityId)).filter(Number.isFinite)
  if (!ids.length) return []
  const rows = await db.select({ product: products, brand: brands, category: categories }).from(products).innerJoin(brands, eq(products.brandId, brands.id)).innerJoin(categories, eq(products.categoryId, categories.id)).where(inArray(products.id, ids))
  const variants = await db.select().from(productVariants).where(inArray(productVariants.productId, ids))
  return ids.map((id) => { const row = rows.find((item) => item.product.id === id); return row ? { ...row, variants: variants.filter((variant) => variant.productId === id) } : null }).filter(Boolean)
}

"use server"

import { and, asc, desc, eq, inArray, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { categories, operationEvents, productImages, productLicenses, products } from "@/lib/db/schema"
import { getGuestId } from "@/lib/guest"
import { getOptionalOwnerId, getOwnerId, getSession } from "@/lib/session"

/**
 * Reattaches a guest's browsing history (recently viewed events) to their
 * account once they sign in, so anonymous browsing carries over instead of
 * resetting personalized recommendations to zero.
 */
const APPROVED_RIGHTS_STATUSES = ["original", "licensed_for_distribution", "supplier_verified"]

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

/**
 * Lightweight signal for recommendation personalization: the categories the
 * current visitor (guest or signed-in) has recently browsed, beyond just the
 * single product they're currently viewing.
 */
export async function getRecentBrowsingSignal(limit = 10) {
  const ownerId = await getOptionalOwnerId()
  if (!ownerId) return { categoryIds: [] as number[] }

  const events = await db
    .select({ entityId: operationEvents.entityId })
    .from(operationEvents)
    .where(and(eq(operationEvents.eventType, "product_viewed"), eq(operationEvents.createdBy, ownerId)))
    .orderBy(desc(operationEvents.createdAt))
    .limit(limit)

  const ids = events.map((event) => Number(event.entityId)).filter(Number.isFinite)
  if (!ids.length) return { categoryIds: [] }

  const rows = await db.select({ categoryId: products.categoryId }).from(products).where(inArray(products.id, ids))
  return {
    categoryIds: Array.from(new Set(rows.map((row) => row.categoryId))),
  }
}

export async function getRecentlyViewed(limit = 6) {
  const ownerId = await getOptionalOwnerId()
  if (!ownerId) return []
  const events = await db
    .select({ entityId: operationEvents.entityId, viewedAt: sql<Date>`max(${operationEvents.createdAt})` })
    .from(operationEvents)
    .where(and(eq(operationEvents.eventType, "product_viewed"), eq(operationEvents.createdBy, ownerId)))
    .groupBy(operationEvents.entityId)
    .orderBy(desc(sql`max(${operationEvents.createdAt})`))
    .limit(limit)
  const ids = events.map((event) => Number(event.entityId)).filter(Number.isFinite)
  if (!ids.length) return []

  const rows = await db
    .select({ product: products, category: categories })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    // A product viewed before it was unpublished must drop out of the rail
    // rather than remain visible to that visitor indefinitely.
    .where(and(inArray(products.id, ids), eq(products.status, "published"), eq(products.assetStatus, "ready"), inArray(products.rightsStatus, APPROVED_RIGHTS_STATUSES)))

  const [images, licenses] = await Promise.all([
    db.select().from(productImages).where(inArray(productImages.productId, ids)).orderBy(asc(productImages.sortOrder)),
    db.select().from(productLicenses).where(inArray(productLicenses.productId, ids)).orderBy(asc(productLicenses.sortOrder)),
  ])

  return ids
    .map((id) => {
      const row = rows.find((item) => item.product.id === id)
      if (!row) return null
      return {
        ...row,
        images: images.filter((image) => image.productId === id),
        licenses: licenses.filter((license) => license.productId === id),
      }
    })
    .filter(Boolean)
}

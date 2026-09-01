"use server"

import { and, desc, eq, inArray, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { brands, categories, operationEvents, productVariants, products } from "@/lib/db/schema"
import { getOptionalUserId } from "@/lib/session"

export async function recordRecentlyViewed(productId: number) {
  const userId = await getOptionalUserId()
  if (!userId) return
  await db.insert(operationEvents).values({ eventType: "product_viewed", entityType: "product", entityId: String(productId), status: "resolved", createdBy: userId, resolvedAt: new Date() })
}

export async function getRecentlyViewed(limit = 6) {
  const userId = await getOptionalUserId()
  if (!userId) return []
  const events = await db.select({ entityId: operationEvents.entityId, viewedAt: sql<Date>`max(${operationEvents.createdAt})` }).from(operationEvents).where(and(eq(operationEvents.eventType, "product_viewed"), eq(operationEvents.createdBy, userId))).groupBy(operationEvents.entityId).orderBy(desc(sql`max(${operationEvents.createdAt})`)).limit(limit)
  const ids = events.map((event) => Number(event.entityId)).filter(Number.isFinite)
  if (!ids.length) return []
  const rows = await db.select({ product: products, brand: brands, category: categories }).from(products).innerJoin(brands, eq(products.brandId, brands.id)).innerJoin(categories, eq(products.categoryId, categories.id)).where(inArray(products.id, ids))
  const variants = await db.select().from(productVariants).where(inArray(productVariants.productId, ids))
  return ids.map((id) => { const row = rows.find((item) => item.product.id === id); return row ? { ...row, variants: variants.filter((variant) => variant.productId === id) } : null }).filter(Boolean)
}

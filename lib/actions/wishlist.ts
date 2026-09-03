"use server"

import { db } from "@/lib/db"
import { wishlistItems } from "@/lib/db/schema"
import { getProductsByIds } from "@/lib/queries/catalog"
import { getOptionalUserId, getUserId } from "@/lib/session"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function toggleWishlist(productId: number) {
  const userId = await getUserId()

  const existing = await db
    .select()
    .from(wishlistItems)
    .where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.productId, productId)))
    .limit(1)

  if (existing[0]) {
    await db.delete(wishlistItems).where(eq(wishlistItems.id, existing[0].id))
    revalidatePath("/account/wishlist")
    return { wishlisted: false }
  }

  await db.insert(wishlistItems).values({ userId, productId })
  revalidatePath("/account/wishlist")
  return { wishlisted: true }
}

export async function getWishlistProductIds() {
  const userId = await getOptionalUserId()
  if (!userId) return []
  const rows = await db.select({ productId: wishlistItems.productId }).from(wishlistItems).where(eq(wishlistItems.userId, userId))
  return rows.map((r) => r.productId)
}

export async function getWishlistItems() {
  const userId = await getOptionalUserId()
  if (!userId) return []

  const wishRows = await db.select().from(wishlistItems).where(eq(wishlistItems.userId, userId))
  if (wishRows.length === 0) return []

  // Reuse the catalog's shared product-with-relations loader (images,
  // licenses, department, ratings) instead of re-deriving the same shape by
  // hand — keeps every product card on the site fed by one consistent shape.
  return getProductsByIds(wishRows.map((w) => w.productId))
}

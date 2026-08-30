"use server"

import { db } from "@/lib/db"
import { wishlistItems, products, brands, categories, productVariants } from "@/lib/db/schema"
import { getOptionalUserId, getUserId } from "@/lib/session"
import { and, eq, inArray } from "drizzle-orm"
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

  const productIds = wishRows.map((w) => w.productId)
  const rows = await db
    .select({ product: products, brand: brands, category: categories })
    .from(products)
    .innerJoin(brands, eq(products.brandId, brands.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(inArray(products.id, productIds))

  const variantRows = await db.select().from(productVariants).where(inArray(productVariants.productId, productIds))
  const variantsByProduct = new Map<number, typeof variantRows>()
  for (const v of variantRows) {
    const list = variantsByProduct.get(v.productId) ?? []
    list.push(v)
    variantsByProduct.set(v.productId, list)
  }

  return rows.map((r) => ({ ...r, variants: variantsByProduct.get(r.product.id) ?? [] }))
}

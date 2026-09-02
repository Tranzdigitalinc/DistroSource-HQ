"use server"

import { db } from "@/lib/db"
import { wishlistItems, products, categories, productImages, productLicenses } from "@/lib/db/schema"
import { getOptionalUserId, getUserId } from "@/lib/session"
import { and, asc, eq, inArray } from "drizzle-orm"
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
    .select({ product: products, category: categories })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(inArray(products.id, productIds))

  const [imageRows, licenseRows] = await Promise.all([
    db.select().from(productImages).where(inArray(productImages.productId, productIds)).orderBy(asc(productImages.sortOrder)),
    db.select().from(productLicenses).where(inArray(productLicenses.productId, productIds)).orderBy(asc(productLicenses.sortOrder)),
  ])

  const imagesByProduct = new Map<number, typeof imageRows>()
  for (const image of imageRows) {
    const list = imagesByProduct.get(image.productId) ?? []
    list.push(image)
    imagesByProduct.set(image.productId, list)
  }
  const licensesByProduct = new Map<number, typeof licenseRows>()
  for (const license of licenseRows) {
    const list = licensesByProduct.get(license.productId) ?? []
    list.push(license)
    licensesByProduct.set(license.productId, list)
  }

  return rows.map((r) => ({
    ...r,
    images: imagesByProduct.get(r.product.id) ?? [],
    licenses: licensesByProduct.get(r.product.id) ?? [],
  }))
}

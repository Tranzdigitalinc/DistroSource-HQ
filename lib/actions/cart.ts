"use server"

import { db } from "@/lib/db"
import { cartItems, productImages, productLicenses, products } from "@/lib/db/schema"
import { getOptionalOwnerId, getOwnerId } from "@/lib/session"
import { getGuestId } from "@/lib/guest"
import { and, asc, eq, inArray } from "drizzle-orm"
import { revalidatePath } from "next/cache"

const MAX_QUANTITY_PER_ITEM = 20

function clampQuantity(quantity: number) {
  return Math.min(Math.max(1, Math.trunc(quantity) || 1), MAX_QUANTITY_PER_ITEM)
}

export async function addToCart(productId: number, licenseId: number, quantity = 1) {
  const ownerId = await getOwnerId()
  const safeQuantity = clampQuantity(quantity)

  // Preview-only products (asset not attached yet) must never become purchasable,
  // even if a client bypasses the disabled button and calls this action directly.
  const [product] = await db.select({ assetStatus: products.assetStatus }).from(products).where(eq(products.id, productId)).limit(1)
  if (!product || product.assetStatus !== "ready") {
    throw new Error("This product isn't available for purchase yet.")
  }

  const existing = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.userId, ownerId), eq(cartItems.licenseId, licenseId)))
    .limit(1)

  if (existing[0]) {
    await db
      .update(cartItems)
      .set({ quantity: clampQuantity(existing[0].quantity + safeQuantity) })
      .where(eq(cartItems.id, existing[0].id))
  } else {
    await db.insert(cartItems).values({ userId: ownerId, productId, licenseId, quantity: safeQuantity })
  }

  revalidatePath("/cart")
  return { success: true }
}

export async function updateCartItemQuantity(cartItemId: number, quantity: number) {
  const ownerId = await getOwnerId()
  if (quantity <= 0) {
    await db.delete(cartItems).where(and(eq(cartItems.id, cartItemId), eq(cartItems.userId, ownerId)))
  } else {
    await db
      .update(cartItems)
      .set({ quantity: clampQuantity(quantity) })
      .where(and(eq(cartItems.id, cartItemId), eq(cartItems.userId, ownerId)))
  }
  revalidatePath("/cart")
  return { success: true }
}

export async function removeCartItem(cartItemId: number) {
  const ownerId = await getOwnerId()
  await db.delete(cartItems).where(and(eq(cartItems.id, cartItemId), eq(cartItems.userId, ownerId)))
  revalidatePath("/cart")
  return { success: true }
}

export async function clearCart() {
  const ownerId = await getOwnerId()
  await db.delete(cartItems).where(eq(cartItems.userId, ownerId))
  revalidatePath("/cart")
}

export async function mergeGuestCartIntoAccount() {
  const session = await getOptionalOwnerId()
  const guestId = await getGuestId()
  if (!session || !guestId || session === guestId) return { success: true }

  const guestItems = await db.select().from(cartItems).where(eq(cartItems.userId, guestId))
  for (const item of guestItems) {
    const existing = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, session), eq(cartItems.licenseId, item.licenseId)))
      .limit(1)
    if (existing[0]) {
      await db.update(cartItems).set({ quantity: clampQuantity(existing[0].quantity + item.quantity) }).where(eq(cartItems.id, existing[0].id))
    } else {
      await db.update(cartItems).set({ userId: session }).where(eq(cartItems.id, item.id))
    }
  }
  await db.delete(cartItems).where(eq(cartItems.userId, guestId))
  revalidatePath("/cart")
  revalidatePath("/checkout")
  return { success: true }
}

export async function getCartItems() {
  const ownerId = await getOptionalOwnerId()
  if (!ownerId) return []

  const rows = await db
    .select({
      cartItem: cartItems,
      license: productLicenses,
      product: products,
    })
    .from(cartItems)
    .innerJoin(productLicenses, eq(cartItems.licenseId, productLicenses.id))
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, ownerId))
    .orderBy(cartItems.createdAt)

  if (rows.length === 0) return []

  const productIds = rows.map((r) => r.product.id)
  const thumbnails = await db
    .select()
    .from(productImages)
    .where(inArray(productImages.productId, productIds))
    .orderBy(asc(productImages.sortOrder))

  const thumbnailByProduct = new Map<number, string | null>()
  for (const image of thumbnails) {
    if (!thumbnailByProduct.has(image.productId)) thumbnailByProduct.set(image.productId, image.url)
  }

  return rows.map((row) => ({
    ...row,
    imageUrl: row.product.thumbnailUrl ?? thumbnailByProduct.get(row.product.id) ?? null,
  }))
}

export async function getCartCount() {
  const items = await getCartItems()
  return items.reduce((sum, i) => sum + i.cartItem.quantity, 0)
}

"use server"

import { db } from "@/lib/db"
import { cartItems, productVariants, products, brands } from "@/lib/db/schema"
import { getOptionalOwnerId, getOwnerId } from "@/lib/session"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

const MAX_QUANTITY_PER_ITEM = 20

function clampQuantity(quantity: number) {
  return Math.min(Math.max(1, Math.trunc(quantity) || 1), MAX_QUANTITY_PER_ITEM)
}

export async function addToCart(productId: number, variantId: number, quantity = 1) {
  const ownerId = await getOwnerId()
  const safeQuantity = clampQuantity(quantity)

  const existing = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.userId, ownerId), eq(cartItems.variantId, variantId)))
    .limit(1)

  if (existing[0]) {
    await db
      .update(cartItems)
      .set({ quantity: clampQuantity(existing[0].quantity + safeQuantity) })
      .where(eq(cartItems.id, existing[0].id))
  } else {
    await db.insert(cartItems).values({ userId: ownerId, productId, variantId, quantity: safeQuantity })
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

export async function getCartItems() {
  const ownerId = await getOptionalOwnerId()
  if (!ownerId) return []

  const rows = await db
    .select({
      cartItem: cartItems,
      variant: productVariants,
      product: products,
      brand: brands,
    })
    .from(cartItems)
    .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
    .innerJoin(products, eq(cartItems.productId, products.id))
    .innerJoin(brands, eq(products.brandId, brands.id))
    .where(eq(cartItems.userId, ownerId))
    .orderBy(cartItems.createdAt)

  return rows
}

export async function getCartCount() {
  const items = await getCartItems()
  return items.reduce((sum, i) => sum + i.cartItem.quantity, 0)
}

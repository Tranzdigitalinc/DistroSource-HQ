"use server"

import { db } from "@/lib/db"
import { cartItems, productVariants, products, brands } from "@/lib/db/schema"
import { getOptionalUserId, getUserId } from "@/lib/session"
import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function addToCart(productId: number, variantId: number, quantity = 1) {
  const userId = await getUserId()

  const existing = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.userId, userId), eq(cartItems.variantId, variantId)))
    .limit(1)

  if (existing[0]) {
    await db
      .update(cartItems)
      .set({ quantity: existing[0].quantity + quantity })
      .where(eq(cartItems.id, existing[0].id))
  } else {
    await db.insert(cartItems).values({ userId, productId, variantId, quantity })
  }

  revalidatePath("/cart")
  return { success: true }
}

export async function updateCartItemQuantity(cartItemId: number, quantity: number) {
  const userId = await getUserId()
  if (quantity <= 0) {
    await db.delete(cartItems).where(and(eq(cartItems.id, cartItemId), eq(cartItems.userId, userId)))
  } else {
    await db
      .update(cartItems)
      .set({ quantity })
      .where(and(eq(cartItems.id, cartItemId), eq(cartItems.userId, userId)))
  }
  revalidatePath("/cart")
  return { success: true }
}

export async function removeCartItem(cartItemId: number) {
  const userId = await getUserId()
  await db.delete(cartItems).where(and(eq(cartItems.id, cartItemId), eq(cartItems.userId, userId)))
  revalidatePath("/cart")
  return { success: true }
}

export async function clearCart() {
  const userId = await getUserId()
  await db.delete(cartItems).where(eq(cartItems.userId, userId))
  revalidatePath("/cart")
}

export async function getCartItems() {
  const userId = await getOptionalUserId()
  if (!userId) return []

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
    .where(eq(cartItems.userId, userId))
    .orderBy(cartItems.createdAt)

  return rows
}

export async function getCartCount() {
  const items = await getCartItems()
  return items.reduce((sum, i) => sum + i.cartItem.quantity, 0)
}

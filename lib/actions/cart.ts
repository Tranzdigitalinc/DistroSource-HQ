"use server"

import { db } from "@/lib/db"
import { cartItems, categories, productImages, productLicenses, products } from "@/lib/db/schema"
import { getOptionalOwnerId, getOwnerId } from "@/lib/session"
import { getGuestId } from "@/lib/guest"
import { and, asc, eq, inArray, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

const MAX_QUANTITY_PER_ITEM = 20

function clampQuantity(quantity: number) {
  return Math.min(Math.max(1, Math.trunc(quantity) || 1), MAX_QUANTITY_PER_ITEM)
}

export async function addToCart(productId: number, licenseId: number, quantity = 1) {
  const ownerId = await getOwnerId()
  const safeQuantity = clampQuantity(quantity)

  // Preview-only products (asset not attached yet) and products whose distribution
  // rights are not yet approved (pending_verification / rejected) must never become
  // purchasable, even if a client bypasses the disabled button and calls this action directly.
  const [product] = await db
    .select({ status: products.status, assetStatus: products.assetStatus, rightsStatus: products.rightsStatus })
    .from(products)
    .where(eq(products.id, productId))
    .limit(1)
  const approvedRightsStatuses = ["original", "licensed_for_distribution", "supplier_verified"]
  // `status` was missing from this check, so an unpublished draft could be
  // added to a cart. Checkout would later reject it, but only after the
  // customer had built a cart around it.
  if (!product || product.status !== "published" || product.assetStatus !== "ready" || !approvedRightsStatuses.includes(product.rightsStatus)) {
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

/**
 * Swap a cart line to a different licence tier of the *same* product. The
 * target licence is looked up server-side and must belong to the line's
 * product, so a client cannot move a line onto a cheaper licence of another
 * product. Pricing is still recomputed from the DB at checkout.
 */
export async function changeCartItemLicense(cartItemId: number, licenseId: number) {
  const ownerId = await getOwnerId()
  const [line] = await db
    .select({ id: cartItems.id, productId: cartItems.productId, quantity: cartItems.quantity, licenseId: cartItems.licenseId })
    .from(cartItems)
    .where(and(eq(cartItems.id, cartItemId), eq(cartItems.userId, ownerId)))
    .limit(1)
  if (!line) throw new Error("This item is no longer in your cart.")
  if (line.licenseId === licenseId) return { success: true }

  const [license] = await db
    .select({ id: productLicenses.id })
    .from(productLicenses)
    .where(and(eq(productLicenses.id, licenseId), eq(productLicenses.productId, line.productId)))
    .limit(1)
  if (!license) throw new Error("That licence isn't available for this product.")

  // If the target licence is already a separate line, fold this one into it.
  const [existing] = await db
    .select({ id: cartItems.id, quantity: cartItems.quantity })
    .from(cartItems)
    .where(and(eq(cartItems.userId, ownerId), eq(cartItems.licenseId, licenseId)))
    .limit(1)
  if (existing) {
    await db.update(cartItems).set({ quantity: clampQuantity(existing.quantity + line.quantity) }).where(eq(cartItems.id, existing.id))
    await db.delete(cartItems).where(eq(cartItems.id, line.id))
  } else {
    await db.update(cartItems).set({ licenseId }).where(eq(cartItems.id, line.id))
  }

  revalidatePath("/cart")
  revalidatePath("/checkout")
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
  const categoryIds = [...new Set(rows.map((r) => r.product.categoryId).filter((id): id is number => id !== null))]
  const [thumbnails, licenseOptions, categoryRows] = await Promise.all([
    db
      .select()
      .from(productImages)
      .where(inArray(productImages.productId, productIds))
      .orderBy(asc(productImages.sortOrder)),
    // Every tier for each product in the cart, so the line can offer
    // "Change licence" without a round trip to the product page.
    db
      .select({
        id: productLicenses.id,
        productId: productLicenses.productId,
        licenseType: productLicenses.licenseType,
        price: productLicenses.price,
        description: productLicenses.description,
      })
      .from(productLicenses)
      .where(inArray(productLicenses.productId, productIds))
      .orderBy(asc(productLicenses.sortOrder)),
    categoryIds.length
      ? db.select({ id: categories.id, name: categories.name }).from(categories).where(inArray(categories.id, categoryIds))
      : Promise.resolve([] as { id: number; name: string }[]),
  ])

  const thumbnailByProduct = new Map<number, string | null>()
  for (const image of thumbnails) {
    if (!thumbnailByProduct.has(image.productId)) thumbnailByProduct.set(image.productId, image.url)
  }
  const licensesByProduct = new Map<number, typeof licenseOptions>()
  for (const l of licenseOptions) licensesByProduct.set(l.productId, [...(licensesByProduct.get(l.productId) ?? []), l])
  const categoryName = new Map(categoryRows.map((c) => [c.id, c.name]))

  return rows.map((row) => ({
    ...row,
    imageUrl: row.product.thumbnailUrl ?? thumbnailByProduct.get(row.product.id) ?? null,
    categoryName: row.product.categoryId !== null ? (categoryName.get(row.product.categoryId) ?? null) : null,
    licenseOptions: licensesByProduct.get(row.product.id) ?? [],
  }))
}

export async function getCartCount() {
  // Header badge only — a single aggregate, not the full cart join.
  const ownerId = await getOptionalOwnerId()
  if (!ownerId) return 0
  const [row] = await db
    .select({ count: sql<number>`coalesce(sum(${cartItems.quantity}), 0)::int` })
    .from(cartItems)
    .where(eq(cartItems.userId, ownerId))
  return row?.count ?? 0
}

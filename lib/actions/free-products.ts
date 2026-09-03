"use server"

import { db } from "@/lib/db"
import { entitlements, orderItems, orders, productLicenses, products } from "@/lib/db/schema"
import { getSession } from "@/lib/session"
import { generateOrderNumber } from "@/lib/format"
import { and, asc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

const APPROVED_RIGHTS_STATUSES = ["original", "licensed_for_distribution", "supplier_verified"]

/**
 * Grants a free product directly to the signed-in user's library, bypassing
 * cart/checkout entirely per spec: free products should never be sent through
 * the normal paid checkout flow. Still creates a zero-value order + order
 * item so the grant is auditable and shows up in order history like any
 * other purchase.
 */
export async function claimFreeProduct(productId: number) {
  const session = await getSession()
  if (!session?.user) {
    throw new Error("Sign in to add this to your library.")
  }
  const userId = session.user.id

  const [product] = await db.select().from(products).where(eq(products.id, productId)).limit(1)
  if (
    !product ||
    !product.isFree ||
    product.assetStatus !== "ready" ||
    !APPROVED_RIGHTS_STATUSES.includes(product.rightsStatus)
  ) {
    throw new Error("This product isn't available to claim right now.")
  }

  const [license] = await db
    .select()
    .from(productLicenses)
    .where(eq(productLicenses.productId, productId))
    .orderBy(asc(productLicenses.sortOrder))
    .limit(1)
  if (!license) {
    throw new Error("This product isn't available to claim right now.")
  }

  const [existing] = await db
    .select({ id: entitlements.id })
    .from(entitlements)
    .where(and(eq(entitlements.userId, userId), eq(entitlements.productId, productId)))
    .limit(1)
  if (existing) {
    return { success: true, alreadyOwned: true as const }
  }

  await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({
        orderNumber: generateOrderNumber(),
        userId,
        status: "completed",
        subtotalUsd: "0.00",
        discountUsd: "0.00",
        totalUsd: "0.00",
        billingEmail: session.user.email,
        billingName: session.user.name,
        paymentMethod: "free",
      })
      .returning()

    const [orderItem] = await tx
      .insert(orderItems)
      .values({
        orderId: order.id,
        productId: product.id,
        licenseId: license.id,
        productName: product.name,
        licenseType: license.licenseType,
        unitPriceUsd: "0.00",
        quantity: 1,
      })
      .returning()

    await tx.insert(entitlements).values({
      userId,
      productId: product.id,
      licenseId: license.id,
      orderId: order.id,
      orderItemId: orderItem.id,
    })
  })

  revalidatePath("/account/library")
  revalidatePath("/account/orders")
  return { success: true, alreadyOwned: false as const }
}

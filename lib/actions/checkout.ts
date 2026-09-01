"use server"

import { db } from "@/lib/db"
import { cartItems, coupons, orderItems, orders, productVariants, products } from "@/lib/db/schema"
import { generateOrderNumber, generateRedemptionCode } from "@/lib/format"
import { getOptionalOwnerId, getOwnerId } from "@/lib/session"
import { and, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"

const MAX_QUANTITY_PER_ITEM = 20

interface ValidatedCoupon {
  code: string
  discountPercent: number
}

async function validateCoupon(code: string | undefined, subtotal: number): Promise<ValidatedCoupon | null> {
  if (!code) return null
  const rows = await db
    .select()
    .from(coupons)
    .where(and(eq(coupons.code, code.toUpperCase()), eq(coupons.isActive, true)))
    .limit(1)

  const coupon = rows[0]
  if (!coupon) return null
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return null
  if (coupon.maxUses !== null && coupon.usedCount >= coupon.maxUses) return null
  if (subtotal < Number.parseFloat(coupon.minOrderUsd)) return null

  return { code: coupon.code, discountPercent: coupon.discountPercent }
}

export async function applyCouponPreview(code: string, subtotal: number) {
  const coupon = await validateCoupon(code, subtotal)
  if (!coupon) return { valid: false as const, message: "This coupon is invalid or does not apply to your order." }
  return { valid: true as const, discountPercent: coupon.discountPercent }
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function checkout(input: {
  billingEmail: string
  billingName: string
  couponCode?: string
}) {
  const billingEmail = input.billingEmail.trim()
  const billingName = input.billingName.trim()

  if (!EMAIL_PATTERN.test(billingEmail)) {
    throw new Error("Enter a valid email address so we know where to deliver your codes.")
  }
  if (!billingName) {
    throw new Error("Enter the name on this order.")
  }

  const ownerId = await getOwnerId()

  const rows = await db
    .select({ cartItem: cartItems, variant: productVariants, product: products })
    .from(cartItems)
    .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, ownerId))

  if (rows.length === 0) {
    throw new Error("Your cart is empty")
  }

  // Server-side validation: recompute prices from DB, enforce quantity caps
  let subtotal = 0
  const validatedItems = rows.map((r) => {
    const quantity = Math.min(Math.max(1, Math.trunc(r.cartItem.quantity)), MAX_QUANTITY_PER_ITEM)
    const unitPrice = Number.parseFloat(r.variant.priceUsd)
    subtotal += unitPrice * quantity
    return {
      productId: r.product.id,
      variantId: r.variant.id,
      productName: r.product.name,
      denominationLabel: r.variant.denominationLabel,
      unitPriceUsd: unitPrice,
      quantity,
    }
  })

  subtotal = Math.round(subtotal * 100) / 100

  const coupon = await validateCoupon(input.couponCode, subtotal)
  const discount = coupon ? Math.round(subtotal * (coupon.discountPercent / 100) * 100) / 100 : 0
  const total = Math.round((subtotal - discount) * 100) / 100

  const orderNumber = generateOrderNumber()

  const orderResult = await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({
        orderNumber,
        userId: ownerId,
        status: "completed",
        subtotalUsd: subtotal.toFixed(2),
        discountUsd: discount.toFixed(2),
        totalUsd: total.toFixed(2),
        couponCode: coupon?.code ?? null,
        billingEmail,
        billingName,
        paymentMethod: "card",
      })
      .returning()

    await tx.insert(orderItems).values(
      validatedItems.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        variantId: item.variantId,
        productName: item.productName,
        denominationLabel: item.denominationLabel,
        unitPriceUsd: item.unitPriceUsd.toFixed(2),
        quantity: item.quantity,
        redemptionCode: generateRedemptionCode(),
        redemptionInstructions:
          "Redeem this code at checkout or in the brand's app under Redeem Gift Card / Enter Code.",
        isRevealed: false,
      })),
    )

    if (coupon) {
      await tx
        .update(coupons)
        .set({ usedCount: sql`${coupons.usedCount} + 1` })
        .where(eq(coupons.code, coupon.code))
    }

    await tx.delete(cartItems).where(eq(cartItems.userId, ownerId))

    return order
  })

  revalidatePath("/cart")
  revalidatePath("/account/orders")

  return { orderNumber: orderResult.orderNumber }
}

export async function revealOrderItemCode(orderItemId: number) {
  const ownerId = await getOptionalOwnerId()
  if (!ownerId) throw new Error("Not found")

  const rows = await db
    .select({ orderItem: orderItems, order: orders })
    .from(orderItems)
    .innerJoin(orders, eq(orderItems.orderId, orders.id))
    .where(and(eq(orderItems.id, orderItemId), eq(orders.userId, ownerId)))
    .limit(1)

  if (!rows[0]) throw new Error("Not found")

  await db.update(orderItems).set({ isRevealed: true }).where(eq(orderItems.id, orderItemId))

  return { redemptionCode: rows[0].orderItem.redemptionCode }
}

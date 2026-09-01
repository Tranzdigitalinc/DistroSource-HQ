"use server"

import { db } from "@/lib/db"
import {
  affiliateCodes,
  cartItems,
  coupons,
  operationEvents,
  orderItems,
  orders,
  productVariants,
  products,
  promotionCampaigns,
  referralCodes,
  referralRedemptions,
  user,
} from "@/lib/db/schema"
import { generateOrderNumber, generateRedemptionCode } from "@/lib/format"
import { sendOrderConfirmationEmail, sendReferralRewardEmail } from "@/lib/email"
import { getOptionalOwnerId, getOwnerId, getSession } from "@/lib/session"
import { and, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

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
  if (coupon) return { valid: true as const, discountPercent: coupon.discountPercent }

  const campaigns = await db
    .select()
    .from(promotionCampaigns)
    .where(and(eq(promotionCampaigns.code, code.toUpperCase()), eq(promotionCampaigns.isActive, true)))
    .limit(1)
  const campaign = campaigns[0]
  if (!campaign || (campaign.startsAt && new Date(campaign.startsAt) > new Date()) || (campaign.expiresAt && new Date(campaign.expiresAt) < new Date()) || (campaign.maxUses !== null && campaign.usedCount >= campaign.maxUses) || subtotal < Number.parseFloat(campaign.minOrderUsd)) {
    return { valid: false as const, message: "This coupon is invalid or does not apply to your order." }
  }
  const discountPercent = campaign.discountType === "percent" ? Number.parseFloat(campaign.discountValue) : Math.min(100, (Number.parseFloat(campaign.discountValue) / subtotal) * 100)
  return { valid: true as const, discountPercent }
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function randomCode(length: number): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("")
}

async function generateUniqueRewardCouponCode(): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = `REF-${randomCode(6)}`
    const existing = await db.select({ id: coupons.id }).from(coupons).where(eq(coupons.code, code)).limit(1)
    if (existing.length === 0) return code
  }
  throw new Error("Could not generate a reward coupon code.")
}

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
  const session = await getSession()
  const cookieStore = await cookies()

  const rows = await db
    .select({ cartItem: cartItems, variant: productVariants, product: products })
    .from(cartItems)
    .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, ownerId))

  if (rows.length === 0) {
    throw new Error("Your cart is empty")
  }

  await db.insert(operationEvents).values({
    eventType: "checkout_started",
    entityType: "cart",
    entityId: ownerId,
    status: "open",
    payload: { itemCount: rows.length, couponApplied: Boolean(input.couponCode) },
    createdBy: ownerId,
  })

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
  const campaign = !coupon && input.couponCode
    ? (await db.select().from(promotionCampaigns).where(and(eq(promotionCampaigns.code, input.couponCode.toUpperCase()), eq(promotionCampaigns.isActive, true))).limit(1))[0]
    : null
  const campaignValid = campaign && (!campaign.startsAt || new Date(campaign.startsAt) <= new Date()) && (!campaign.expiresAt || new Date(campaign.expiresAt) >= new Date()) && (campaign.maxUses === null || campaign.usedCount < campaign.maxUses) && subtotal >= Number.parseFloat(campaign.minOrderUsd)
  const promotion = coupon ?? (campaignValid && campaign ? { code: campaign.code ?? input.couponCode, discountPercent: campaign.discountType === "percent" ? Number.parseFloat(campaign.discountValue) : Math.min(100, (Number.parseFloat(campaign.discountValue) / subtotal) * 100) } : null)
  if (input.couponCode && !promotion) {
    throw new Error("This promotion is invalid, expired, or does not apply to your order.")
  }

  // Referral welcome discount: only for signed-in first-time buyers who
  // arrived via a valid referral link and did not manually enter a coupon.
  // Referral and coupon discounts never stack.
  let referral: { id: number; code: string; refereeDiscountPercent: number; rewardDiscountPercent: number; referrerUserId: string } | null = null
  if (session?.user && !promotion) {
    const refCode = cookieStore.get("rc_ref")?.value
    if (refCode) {
      const [priorOrder] = await db.select({ id: orders.id }).from(orders).where(eq(orders.userId, session.user.id)).limit(1)
      const [priorRedemption] = await db
        .select({ id: referralRedemptions.id })
        .from(referralRedemptions)
        .where(eq(referralRedemptions.refereeUserId, session.user.id))
        .limit(1)
      if (!priorOrder && !priorRedemption) {
        const [referralRow] = await db.select().from(referralCodes).where(eq(referralCodes.code, refCode)).limit(1)
        if (referralRow && referralRow.userId !== session.user.id) {
          referral = {
            id: referralRow.id,
            code: referralRow.code,
            refereeDiscountPercent: referralRow.refereeDiscountPercent,
            rewardDiscountPercent: referralRow.rewardDiscountPercent,
            referrerUserId: referralRow.userId,
          }
        }
      }
    }
  }

  // Affiliate attribution: tracking only, does not affect price.
  const affiliateCookie = cookieStore.get("rc_aff")?.value
  let affiliateCode: string | null = null
  if (affiliateCookie) {
    const [affiliateRow] = await db
      .select({ code: affiliateCodes.code })
      .from(affiliateCodes)
      .where(and(eq(affiliateCodes.code, affiliateCookie), eq(affiliateCodes.isActive, true)))
      .limit(1)
    if (affiliateRow) affiliateCode = affiliateRow.code
  }

  const effectiveDiscountPercent = promotion?.discountPercent ?? referral?.refereeDiscountPercent ?? 0
  const discount = effectiveDiscountPercent ? Math.round(subtotal * (effectiveDiscountPercent / 100) * 100) / 100 : 0
  const total = Math.round((subtotal - discount) * 100) / 100

  const orderNumber = generateOrderNumber()

  const { order: orderResult, itemsForEmail } = await db.transaction(async (tx) => {
    const [order] = await tx
      .insert(orders)
      .values({
        orderNumber,
        userId: ownerId,
        status: "completed",
        subtotalUsd: subtotal.toFixed(2),
        discountUsd: discount.toFixed(2),
        totalUsd: total.toFixed(2),
        couponCode: promotion?.code ?? null,
        referralCode: referral?.code ?? null,
        affiliateCode,
        billingEmail,
        billingName,
        paymentMethod: "card",
      })
      .returning()

    const insertedItems = await tx
      .insert(orderItems)
      .values(
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
      .returning()

    if (coupon) {
      await tx.update(coupons).set({ usedCount: sql`${coupons.usedCount} + 1` }).where(eq(coupons.code, coupon.code))
    } else if (campaignValid && campaign) {
      await tx.update(promotionCampaigns).set({ usedCount: sql`${promotionCampaigns.usedCount} + 1` }).where(eq(promotionCampaigns.id, campaign.id))
    }

    if (referral && session?.user) {
      await tx.insert(referralRedemptions).values({
        referralCodeId: referral.id,
        referrerUserId: referral.referrerUserId,
        refereeUserId: session.user.id,
        refereeOrderId: order.id,
        status: "pending",
      })
    }

    await tx.delete(cartItems).where(eq(cartItems.userId, ownerId))

    return { order, itemsForEmail: insertedItems }
  })

  // Send the confirmation email after the order is committed. A flaky email
  // provider must never roll back a completed, paid order.
  let confirmationEmailSent = false
  try {
    confirmationEmailSent = await sendOrderConfirmationEmail(
      billingEmail,
      orderResult.orderNumber,
      itemsForEmail.map((item) => ({
        productName: item.productName,
        denominationLabel: item.denominationLabel,
        quantity: item.quantity,
        redemptionCode: item.redemptionCode,
      })),
    )
  } catch (error) {
    console.error("[v0] Order confirmation email threw:", error)
  }

  if (confirmationEmailSent) {
    await db.update(orders).set({ confirmationEmailSent: true }).where(eq(orders.id, orderResult.id))
  }

  await db.insert(operationEvents).values({
    eventType: "checkout_completed",
    entityType: "order",
    entityId: String(orderResult.id),
    status: "resolved",
    payload: { itemCount: itemsForEmail.length, totalUsd: total, confirmationEmailSent },
    createdBy: ownerId,
    resolvedAt: new Date(),
  })

  if (!confirmationEmailSent) {
    await db.insert(operationEvents).values({
      eventType: "confirmation_email_failed",
      entityType: "order",
      entityId: String(orderResult.id),
      status: "open",
      payload: { orderNumber: orderResult.orderNumber, billingEmail },
      createdBy: ownerId,
    })
  }

  if (referral) {
    try {
      const rewardCode = await generateUniqueRewardCouponCode()
      await db.insert(coupons).values({
        code: rewardCode,
        description: `Referral reward for inviting ${billingEmail}`,
        discountPercent: referral.rewardDiscountPercent,
        maxUses: 1,
        isActive: true,
      })
      await db
        .update(referralRedemptions)
        .set({ status: "rewarded", rewardCouponCode: rewardCode, rewardedAt: new Date() })
        .where(eq(referralRedemptions.refereeOrderId, orderResult.id))
      await db
        .update(referralCodes)
        .set({ redemptionCount: sql`${referralCodes.redemptionCount} + 1` })
        .where(eq(referralCodes.id, referral.id))

      const [referrer] = await db.select({ email: user.email }).from(user).where(eq(user.id, referral.referrerUserId)).limit(1)
      if (referrer) {
        await sendReferralRewardEmail(referrer.email, rewardCode, referral.rewardDiscountPercent)
      }
    } catch (error) {
      console.error("[v0] Failed to issue referral reward:", error)
      await db.insert(operationEvents).values({
        eventType: "referral_reward_failed",
        entityType: "order",
        entityId: String(orderResult.id),
        status: "open",
        payload: { referralCode: referral.code, referrerUserId: referral.referrerUserId },
        createdBy: ownerId,
      })
    }
    cookieStore.delete("rc_ref")
  }

  revalidatePath("/cart")
  revalidatePath("/account/orders")
  revalidatePath("/account/referrals")

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

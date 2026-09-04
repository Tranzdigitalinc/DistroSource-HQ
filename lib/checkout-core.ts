import "server-only"

/**
 * Order pricing and persistence primitives.
 *
 * These functions can create completed orders and grant entitlements, so they
 * deliberately live OUTSIDE any `"use server"` module: an export from a Server
 * Action file is a network-reachable endpoint, and these must only ever be
 * called by trusted server code that has already verified payment.
 *
 * Callers today:
 *   - app/api/webhooks/polar/route.ts  (verified order.paid webhook)
 *   - lib/actions/checkout.ts          (pricing only, before payment)
 */

import { db } from "@/lib/db"
import {
  affiliateCodes,
  cartItems,
  coupons,
  entitlements,
  operationEvents,
  orderItems,
  orders,
  productLicenses,
  products,
  promotionCampaigns,
  referralCodes,
  referralRedemptions,
  user,
} from "@/lib/db/schema"
import { generateOrderNumber } from "@/lib/format"
import { sendOrderConfirmationEmail, sendReferralRewardEmail } from "@/lib/email"
import { getSession } from "@/lib/session"
import { and, eq, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"

export const MAX_QUANTITY_PER_ITEM = 20

export interface ValidatedCoupon {
  code: string
  discountPercent: number
}

export async function validateCoupon(code: string | undefined, subtotal: number): Promise<ValidatedCoupon | null> {
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

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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

export interface OrderPricing {
  ownerId: string
  subtotal: number
  discount: number
  total: number
  validatedItems: {
    productId: number
    licenseId: number
    productName: string
    productVersion: string
    licenseType: string
    unitPriceUsd: number
    quantity: number
  }[]
  promotion: ValidatedCoupon | null
  coupon: ValidatedCoupon | null
  campaign: typeof promotionCampaigns.$inferSelect | null
  campaignValid: boolean
  referral: { id: number; code: string; refereeDiscountPercent: number; rewardDiscountPercent: number; referrerUserId: string } | null
  affiliateCode: string | null
}

/**
 * Recomputes the cart total from server-side prices — never trusts a
 * client-supplied amount. Call this immediately before charging a payment
 * provider, and again immediately before fulfilling, so a cart change
 * mid-checkout can never result in an under- or over-charge.
 */
export async function computeOrderPricing(
  ownerId: string,
  couponCode: string | undefined,
  session: Awaited<ReturnType<typeof getSession>>,
  cookieStore: Awaited<ReturnType<typeof cookies>>,
): Promise<OrderPricing> {
  const rows = await db
    .select({ cartItem: cartItems, license: productLicenses, product: products })
    .from(cartItems)
    .innerJoin(productLicenses, eq(cartItems.licenseId, productLicenses.id))
    .innerJoin(products, eq(cartItems.productId, products.id))
    .where(eq(cartItems.userId, ownerId))

  if (rows.length === 0) {
    throw new Error("Your cart is empty")
  }

  // Compliance gate: a product may only be sold once its rights are
  // verified, its assets are attached, and it has been published. This
  // blocks checkout even if a stale cart item or client bypass slips past
  // the storefront UI.
  const SELLABLE_RIGHTS_STATUSES = new Set(["original", "licensed_for_distribution", "supplier_verified"])
  const blockedItem = rows.find(
    (r) =>
      r.product.status !== "published" ||
      r.product.assetStatus !== "ready" ||
      !SELLABLE_RIGHTS_STATUSES.has(r.product.rightsStatus),
  )
  if (blockedItem) {
    throw new Error(`"${blockedItem.product.name}" is not currently available for purchase. Please remove it from your cart.`)
  }

  // Server-side validation: recompute prices from DB, enforce quantity caps
  let subtotal = 0
  const validatedItems = rows.map((r) => {
    const quantity = Math.min(Math.max(1, Math.trunc(r.cartItem.quantity)), MAX_QUANTITY_PER_ITEM)
    const unitPrice = Number.parseFloat(r.license.price)
    subtotal += unitPrice * quantity
    return {
      productId: r.product.id,
      licenseId: r.license.id,
      productName: r.product.name,
      productVersion: r.product.currentVersion,
      licenseType: r.license.licenseType,
      unitPriceUsd: unitPrice,
      quantity,
    }
  })

  subtotal = Math.round(subtotal * 100) / 100

  const coupon = await validateCoupon(couponCode, subtotal)
  const campaign = !coupon && couponCode
    ? (await db.select().from(promotionCampaigns).where(and(eq(promotionCampaigns.code, couponCode.toUpperCase()), eq(promotionCampaigns.isActive, true))).limit(1))[0] ?? null
    : null
  const campaignValid = Boolean(campaign && (!campaign.startsAt || new Date(campaign.startsAt) <= new Date()) && (!campaign.expiresAt || new Date(campaign.expiresAt) >= new Date()) && (campaign.maxUses === null || campaign.usedCount < campaign.maxUses) && subtotal >= Number.parseFloat(campaign.minOrderUsd))
  const promotion = coupon ?? (campaignValid && campaign ? { code: campaign.code ?? couponCode!, discountPercent: campaign.discountType === "percent" ? Number.parseFloat(campaign.discountValue) : Math.min(100, (Number.parseFloat(campaign.discountValue) / subtotal) * 100) } : null)
  if (couponCode && !promotion) {
    throw new Error("This promotion is invalid, expired, or does not apply to your order.")
  }

  // Referral welcome discount: only for signed-in first-time buyers who
  // arrived via a valid referral link and did not manually enter a coupon.
  // Referral and coupon discounts never stack.
  let referral: OrderPricing["referral"] = null
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

  return { ownerId, subtotal, discount, total, validatedItems, promotion, coupon, campaign, campaignValid, referral, affiliateCode }
}

/**
 * Persists a priced cart as a completed order: writes the order + items,
 * grants an entitlement per order item (so the buyer immediately owns the
 * product in My Library), increments coupon/campaign usage, records
 * referral redemptions, clears the cart, sends the confirmation email, and
 * issues referral rewards. Shared by every payment method so each one only
 * has to price the cart and hand off the confirmed payment reference.
 */
export async function persistOrder(
  pricing: OrderPricing,
  billingEmail: string,
  billingName: string,
  session: Awaited<ReturnType<typeof getSession>>,
  paymentMethod: string,
  paypalIds?: { paypalOrderId: string; paypalCaptureId: string },
  polarIds?: { polarCheckoutId: string; polarOrderId?: string },
): Promise<{ orderNumber: string; id: number }> {
  const { ownerId, subtotal, discount, total, validatedItems, promotion, coupon, campaign, campaignValid, referral, affiliateCode } = pricing
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
        paymentMethod,
        paypalOrderId: paypalIds?.paypalOrderId ?? null,
        paypalCaptureId: paypalIds?.paypalCaptureId ?? null,
        polarCheckoutId: polarIds?.polarCheckoutId ?? null,
        polarOrderId: polarIds?.polarOrderId ?? null,
      })
      .returning()

    const insertedItems = await tx
      .insert(orderItems)
      .values(
        validatedItems.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          licenseId: item.licenseId,
          productName: item.productName,
          licenseType: item.licenseType,
          unitPriceUsd: item.unitPriceUsd.toFixed(2),
          quantity: item.quantity,
          discountUsd: "0",
          finalLineAmountUsd: (item.unitPriceUsd * item.quantity).toFixed(2),
          productVersion: item.productVersion,
          currency: "usd",
        })),
      )
      .returning()

    // Grant an entitlement per order item so the buyer immediately owns the
    // product (gates My Library + downloads). Entitlements are never
    // inferred from the client — this insert is the only place they're created.
    await tx.insert(entitlements).values(
      insertedItems.map((item) => ({
        userId: ownerId,
        productId: item.productId,
        licenseId: item.licenseId,
        orderId: order.id,
        orderItemId: item.id,
      })),
    )

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
        licenseType: item.licenseType,
        quantity: item.quantity,
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
    payload: { itemCount: itemsForEmail.length, totalUsd: total, paymentMethod, confirmationEmailSent },
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
  }

  revalidatePath("/cart")
  revalidatePath("/account/orders")
  revalidatePath("/account/library")
  revalidatePath("/account/referrals")

  return { orderNumber: orderResult.orderNumber, id: orderResult.id }
}

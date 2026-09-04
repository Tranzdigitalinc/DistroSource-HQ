"use server"

/**
 * Server Actions for checkout.
 *
 * SECURITY BOUNDARY: every export of this file is a public HTTP endpoint —
 * Next.js compiles `"use server"` exports into callable action IDs, so an
 * export here is reachable by anyone who can POST to the app, regardless of
 * what the UI renders. Only functions that authenticate the caller and
 * verify payment belong in this file.
 *
 * The order-writing primitives (`computeOrderPricing`, `persistOrder`) live
 * in `@/lib/checkout-core`, a `server-only` module that is NOT a Server
 * Action module. They can create completed orders and grant entitlements, so
 * they must never be directly invokable from the network.
 *
 * Paid fulfilment is owned by the verified Polar `order.paid` webhook
 * (`app/api/webhooks/polar/route.ts`). Nothing in this file marks a paid
 * order completed.
 */

import { db } from "@/lib/db"
import { cartItems, operationEvents, orderItems, orders, promotionCampaigns } from "@/lib/db/schema"
import { generateOrderNumber } from "@/lib/format"
import { capturePaypalOrder, createPaypalOrder, refundPaypalCapture } from "@/lib/paypal"
import { getOwnerId, getSession } from "@/lib/session"
import { getClientIpAddress } from "@/lib/request-ip"
import { getPolarClient, polarCheckoutUrl, requiredPolarProductId } from "@/lib/polar"
import { getAppUrl } from "@/lib/env"
import {
  EMAIL_PATTERN,
  computeOrderPricing,
  persistOrder,
  validateCoupon,
} from "@/lib/checkout-core"
import { and, eq } from "drizzle-orm"
import { cookies } from "next/headers"
import { RATE_LIMITS, enforceRateLimit } from "@/lib/rate-limit"

export async function applyCouponPreview(code: string, subtotal: number) {
  // Without this an attacker can enumerate every valid coupon code.
  await enforceRateLimit("coupon", RATE_LIMITS.couponValidate)

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

export async function createPolarCheckout(input: {
  billingEmail: string
  billingName: string
  couponCode?: string
}) {
  const billingEmail = input.billingEmail.trim()
  const billingName = input.billingName.trim()
  if (!EMAIL_PATTERN.test(billingEmail)) throw new Error("Enter a valid email address for your order confirmation.")
  if (!billingName) throw new Error("Enter the name on this order.")

  const ownerId = await getOwnerId()
  // Scoped to the cart owner rather than IP: each call creates a real Polar
  // checkout session and a pending order row.
  await enforceRateLimit("checkout-create", RATE_LIMITS.checkoutCreate, ownerId)

  const session = await getSession()
  const cookieStore = await cookies()
  const pricing = await computeOrderPricing(ownerId, input.couponCode, session, cookieStore)
  if (pricing.total <= 0) throw new Error("Your order total is $0 after discounts — use the free checkout instead of Polar.")

  // Resolve the public origin BEFORE writing the pending order or clearing
  // the cart. getAppUrl() throws in production when the origin is missing or
  // points at localhost; failing here costs the customer nothing, whereas
  // failing after the cart is cleared would strand them with a pending order
  // and a redirect to a machine that isn't theirs.
  const appUrl = getAppUrl()

  const orderNumber = generateOrderNumber()
  const [pendingOrder] = await db.transaction(async (tx) => {
    const [order] = await tx.insert(orders).values({
      orderNumber,
      userId: ownerId,
      status: "pending_payment",
      subtotalUsd: pricing.subtotal.toFixed(2),
      discountUsd: pricing.discount.toFixed(2),
      totalUsd: pricing.total.toFixed(2),
      currency: "usd",
      couponCode: pricing.promotion?.code ?? null,
      referralCode: pricing.referral?.code ?? null,
      affiliateCode: pricing.affiliateCode,
      billingEmail,
      billingName,
      paymentMethod: "polar",
    }).returning()

    await tx.insert(orderItems).values(pricing.validatedItems.map((item) => {
      const gross = item.unitPriceUsd * item.quantity
      const lineDiscount = pricing.subtotal > 0 ? Math.round((pricing.discount * gross / pricing.subtotal) * 100) / 100 : 0
      return {
        orderId: order.id,
        productId: item.productId,
        licenseId: item.licenseId,
        productName: item.productName,
        licenseType: item.licenseType,
        unitPriceUsd: item.unitPriceUsd.toFixed(2),
        quantity: item.quantity,
        discountUsd: lineDiscount.toFixed(2),
        finalLineAmountUsd: (gross - lineDiscount).toFixed(2),
        productVersion: item.productVersion,
        currency: "usd",
      }
    }))
    await tx.delete(cartItems).where(eq(cartItems.userId, ownerId))
    return [order]
  })

  // externalCustomerId must be the authenticated DistroSource user id, never
  // a guest cookie id. The checkout form always creates/signs in the account
  // in prepareAccountForPayment() before calling this action, so session.user
  // is expected to exist here — but we still gate on it explicitly rather
  // than trusting ownerId (which falls back to a guest id if that ever
  // changes) so a guest can never be attributed to a Polar customer record.
  const externalCustomerId = session?.user?.id

  const clientIp = await getClientIpAddress()

  const checkout = await getPolarClient().checkouts.create({
    products: [requiredPolarProductId()],
    prices: {
      [requiredPolarProductId()]: [{ amountType: "fixed", priceAmount: Math.round(pricing.total * 100), priceCurrency: "usd", taxBehavior: "exclusive" }],
    },
    customerEmail: billingEmail,
    customerName: billingName,
    ...(externalCustomerId ? { externalCustomerId } : {}),
    // Lets Polar determine tax jurisdiction and currency/payment-method
    // behavior from the buyer's real location instead of guessing from
    // billing details alone.
    customerIpAddress: clientIp,
    metadata: { distrosourceOrderId: pendingOrder.id, customerId: ownerId, cartItemCount: pricing.validatedItems.length },
    successUrl: `${appUrl}/checkout/success?checkout_id={CHECKOUT_ID}&order=${encodeURIComponent(pendingOrder.orderNumber)}`,
    returnUrl: `${appUrl}/checkout`,
    embedOrigin: appUrl,
  })

  await db.update(orders).set({ polarCheckoutId: checkout.id }).where(eq(orders.id, pendingOrder.id))
  return { url: polarCheckoutUrl(checkout), checkoutId: checkout.id }
}

const PAYPAL_MIN_USD = 0.5
const PAYMENTS_UNDER_MAINTENANCE = true

/**
 * Step 1 of PayPal checkout: prices the cart from the server, creates a
 * fixed-amount PayPal order for that total, and returns the PayPal order id
 * for the client to render into the PayPal Buttons approval flow. No
 * DistroSource order is created yet — that only happens once payment is
 * actually captured.
 */
export async function createPaypalCheckoutOrder(input: {
  billingEmail: string
  billingName: string
  couponCode?: string
}) {
  if (PAYMENTS_UNDER_MAINTENANCE) {
    throw new Error("Payments are temporarily under maintenance. Please check back soon.")
  }

  const billingEmail = input.billingEmail.trim()
  const billingName = input.billingName.trim()

  if (!EMAIL_PATTERN.test(billingEmail)) {
    throw new Error("Enter a valid email address so we know where to deliver your order.")
  }
  if (!billingName) {
    throw new Error("Enter the name on this order.")
  }

  const ownerId = await getOwnerId()
  const session = await getSession()
  const cookieStore = await cookies()

  const pricing = await computeOrderPricing(ownerId, input.couponCode, session, cookieStore)

  if (pricing.total < PAYPAL_MIN_USD) {
    throw new Error(
      pricing.total <= 0
        ? "Your order total is $0 after discounts — use the free checkout instead of PayPal."
        : `PayPal requires a minimum order of $${PAYPAL_MIN_USD.toFixed(2)}.`,
    )
  }

  await db.insert(operationEvents).values({
    eventType: "checkout_started",
    entityType: "cart",
    entityId: ownerId,
    status: "open",
    payload: { itemCount: pricing.validatedItems.length, couponApplied: Boolean(input.couponCode), paymentMethod: "paypal" },
    createdBy: ownerId,
  })

  const paypalOrder = await createPaypalOrder({
    amountUsd: pricing.total,
    referenceId: ownerId,
    requestId: `order-${ownerId}-${Date.now()}`,
  })

  return { paypalOrderId: paypalOrder.id }
}

/**
 * Step 2 of PayPal checkout: captures the approved PayPal order, then
 * re-prices the current cart from the server and confirms it still matches
 * the amount PayPal actually captured before fulfilling anything. If the
 * cart changed while the buyer was approving payment, the capture is
 * refunded immediately and no order is fulfilled.
 */
export async function capturePaypalCheckoutOrder(input: {
  paypalOrderId: string
  billingEmail: string
  billingName: string
  couponCode?: string
}) {
  if (PAYMENTS_UNDER_MAINTENANCE) {
    throw new Error("Payments are temporarily under maintenance. Please check back soon.")
  }

  const billingEmail = input.billingEmail.trim()
  const billingName = input.billingName.trim()

  if (!EMAIL_PATTERN.test(billingEmail)) {
    throw new Error("Enter a valid email address so we know where to deliver your order.")
  }
  if (!billingName) {
    throw new Error("Enter the name on this order.")
  }
  if (!input.paypalOrderId) {
    throw new Error("Missing PayPal order reference.")
  }

  // Idempotency: a retry or double-invoke of capture must never create a
  // second order or attempt a second capture for the same PayPal order.
  const [existing] = await db.select({ orderNumber: orders.orderNumber }).from(orders).where(eq(orders.paypalOrderId, input.paypalOrderId)).limit(1)
  if (existing) return { orderNumber: existing.orderNumber }

  const ownerId = await getOwnerId()
  const session = await getSession()
  const cookieStore = await cookies()

  const capture = await capturePaypalOrder(input.paypalOrderId)
  if (capture.status !== "COMPLETED") {
    throw new Error("PayPal did not confirm this payment. Please try again.")
  }

  const captureRecord = capture.purchase_units[0]?.payments?.captures?.[0]
  if (!captureRecord || captureRecord.status !== "COMPLETED") {
    throw new Error("PayPal did not confirm this payment. Please try again.")
  }
  const capturedAmount = Number.parseFloat(captureRecord.amount.value)

  // Re-check idempotency post-capture in case of a concurrent request racing
  // us between the check above and now.
  const [raceCheck] = await db.select({ orderNumber: orders.orderNumber }).from(orders).where(eq(orders.paypalOrderId, input.paypalOrderId)).limit(1)
  if (raceCheck) return { orderNumber: raceCheck.orderNumber }

  const pricing = await computeOrderPricing(ownerId, input.couponCode, session, cookieStore)

  if (Math.abs(capturedAmount - pricing.total) > 0.01) {
    // The cart changed between order creation and approval. Refund the
    // buyer immediately rather than fulfilling the wrong amount.
    try {
      await refundPaypalCapture(captureRecord.id, "Your cart changed before payment completed, so this charge was refunded automatically.")
    } catch (error) {
      console.error("[v0] Failed to auto-refund mismatched PayPal capture:", error)
    }
    await db.insert(operationEvents).values({
      eventType: "paypal_amount_mismatch",
      entityType: "cart",
      entityId: ownerId,
      status: "resolved",
      payload: { paypalOrderId: input.paypalOrderId, capturedAmount, recomputedTotal: pricing.total },
      createdBy: ownerId,
      resolvedAt: new Date(),
    })
    throw new Error("Your cart changed while completing payment, so we refunded the charge automatically. Please review your cart and try again.")
  }

  const { orderNumber, id } = await persistOrder(pricing, billingEmail, billingName, session, "paypal", {
    paypalOrderId: input.paypalOrderId,
    paypalCaptureId: captureRecord.id,
  })
  if (pricing.referral) cookieStore.delete("rc_ref")
  return { orderNumber, id }
}

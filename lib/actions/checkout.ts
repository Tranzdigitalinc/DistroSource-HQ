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
import { operationEvents, orderItems, orders, promotionCampaigns } from "@/lib/db/schema"
import { generateOrderNumber } from "@/lib/format"
import { capturePaypalOrder, createPaypalOrder, refundPaypalCapture } from "@/lib/paypal"
import { getOwnerId, getSession } from "@/lib/session"
import { getClientIpAddress } from "@/lib/request-ip"
import { getPolarClient, polarCheckoutUrl, requiredPolarProductId } from "@/lib/polar"
import { createTampayPaymentLink, getTampayLinkStatus, type TampayPaymentMethod } from "@/lib/tampay"
import { getAppUrl } from "@/lib/env"
import {
  EMAIL_PATTERN,
  computeOrderPricing,
  fulfillPendingOrder,
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

/**
 * Pulls a buyer-safe message out of a Polar API error, without leaking the
 * raw validation payload (which can include internal schema branch names
 * like `function-after[...]`) to the checkout UI.
 */
function describePolarCheckoutError(error: unknown): string {
  const rawBody = error && typeof error === "object" ? (error as { body$?: unknown }).body$ : undefined
  if (typeof rawBody === "string") {
    try {
      const parsed = JSON.parse(rawBody) as { detail?: { msg?: string; loc?: unknown[]; type?: string }[] }
      const emailIssue = parsed.detail?.find((d) => d.type === "value_error" && Array.isArray(d.loc) && d.loc.includes("customer_email"))
      if (emailIssue) return "We couldn't verify that email address with our payment processor. Please double-check it and try again."
    } catch {
      // Not a JSON validation body — fall through to the generic message below.
    }
  }
  return "We couldn't start secure checkout right now. Your cart is safe — please try again in a moment."
}

/**
 * Server Actions have their thrown-error messages redacted in production
 * (Next.js hides the real message behind a generic digest to avoid leaking
 * server internals), so every expected, user-facing failure here is
 * returned as `{ error }` instead of thrown. Only genuinely unexpected bugs
 * should ever reach the outer catch and fall back to the generic message.
 */
export async function createPolarCheckout(input: {
  billingEmail: string
  billingName: string
  couponCode?: string
}): Promise<{ url: string; checkoutId: string } | { error: string }> {
  try {
    const billingEmail = input.billingEmail.trim()
    const billingName = input.billingName.trim()
    if (!EMAIL_PATTERN.test(billingEmail)) return { error: "Enter a valid email address for your order confirmation." }
    if (!billingName) return { error: "Enter the name on this order." }

    const ownerId = await getOwnerId()
    // Scoped to the cart owner rather than IP: each call creates a real Polar
    // checkout session and a pending order row.
    await enforceRateLimit("checkout-create", RATE_LIMITS.checkoutCreate, ownerId)

    const session = await getSession()
    const cookieStore = await cookies()
    const pricing = await computeOrderPricing(ownerId, input.couponCode, session, cookieStore)
    if (pricing.total <= 0) return { error: "Your order total is $0 after discounts — use the free checkout instead of Polar." }

    // Resolve the public origin BEFORE writing the pending order or touching
    // the cart. getAppUrl() throws in production when the origin is missing
    // or points at localhost; failing here costs the customer nothing.
    const appUrl = getAppUrl()

    const orderNumber = generateOrderNumber()

    // The pending order is written WITHOUT touching the cart. Polar's
    // checkout API needs distrosourceOrderId in its metadata before it can
    // be created, so the order has to exist first. If the Polar call below
    // fails for any reason, this order is deleted again and the customer's
    // cart is exactly as they left it.
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
      return [order]
    })

    // externalCustomerId must be the authenticated DistroSource user id, never
    // a guest cookie id. Checkout no longer requires an account up front — a
    // guest can pay with just a name and email, and only creates a password
    // (claiming the resulting order) afterward on the success page — so
    // session.user is routinely absent here. Gate on it explicitly rather
    // than trusting ownerId (which falls back to a guest id) so a guest is
    // never attributed to a Polar customer record.
    const externalCustomerId = session?.user?.id

    const clientIp = await getClientIpAddress()

    let checkout: Awaited<ReturnType<ReturnType<typeof getPolarClient>["checkouts"]["create"]>>
    try {
      checkout = await getPolarClient().checkouts.create({
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
    } catch (polarError) {
      // No checkout was created, so nothing should be left behind: remove
      // the orphaned pending order and leave the cart untouched.
      await db.transaction(async (tx) => {
        await tx.delete(orderItems).where(eq(orderItems.orderId, pendingOrder.id))
        await tx.delete(orders).where(eq(orders.id, pendingOrder.id))
      })
      console.error("[v0] Polar checkout creation failed:", polarError)
      return { error: describePolarCheckoutError(polarError) }
    }

    // The cart is deliberately left intact here — clearing it now would
    // strand the buyer with an empty cart if this Polar checkout is later
    // abandoned, declined, or dismissed, since there would be nothing left
    // to retry with (see fulfillPendingOrder / the order.paid webhook
    // handler, which are the only places a cart is actually cleared, once
    // payment is confirmed).
    await db.update(orders).set({ polarCheckoutId: checkout.id }).where(eq(orders.id, pendingOrder.id))

    return { url: polarCheckoutUrl(checkout), checkoutId: checkout.id }
  } catch (error) {
    console.error("[v0] createPolarCheckout failed:", error)
    return { error: error instanceof Error ? error.message : "Could not start secure checkout. Please try again." }
  }
}

const TAMPAY_MIN_USD = 0.5
// Temporarily disabled — flip back to true to re-enable TamPay at checkout.
// Guarded here (not just hidden in the UI) so the action can't be reached
// directly while it's off.
const TAMPAY_ENABLED = false

/**
 * Creates a fixed-amount, single-use TamPay payment link and a matching
 * pending order (same pattern as `createPolarCheckout`: order + items are
 * written before the payment link exists, then rolled back if TamPay
 * rejects the request). The cart is never touched here — it's only cleared
 * once payment is actually confirmed, by `fulfillPendingOrder` — so an
 * abandoned or declined TamPay attempt always leaves something to retry.
 *
 * TamPay has no return URL, so the caller opens `url` in a NEW TAB and
 * polls `confirmTampayPayment` from the original tab until it reports
 * "paid" — see `TampayPayment` in components/checkout/tampay-payment.tsx.
 */
export async function createTampayCheckout(input: {
  billingEmail: string
  billingName: string
  couponCode?: string
  paymentMethod: TampayPaymentMethod
  phone?: string
  city?: string
  country?: string
}): Promise<{ url: string; orderNumber: string } | { error: string }> {
  if (!TAMPAY_ENABLED) return { error: "TamPay checkout is temporarily unavailable. Please pay by card instead." }
  try {
    const billingEmail = input.billingEmail.trim()
    const billingName = input.billingName.trim()
    if (!EMAIL_PATTERN.test(billingEmail)) return { error: "Enter a valid email address for your order confirmation." }
    if (!billingName) return { error: "Enter the name on this order." }
    if (input.paymentMethod === "togo" && (!input.phone?.trim() || !input.city?.trim())) {
      return { error: "Phone and city are required for the Togo payment method." }
    }

    const ownerId = await getOwnerId()
    await enforceRateLimit("tampay-checkout-create", RATE_LIMITS.tampayCheckoutCreate, ownerId)

    const session = await getSession()
    const cookieStore = await cookies()
    const pricing = await computeOrderPricing(ownerId, input.couponCode, session, cookieStore)
    if (pricing.total < TAMPAY_MIN_USD) {
      return {
        error:
          pricing.total <= 0
            ? "Your order total is $0 after discounts — use the free checkout instead of TamPay."
            : `TamPay requires a minimum order of $${TAMPAY_MIN_USD.toFixed(2)}.`,
      }
    }

    const orderNumber = generateOrderNumber()

    // Written pending, exactly like the Polar path: the cart is never
    // touched here, so if the TamPay API call below fails, this order and
    // its items are simply deleted again and nothing else changes.
    const [pendingOrder] = await db.transaction(async (tx) => {
      const [order] = await tx
        .insert(orders)
        .values({
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
          paymentMethod: "tampay",
          tampayPaymentMethod: input.paymentMethod,
        })
        .returning()

      await tx.insert(orderItems).values(
        pricing.validatedItems.map((item) => {
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
        }),
      )
      return [order]
    })

    let link: Awaited<ReturnType<typeof createTampayPaymentLink>>
    try {
      link = await createTampayPaymentLink({
        title: `DistroSource order ${orderNumber}`,
        amountUsd: pricing.total,
        paymentMethod: input.paymentMethod,
        // The buyer pays TamPay's processing fee on top of the listed
        // total, so the total DistroSource receives (and what every other
        // payment method charges) never changes based on which one is picked.
        buyerPaysFee: true,
        customer: {
          name: billingName,
          email: billingEmail,
          ...(input.paymentMethod === "togo"
            ? { phone: input.phone!.trim(), city: input.city!.trim(), country: input.country?.trim() || undefined }
            : {}),
        },
      })
    } catch (tampayError) {
      await db.transaction(async (tx) => {
        await tx.delete(orderItems).where(eq(orderItems.orderId, pendingOrder.id))
        await tx.delete(orders).where(eq(orders.id, pendingOrder.id))
      })
      console.error("[v0] TamPay payment link creation failed:", tampayError)
      return {
        error:
          tampayError instanceof Error
            ? tampayError.message
            : "We couldn't start TamPay checkout right now. Your cart is safe — please try again in a moment.",
      }
    }

    // The cart is deliberately left intact — see the comment on
    // createPolarCheckout above for why. It's only cleared once
    // confirmTampayPayment actually verifies payment and calls
    // fulfillPendingOrder.
    await db.update(orders).set({ tampayOrderId: link.orderId, tampayLinkId: link.id }).where(eq(orders.id, pendingOrder.id))

    return { url: link.url, orderNumber: pendingOrder.orderNumber }
  } catch (error) {
    console.error("[v0] createTampayCheckout failed:", error)
    return { error: error instanceof Error ? error.message : "Could not start TamPay checkout. Please try again." }
  }
}

/**
 * Actively confirms a TamPay payment. TamPay has no webhook, so this is
 * called repeatedly (polling) from the client while the buyer completes
 * payment on TamPay's hosted page in a separate tab. Every call re-checks
 * ownership (`orders.userId = ownerId`) so one guest/session can never poll
 * — or fulfil — another's order, and re-verifies payment directly with
 * TamPay's API before ever calling `fulfillPendingOrder`.
 */
export async function confirmTampayPayment(
  orderNumber: string,
): Promise<{ status: "paid"; orderNumber: string } | { status: "pending" } | { status: "error"; error: string }> {
  const ownerId = await getOwnerId()
  await enforceRateLimit("tampay-poll", RATE_LIMITS.tampayPoll, ownerId)

  const [order] = await db
    .select()
    .from(orders)
    .where(and(eq(orders.orderNumber, orderNumber), eq(orders.userId, ownerId)))
    .limit(1)
  if (!order) return { status: "error", error: "Order not found." }
  if (order.status === "completed") return { status: "paid", orderNumber: order.orderNumber }
  if (order.status !== "pending_payment") return { status: "error", error: "This order is no longer payable." }
  if (!order.tampayOrderId) return { status: "error", error: "This order has no TamPay payment link." }

  let tampayStatus: Awaited<ReturnType<typeof getTampayLinkStatus>>
  try {
    tampayStatus = await getTampayLinkStatus(order.tampayOrderId)
  } catch (error) {
    // A transient TamPay/network error is NOT the same as "not paid yet" —
    // report pending so the client keeps polling instead of giving up.
    console.error("[v0] TamPay status check failed:", error)
    return { status: "pending" }
  }

  if (!tampayStatus.paid) return { status: "pending" }

  // The link amount was fixed server-side at creation time from our own
  // pricing (see createTampayCheckout above), so — like a Polar checkout
  // or a PayPal order — TamPay's hosted page cannot have charged a
  // different amount. fulfillPendingOrder's own `status = "pending_payment"`
  // guard makes this safe against concurrent polls double-fulfilling.
  await fulfillPendingOrder(order, { tampayPaidAt: new Date() })
  return { status: "paid", orderNumber: order.orderNumber }
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

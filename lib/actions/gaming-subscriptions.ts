"use server"

/**
 * User-facing Gaming subscription actions: start a checkout, poll it, cancel.
 * The client only ever names a product slug, an interval and (for a guest)
 * an email — the price, the Fungies product and plan all come from the
 * catalogue on the server. The trusted webhook side is lib/gaming/billing.ts.
 *
 * Checkout needs no account, like one-time orders and memberships: a guest's
 * row is owned by their guest cookie id until they create an account on
 * /gaming/subscribed (or sign in), when lib/actions/claim-order.ts moves it.
 */

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { gamingSubscriptions } from "@/lib/db/schema"
import { EMAIL_PATTERN } from "@/lib/checkout-core"
import { getAppUrl, isFungiesConfigured } from "@/lib/env"
import {
  buildFungiesCheckoutUrl,
  buildFungiesElementUrl,
  cancelFungiesSubscription,
  createFungiesCheckoutElement,
  createFungiesRecurringOffer,
} from "@/lib/fungies"
import { addTebexCustomPackage, cancelTebexRecurringPayment, createTebexBasket, isTebexConfigured } from "@/lib/tebex"
import { generateGamingReference, getGamingFungiesIds } from "@/lib/gaming/billing"
import { getGamingProductBySlug } from "@/lib/gaming/queries"
import { RATE_LIMITS, enforceRateLimit } from "@/lib/rate-limit"
import { getOwnerId, getSession } from "@/lib/session"

export type GamingPaymentProvider = "fungies" | "tebex"

export interface StartGamingCheckoutResult {
  provider: GamingPaymentProvider
  reference: string
  checkoutUrl: string
  fallbackUrl: string
  billingData: { email: string; firstName?: string; lastName?: string }
}

/**
 * Creates a checkout for one Gaming plan with the chosen provider and writes a
 * pending row keyed by our reference. Fungies: a single-use recurring offer
 * paid in the overlay. Tebex: a basket with one inline subscription package,
 * paid on Tebex's hosted checkout. Activation is owned by each provider's
 * signed webhook.
 */
export async function startGamingCheckout(input: {
  slug: string
  interval: string
  /** Required when signed out; a signed-in account bills to its own email. */
  email?: string
  /** Defaults to Fungies; Tebex is offered alongside when configured. */
  provider?: GamingPaymentProvider
}): Promise<StartGamingCheckoutResult | { error: string }> {
  const provider: GamingPaymentProvider = input.provider === "tebex" ? "tebex" : "fungies"
  if (provider === "fungies" && !isFungiesConfigured()) return { error: "Checkout isn't available right now. Please try again later." }
  if (provider === "tebex" && !isTebexConfigured()) return { error: "Tebex checkout isn't available right now. Please try another payment method." }
  if (input.interval !== "month" && input.interval !== "year") return { error: "Choose monthly or annual billing." }

  const product = getGamingProductBySlug(input.slug)
  if (!product || product.availability !== "on-sale" || product.pricing.kind !== "subscription") {
    return { error: "This plan isn't open for subscriptions right now." }
  }
  const price = input.interval === "year" ? product.pricing.annual : product.pricing.monthly
  if (!price) return { error: "Annual billing isn't offered for this plan." }

  const ownerId = await getOwnerId()
  await enforceRateLimit("gaming-checkout-create", RATE_LIMITS.gamingCheckoutCreate, ownerId)

  const session = await getSession()
  const email = (session?.user?.email || input.email || "").trim()
  if (!EMAIL_PATTERN.test(email)) return { error: "Enter a valid email address." }
  const billingName = (session?.user?.name || email.split("@")[0]).trim()

  const reference = generateGamingReference()
  let pendingId: number
  try {
    // One live subscription per plan and owner.
    const [existing] = await db
      .select({ id: gamingSubscriptions.id })
      .from(gamingSubscriptions)
      .where(
        and(
          eq(gamingSubscriptions.userId, ownerId),
          eq(gamingSubscriptions.productSlug, product.slug),
          eq(gamingSubscriptions.status, "active"),
        ),
      )
      .limit(1)
    if (existing) return { error: `You already subscribe to ${product.title}.` }

    const [pending] = await db
      .insert(gamingSubscriptions)
      .values({
        reference,
        userId: ownerId,
        productSlug: product.slug,
        interval: input.interval,
        status: "pending",
        priceUsd: price.toFixed(2),
        billingName,
        billingEmail: email,
        provider,
      })
      .returning({ id: gamingSubscriptions.id })
    pendingId = pending.id
  } catch (error) {
    console.error("[v0] Could not write a pending Gaming subscription", error)
    return { error: "Subscriptions aren't available right now. Please try again later." }
  }

  const label = `DistroSource Gaming — ${product.title}, billed ${input.interval === "year" ? "yearly" : "monthly"}`
  const [firstName, ...rest] = billingName.split(/\s+/)
  const lastName = rest.join(" ") || undefined

  if (provider === "tebex") {
    try {
      const basket = await createTebexBasket({
        completeUrl: `${getAppUrl()}/gaming/subscribed?ref=${encodeURIComponent(reference)}`,
        cancelUrl: `${getAppUrl()}/gaming/product/${encodeURIComponent(product.slug)}`,
        custom: { distrosource_order_number: reference, gaming_reference: reference, kind: "gaming_subscription" },
        email,
        firstName,
        lastName,
      })
      // One inline subscription package: nothing has to exist in the Tebex
      // panel, and the price always matches the catalogue.
      await addTebexCustomPackage({
        basketIdent: basket.ident,
        name: label,
        priceUsd: price,
        quantity: 1,
        type: "subscription",
        expiryPeriod: input.interval,
        custom: { gaming_reference: reference, product_slug: product.slug },
      })
      const checkoutUrl = basket.links?.checkout ?? `https://checkout.tebex.io/checkout/${basket.ident}`
      return { provider, reference, checkoutUrl, fallbackUrl: checkoutUrl, billingData: { email, firstName, lastName } }
    } catch (error) {
      await db.delete(gamingSubscriptions).where(eq(gamingSubscriptions.id, pendingId))
      console.error("[v0] Tebex Gaming basket creation failed:", error)
      return { error: "We couldn't start the Tebex checkout. Please try Fungies or try again in a moment." }
    }
  }

  const ids = await getGamingFungiesIds(product.slug)
  if (!ids) {
    await db.delete(gamingSubscriptions).where(eq(gamingSubscriptions.id, pendingId))
    console.error("[v0] No Fungies product mapped for Gaming plan", { slug: product.slug })
    return { error: "This plan isn't available right now. Please try again later." }
  }

  try {
    const offer = await createFungiesRecurringOffer({
      productId: ids.productId,
      variantId: ids.planId,
      reference,
      amountUsd: price,
      name: label,
      interval: input.interval,
    })
    const element = await createFungiesCheckoutElement({ offerId: offer.id, name: label })
    await db.update(gamingSubscriptions).set({ fungiesOfferId: offer.id }).where(eq(gamingSubscriptions.id, pendingId))

    return {
      provider,
      reference,
      checkoutUrl: buildFungiesElementUrl(element.id),
      fallbackUrl: buildFungiesCheckoutUrl({ offerId: offer.id, email, firstName, lastName }),
      billingData: { email, firstName, lastName },
    }
  } catch (error) {
    await db.delete(gamingSubscriptions).where(eq(gamingSubscriptions.id, pendingId))
    console.error("[v0] Fungies Gaming offer creation failed:", error)
    return { error: "We couldn't start the checkout. Please try again in a moment." }
  }
}

/**
 * Polled by the overlay while the buyer pays; `active` once the webhook has
 * run. Ownership is the owner id the checkout was created under.
 */
export async function confirmGamingCheckout(
  reference: string,
): Promise<{ status: "active"; reference: string } | { status: "pending" } | { status: "error"; error: string }> {
  const ownerId = await getOwnerId()
  await enforceRateLimit("gaming-poll", RATE_LIMITS.gamingPoll, ownerId)

  const [row] = await db
    .select()
    .from(gamingSubscriptions)
    .where(and(eq(gamingSubscriptions.reference, reference), eq(gamingSubscriptions.userId, ownerId)))
    .limit(1)
  if (!row) return { status: "error", error: "We couldn't find that checkout." }
  if (row.status === "active") return { status: "active", reference }
  if (row.status === "canceled" || row.status === "expired") {
    return { status: "error", error: "This checkout didn't complete. Please try again." }
  }
  return { status: "pending" }
}

/**
 * Cancels one of the caller's Gaming subscriptions at the end of the current
 * period, so they keep what they paid for; the webhook records the lapse.
 * Needs an account: that is where subscriptions are managed.
 */
export async function cancelMyGamingSubscription(reference: string): Promise<{ success: true } | { error: string }> {
  const session = await getSession()
  if (!session?.user) return { error: "Sign in to manage your subscriptions." }
  await enforceRateLimit("gaming-manage", RATE_LIMITS.gamingManage, session.user.id)

  const [row] = await db
    .select()
    .from(gamingSubscriptions)
    .where(
      and(
        eq(gamingSubscriptions.reference, reference),
        eq(gamingSubscriptions.userId, session.user.id),
        eq(gamingSubscriptions.status, "active"),
      ),
    )
    .limit(1)
  if (!row) return { error: "That subscription isn't active." }

  if (row.provider === "tebex") {
    // Without the recurring reference the cancellation can't reach Tebex, and
    // marking it cancelled here would let billing carry on behind the buyer's back.
    if (!row.tebexRecurringReference) {
      console.error("[v0] Cancel requested for a Tebex Gaming subscription with no recurring reference", { reference })
      return { error: "We couldn't cancel this automatically. Please contact support and we'll cancel it for you." }
    }
    try {
      await cancelTebexRecurringPayment(row.tebexRecurringReference)
    } catch (error) {
      console.error("[v0] Tebex cancel failed:", error)
      return { error: "We couldn't cancel right now. Please try again shortly." }
    }
  } else {
    // Without the Fungies id the cancellation can't reach Fungies, and marking
    // it cancelled here would let billing carry on behind the buyer's back.
    if (!row.fungiesSubscriptionId) {
      console.error("[v0] Cancel requested for a Gaming subscription with no Fungies id", { reference })
      return { error: "We couldn't cancel this automatically. Please contact support and we'll cancel it for you." }
    }
    try {
      await cancelFungiesSubscription(row.fungiesSubscriptionId, true)
    } catch (error) {
      console.error("[v0] Fungies cancel failed:", error)
      return { error: "We couldn't cancel right now. Please try again shortly." }
    }
  }

  await db
    .update(gamingSubscriptions)
    .set({ cancelAtPeriodEnd: true, canceledAt: new Date(), updatedAt: new Date() })
    .where(eq(gamingSubscriptions.id, row.id))
  revalidatePath("/account/gaming")
  return { success: true }
}

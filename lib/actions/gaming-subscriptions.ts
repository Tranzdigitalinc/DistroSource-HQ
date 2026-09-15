"use server"

/**
 * User-facing Gaming subscription actions: start a checkout, poll it, cancel.
 * The client only ever names a product slug and an interval — the price, the
 * Fungies product and plan all come from the catalogue on the server. The
 * trusted webhook side is lib/gaming/billing.ts.
 */

import { and, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { gamingSubscriptions } from "@/lib/db/schema"
import { isFungiesConfigured } from "@/lib/env"
import {
  buildFungiesCheckoutUrl,
  buildFungiesElementUrl,
  cancelFungiesSubscription,
  createFungiesCheckoutElement,
  createFungiesRecurringOffer,
} from "@/lib/fungies"
import { generateGamingReference, getGamingFungiesIds } from "@/lib/gaming/billing"
import { getGamingProductBySlug } from "@/lib/gaming/queries"
import { RATE_LIMITS, enforceRateLimit } from "@/lib/rate-limit"
import { getSession } from "@/lib/session"

export interface StartGamingCheckoutResult {
  reference: string
  checkoutUrl: string
  fallbackUrl: string
  billingData: { email: string; firstName?: string; lastName?: string }
}

/**
 * Creates a Fungies recurring offer for one Gaming plan, writes a pending row
 * keyed by our reference, and returns the overlay URL. Activation is owned by
 * the webhook. Signed-in accounts only, so every subscription can be managed
 * and cancelled from /account/gaming.
 */
export async function startGamingCheckout(input: {
  slug: string
  interval: string
}): Promise<StartGamingCheckoutResult | { error: string; signIn?: true }> {
  if (!isFungiesConfigured()) return { error: "Checkout isn't available right now. Please try again later." }
  if (input.interval !== "month" && input.interval !== "year") return { error: "Choose monthly or annual billing." }

  const session = await getSession()
  const user = session?.user
  if (!user) return { error: "Sign in to subscribe.", signIn: true }

  const product = getGamingProductBySlug(input.slug)
  if (!product || product.availability !== "on-sale" || product.pricing.kind !== "subscription") {
    return { error: "This plan isn't open for subscriptions right now." }
  }
  const ids = await getGamingFungiesIds(product.slug)
  if (!ids) {
    console.error("[v0] No Fungies product mapped for Gaming plan", { slug: product.slug })
    return { error: "This plan isn't available right now. Please try again later." }
  }
  const price = input.interval === "year" ? product.pricing.annual : product.pricing.monthly
  if (!price) return { error: "Annual billing isn't offered for this plan." }

  await enforceRateLimit("gaming-checkout-create", RATE_LIMITS.gamingCheckoutCreate, user.id)

  const email = user.email?.trim()
  if (!email) return { error: "Add an email address to your account to subscribe." }
  const billingName = (user.name || email.split("@")[0]).trim()

  const reference = generateGamingReference()
  let pendingId: number
  try {
    // One live subscription per plan and account.
    const [existing] = await db
      .select({ id: gamingSubscriptions.id })
      .from(gamingSubscriptions)
      .where(
        and(
          eq(gamingSubscriptions.userId, user.id),
          eq(gamingSubscriptions.productSlug, product.slug),
          eq(gamingSubscriptions.status, "active"),
        ),
      )
      .limit(1)
    if (existing) return { error: `You already subscribe to ${product.title}. Manage it from your account.` }

    const [pending] = await db
      .insert(gamingSubscriptions)
      .values({
        reference,
        userId: user.id,
        productSlug: product.slug,
        interval: input.interval,
        status: "pending",
        priceUsd: price.toFixed(2),
        billingName,
        billingEmail: email,
      })
      .returning({ id: gamingSubscriptions.id })
    pendingId = pending.id
  } catch (error) {
    console.error("[v0] Could not write a pending Gaming subscription", error)
    return { error: "Subscriptions aren't available right now. Please try again later." }
  }

  try {
    const label = `DistroSource Gaming — ${product.title}, billed ${input.interval === "year" ? "yearly" : "monthly"}`
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

    const [firstName, ...rest] = billingName.split(/\s+/)
    const lastName = rest.join(" ") || undefined
    return {
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

/** Polled by the overlay while the buyer pays; `active` once the webhook has run. */
export async function confirmGamingCheckout(
  reference: string,
): Promise<{ status: "active"; reference: string } | { status: "pending" } | { status: "error"; error: string }> {
  const session = await getSession()
  if (!session?.user) return { status: "error", error: "Sign in to check this subscription." }
  await enforceRateLimit("gaming-poll", RATE_LIMITS.gamingPoll, session.user.id)

  const [row] = await db
    .select()
    .from(gamingSubscriptions)
    .where(and(eq(gamingSubscriptions.reference, reference), eq(gamingSubscriptions.userId, session.user.id)))
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

  await db
    .update(gamingSubscriptions)
    .set({ cancelAtPeriodEnd: true, canceledAt: new Date(), updatedAt: new Date() })
    .where(eq(gamingSubscriptions.id, row.id))
  revalidatePath("/account/gaming")
  return { success: true }
}

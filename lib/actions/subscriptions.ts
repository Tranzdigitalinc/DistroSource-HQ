"use server"

/**
 * User-facing membership actions. Everything that talks to Fungies or mutates
 * a subscription is here; the trusted, webhook-side logic lives in
 * lib/membership.ts. Amounts and plan lookups are always resolved server-side
 * from the plan row — the client only ever names a plan slug and interval.
 */

import { db } from "@/lib/db"
import {
  entitlements,
  membershipCreditLedger,
  membershipPlans,
  orderItems,
  orders,
  productLicenses,
  products,
  subscriptions,
} from "@/lib/db/schema"
import { EMAIL_PATTERN } from "@/lib/checkout-core"
import { getOptionalUserId, getOwnerId, getSession, getUserId } from "@/lib/session"
import { RATE_LIMITS, enforceRateLimit } from "@/lib/rate-limit"
import { generateOrderNumber } from "@/lib/format"
import { isFungiesConfigured } from "@/lib/env"
import {
  buildFungiesCheckoutUrl,
  buildFungiesElementUrl,
  cancelFungiesSubscription,
  createFungiesCheckoutElement,
  createFungiesRecurringOffer,
  type FungiesRecurringInterval,
} from "@/lib/fungies"
import {
  computeRemainingCredits,
  generateSubscriptionReference,
  getActiveMembership,
  getFungiesPlanProductId,
  getMembershipPlanBySlug,
  lockSubscriptionCredits,
} from "@/lib/membership"
import { and, asc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

const SELLABLE_RIGHTS_STATUSES = ["original", "licensed_for_distribution", "supplier_verified"]

function isInterval(value: string): value is FungiesRecurringInterval {
  return value === "month" || value === "year"
}

export interface StartMembershipResult {
  reference: string
  checkoutUrl: string
  fallbackUrl: string
  billingData: { email: string; firstName?: string; lastName?: string }
}

/**
 * Creates a Fungies recurring offer for the chosen plan/interval, writes a
 * pending subscription row keyed by our own reference (mirrors the one-time
 * order flow), and returns the overlay URL. Fungies stores the card and
 * bills every cycle; activation is owned by the webhook.
 */
export async function startMembershipCheckout(input: {
  planSlug: string
  interval: string
  email: string
  name?: string
}): Promise<StartMembershipResult | { error: string }> {
  if (!isFungiesConfigured()) return { error: "Memberships aren't available right now. Please try again later." }
  if (!isInterval(input.interval)) return { error: "Choose a monthly or annual plan." }

  const plan = await getMembershipPlanBySlug(input.planSlug)
  if (!plan) return { error: "That membership plan is no longer available." }

  // Each plan bills under its own Fungies subscription product. Checked before
  // anything is written, so an unmapped plan never leaves a pending row.
  const fungiesProductId = getFungiesPlanProductId(plan.slug)
  if (!fungiesProductId) {
    console.error("[v0] No Fungies product mapped for membership plan", { slug: plan.slug })
    return { error: "That membership plan isn't available right now. Please try again later." }
  }

  const ownerId = await getOwnerId()
  await enforceRateLimit("membership-checkout-create", RATE_LIMITS.membershipCheckoutCreate, ownerId)

  const session = await getSession()
  const email = (input.email || session?.user?.email || "").trim()
  if (!EMAIL_PATTERN.test(email)) return { error: "Enter a valid email address." }
  const billingName = (input.name || session?.user?.name || email.split("@")[0]).trim()

  // One active membership per account. A canceled/expired member may resubscribe.
  const existing = await getActiveMembership(ownerId)
  if (existing) return { error: "You already have an active membership. Manage it from your account." }

  const priceUsd = input.interval === "year" ? plan.annualPriceUsd : plan.monthlyPriceUsd
  const reference = generateSubscriptionReference()

  const [pending] = await db
    .insert(subscriptions)
    .values({
      reference,
      userId: ownerId,
      guestEmail: session?.user ? null : email,
      planId: plan.id,
      interval: input.interval,
      status: "pending",
      priceUsd,
      billingName,
      billingEmail: email,
    })
    .returning()

  try {
    const label = `DistroSource ${plan.name} membership — billed ${input.interval === "year" ? "yearly" : "monthly"}`
    const offer = await createFungiesRecurringOffer({
      productId: fungiesProductId,
      reference,
      amountUsd: Number.parseFloat(priceUsd),
      name: label,
      interval: input.interval,
    })
    const element = await createFungiesCheckoutElement({ offerId: offer.id, name: label })
    const [firstName, ...rest] = billingName.split(/\s+/)
    await db.update(subscriptions).set({ fungiesOfferId: offer.id }).where(eq(subscriptions.id, pending.id))

    return {
      reference,
      checkoutUrl: buildFungiesElementUrl(element.id),
      fallbackUrl: buildFungiesCheckoutUrl({ offerId: offer.id, email, firstName, lastName: rest.join(" ") || undefined }),
      billingData: { email, firstName, lastName: rest.join(" ") || undefined },
    }
  } catch (error) {
    await db.delete(subscriptions).where(eq(subscriptions.id, pending.id))
    console.error("[v0] Fungies membership offer creation failed:", error)
    return {
      error:
        error instanceof Error
          ? error.message
          : "We couldn't start the membership checkout. Please try again in a moment.",
    }
  }
}

/**
 * Polled by the overlay while the buyer pays. Returns paid once the webhook
 * has activated the subscription. Ownership is checked by matching our
 * reference to the caller's owner id (the same id it was created under).
 */
export async function confirmMembershipCheckout(
  reference: string,
): Promise<
  | { status: "active"; reference: string }
  | { status: "pending" }
  | { status: "error"; error: string }
> {
  const ownerId = await getOwnerId()
  await enforceRateLimit("membership-poll", RATE_LIMITS.membershipPoll, ownerId)

  const [row] = await db
    .select()
    .from(subscriptions)
    .where(and(eq(subscriptions.reference, reference), eq(subscriptions.userId, ownerId)))
    .limit(1)

  if (!row) return { status: "error", error: "We couldn't find that membership checkout." }
  if (row.status === "active") return { status: "active", reference }
  if (row.status === "canceled" || row.status === "expired") {
    return { status: "error", error: "This membership checkout didn't complete. Please try again." }
  }
  return { status: "pending" }
}

/**
 * Cancels the caller's active membership at the end of the current period, so
 * they keep the benefits they've paid for until it lapses. The webhook flips
 * the status to canceled/expired when the period actually ends.
 */
export async function cancelMyMembership(): Promise<{ success: true } | { error: string }> {
  const userId = await getUserId()
  await enforceRateLimit("membership-manage", RATE_LIMITS.membershipManage, userId)

  const membership = await getActiveMembership(userId)
  if (!membership) return { error: "You don't have an active membership to cancel." }

  const { subscription } = membership
  // Without the Fungies id the cancellation can't reach Fungies, and marking
  // it cancelled here would let billing carry on behind the member's back.
  if (!subscription.fungiesSubscriptionId) {
    console.error("[v0] Cancel requested for a membership with no Fungies subscription id", { reference: subscription.reference })
    return { error: "We couldn't cancel this membership automatically. Please contact support and we'll cancel it for you." }
  }
  try {
    await cancelFungiesSubscription(subscription.fungiesSubscriptionId, true)
  } catch (error) {
    console.error("[v0] Fungies cancel failed:", error)
    return { error: "We couldn't cancel your membership right now. Please try again shortly." }
  }

  await db
    .update(subscriptions)
    .set({ cancelAtPeriodEnd: true, canceledAt: new Date(), updatedAt: new Date() })
    .where(eq(subscriptions.id, subscription.id))

  revalidatePath("/account/membership")
  return { success: true }
}

/**
 * Redeems one monthly download credit for a product, granting it to the
 * member's library exactly like a free claim (a $0 order + entitlement so it
 * shows in Orders/Library). Enforced entirely server-side: active membership,
 * remaining credits, plan value cap, and no double-claim.
 */
export async function redeemMembershipCredit(input: {
  productId: number
  licenseId?: number
}): Promise<{ success: true; orderNumber: string } | { error: string }> {
  const userId = await getUserId()
  await enforceRateLimit("membership-credit-redeem", RATE_LIMITS.membershipCreditRedeem, userId)

  const membership = await getActiveMembership(userId)
  if (!membership) return { error: "You need an active membership to use download credits." }
  const { subscription, plan } = membership

  const remaining = await computeRemainingCredits(subscription, plan)
  if (remaining !== null && remaining < 1) {
    return { error: "You've used all of this cycle's download credits. They reset next billing period." }
  }

  const [product] = await db.select().from(products).where(eq(products.id, input.productId)).limit(1)
  if (
    !product ||
    product.status !== "published" ||
    product.assetStatus !== "ready" ||
    product.isBundle ||
    !SELLABLE_RIGHTS_STATUSES.includes(product.rightsStatus)
  ) {
    return { error: "This product can't be claimed with a credit." }
  }

  // Pick the requested licence, else the cheapest tier.
  const licenseRows = await db
    .select()
    .from(productLicenses)
    .where(eq(productLicenses.productId, product.id))
    .orderBy(asc(productLicenses.price), asc(productLicenses.sortOrder))
  const license = input.licenseId ? licenseRows.find((l) => l.id === input.licenseId) : licenseRows[0]
  if (!license) return { error: "This product can't be claimed with a credit." }

  // Enforce the plan's per-credit value cap (null = no cap, i.e. Elite).
  if (plan.creditValueCapUsd !== null) {
    const cap = Number.parseFloat(plan.creditValueCapUsd)
    if (Number.parseFloat(license.price) > cap) {
      return { error: `This product is above your plan's per-credit value (${plan.name} covers up to $${cap.toFixed(0)}).` }
    }
  }

  const [owned] = await db
    .select({ id: entitlements.id })
    .from(entitlements)
    .where(and(eq(entitlements.userId, userId), eq(entitlements.productId, product.id), eq(entitlements.isRevoked, false)))
    .limit(1)
  if (owned) return { error: "You already own this product." }

  const session = await getSession()
  const orderNumber = generateOrderNumber()

  const blocked = await db.transaction(async (tx): Promise<string | null> => {
    // Serialise claims for this membership, then re-check under the lock: two
    // simultaneous claims must not both spend the last credit, or both grant
    // the same product. The checks above only give a fast, friendly answer.
    await lockSubscriptionCredits(tx, subscription.id)
    const [alreadyOwned] = await tx
      .select({ id: entitlements.id })
      .from(entitlements)
      .where(and(eq(entitlements.userId, userId), eq(entitlements.productId, product.id), eq(entitlements.isRevoked, false)))
      .limit(1)
    if (alreadyOwned) return "You already own this product."
    if (plan.monthlyCredits !== null) {
      const left = await computeRemainingCredits(subscription, plan)
      if (left !== null && left < 1) return "You've used all of this cycle's download credits. They reset next billing period."
    }

    const [order] = await tx
      .insert(orders)
      .values({
        orderNumber,
        userId,
        status: "completed",
        subtotalUsd: "0.00",
        discountUsd: "0.00",
        totalUsd: "0.00",
        billingEmail: session?.user?.email ?? subscription.billingEmail,
        billingName: session?.user?.name ?? subscription.billingName ?? "Member",
        paymentMethod: "membership_credit",
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

    const [entitlement] = await tx
      .insert(entitlements)
      .values({ userId, productId: product.id, licenseId: license.id, orderId: order.id, orderItemId: orderItem.id })
      .returning()

    // Only fixed-credit plans spend a credit; unlimited (Elite) records the
    // claim for history but never decrements a balance.
    if (plan.monthlyCredits !== null) {
      await tx.insert(membershipCreditLedger).values({
        subscriptionId: subscription.id,
        delta: -1,
        reason: "redemption",
        productId: product.id,
        orderId: order.id,
        entitlementId: entitlement.id,
      })
    }
    return null
  })
  if (blocked) return { error: blocked }

  revalidatePath("/account/library")
  revalidatePath("/account/orders")
  revalidatePath("/account/membership")
  return { success: true, orderNumber }
}

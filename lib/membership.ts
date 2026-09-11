import "server-only"

/**
 * Membership core — shared, trusted logic behind the Fungies-billed
 * DistroSource membership. Like lib/checkout-core.ts this lives OUTSIDE any
 * `"use server"` module: it can activate subscriptions and grant credits, so
 * it must only ever be reached by trusted server code (the verified Fungies
 * webhook, or a Server Action that has already authenticated the caller).
 *
 * Recurring billing itself is owned entirely by Fungies (card stored by
 * Stripe, auto-charged each cycle). We only mirror state, gate benefits, and
 * hand out download credits.
 */

import { randomBytes } from "node:crypto"
import { db } from "@/lib/db"
import { entitlements, membershipCreditLedger, membershipPlans, operationEvents, subscriptions } from "@/lib/db/schema"
import {
  fungiesTimestampToDate,
  getFungiesSubscription,
  orderNumberFromEvent,
  paidAtFromEvent,
  subscriptionFromEvent,
  subscriptionIdFromEvent,
  type FungiesEvent,
  type FungiesSubscriptionStatus,
} from "@/lib/fungies"
import { and, eq, gte, sql } from "drizzle-orm"

export type MembershipPlan = typeof membershipPlans.$inferSelect
export type Subscription = typeof subscriptions.$inferSelect

/** Prefix on every subscription reference, so a webhook can tell a membership
 * offer apart from a one-time order offer at a glance. */
export const MEMBERSHIP_REFERENCE_PREFIX = "MEMB-"

export function generateSubscriptionReference(): string {
  return `${MEMBERSHIP_REFERENCE_PREFIX}${randomBytes(12).toString("hex").toUpperCase()}`
}

export function isMembershipReference(value: string | null | undefined): boolean {
  return typeof value === "string" && value.startsWith(MEMBERSHIP_REFERENCE_PREFIX)
}

/**
 * Where memberships bill in Fungies. All three tiers are plans (Fungies
 * variants) of one subscription product, "DistroSource Subscription".
 *
 * Every subscriber still gets their own single-use recurring offer, so the
 * webhook can map a payment back to exactly one subscription row through the
 * offer's externalId. That offer is created under this product and attached
 * to the tier's plan, rather than under the one-time DigitalDownload product
 * used for regular orders, so each tier reports under its own plan in the
 * Fungies dashboard. Monthly and yearly are both offers on the same plan.
 *
 * These are dashboard ids, not secrets.
 */
export const FUNGIES_MEMBERSHIP_PRODUCT_ID = "12b8129b-fccd-4d77-937c-26e737cbb997"

export const FUNGIES_PLAN_VARIANT_IDS: Readonly<Record<string, string>> = {
  starter: "a45f7ea0-75a6-4272-bbe7-f82eca61a439",
  pro: "6da77523-37a2-48fa-bce1-384e50bde9f9",
  elite: "4feb0598-b075-4bca-a678-eec91579ac9a",
}

/** The Fungies product and plan a tier bills under, or null when unmapped. */
export function getFungiesPlanBilling(slug: string): { productId: string; variantId: string } | null {
  if (!Object.prototype.hasOwnProperty.call(FUNGIES_PLAN_VARIANT_IDS, slug)) return null
  return { productId: FUNGIES_MEMBERSHIP_PRODUCT_ID, variantId: FUNGIES_PLAN_VARIANT_IDS[slug] }
}

/** Our local status a Fungies status maps to. `active` is the only one that
 * grants benefits; `paused` keeps access per Fungies' own semantics. */
export function mapFungiesStatus(status: FungiesSubscriptionStatus): Subscription["status"] {
  switch (status) {
    case "active":
    case "trialing":
    case "paused":
      return "active"
    case "past_due":
    case "unpaid":
      return "past_due"
    case "canceled":
      return "canceled"
    case "incomplete_expired":
      return "expired"
    case "incomplete":
    default:
      return "pending"
  }
}

/** All active plans, cheapest first — for the pricing page (RSC-safe read). */
export async function listActiveMembershipPlans(): Promise<MembershipPlan[]> {
  return db
    .select()
    .from(membershipPlans)
    .where(eq(membershipPlans.isActive, true))
    .orderBy(membershipPlans.sortOrder)
}

export async function getMembershipPlanBySlug(slug: string): Promise<MembershipPlan | null> {
  const [plan] = await db
    .select()
    .from(membershipPlans)
    .where(and(eq(membershipPlans.slug, slug), eq(membershipPlans.isActive, true)))
    .limit(1)
  return plan ?? null
}

export interface MembershipView {
  subscription: Subscription
  plan: MembershipPlan
  remainingCredits: number | null
  isActive: boolean
}

/**
 * The membership to show on the account page: the active one if present,
 * otherwise the most recent (so a canceled/expired member still sees their
 * history and a resubscribe path). RSC-safe.
 */
export async function getMembershipView(userId: string | null | undefined): Promise<MembershipView | null> {
  if (!userId) return null
  const active = await getActiveMembership(userId)
  if (active) {
    return {
      subscription: active.subscription,
      plan: active.plan,
      remainingCredits: await computeRemainingCredits(active.subscription, active.plan),
      isActive: true,
    }
  }
  const [row] = await db
    .select({ subscription: subscriptions, plan: membershipPlans })
    .from(subscriptions)
    .innerJoin(membershipPlans, eq(subscriptions.planId, membershipPlans.id))
    .where(eq(subscriptions.userId, userId))
    .orderBy(sql`${subscriptions.createdAt} desc`)
    .limit(1)
  if (!row) return null
  return { subscription: row.subscription, plan: row.plan, remainingCredits: 0, isActive: false }
}

const SELLABLE_RIGHTS_STATUSES = new Set(["original", "licensed_for_distribution", "supplier_verified"])

/**
 * Whether the member can claim this specific product with a download credit,
 * for the product-page button. Returns null when there's no claim to offer
 * (not a member, product not eligible, or already owned) so the UI shows
 * nothing; otherwise reports the remaining balance and whether a credit is
 * spendable right now. The redeem action re-validates all of this server-side.
 */
export async function getProductCreditClaim(
  userId: string | null | undefined,
  product: { id: number; status: string; assetStatus: string; isBundle: boolean; isFree: boolean; rightsStatus: string },
  cheapestLicensePriceUsd: number | null,
): Promise<{ canClaim: boolean; remaining: number | null } | null> {
  const membership = await getActiveMembership(userId)
  if (!membership || !userId) return null
  const { subscription, plan } = membership

  const eligibleProduct =
    product.status === "published" &&
    product.assetStatus === "ready" &&
    !product.isBundle &&
    !product.isFree &&
    SELLABLE_RIGHTS_STATUSES.has(product.rightsStatus)
  if (!eligibleProduct) return null

  // Respect the plan's per-credit value cap (null = unlimited value, Elite).
  if (plan.creditValueCapUsd !== null && cheapestLicensePriceUsd !== null) {
    if (cheapestLicensePriceUsd > Number.parseFloat(plan.creditValueCapUsd)) return null
  }

  const [owned] = await db
    .select({ id: entitlements.id })
    .from(entitlements)
    .where(and(eq(entitlements.userId, userId), eq(entitlements.productId, product.id), eq(entitlements.isRevoked, false)))
    .limit(1)
  if (owned) return null

  const remaining = await computeRemainingCredits(subscription, plan)
  return { canClaim: remaining === null || remaining > 0, remaining }
}

function addInterval(from: Date, interval: string): Date {
  const d = new Date(from)
  if (interval === "year") d.setUTCFullYear(d.getUTCFullYear() + 1)
  else d.setUTCMonth(d.getUTCMonth() + 1)
  return d
}

/**
 * The caller's active membership (subscription + plan), or null. A membership
 * counts as active while its status is `active`, even if it is set to cancel
 * at period end — the member keeps benefits until the period actually lapses
 * (the webhook flips status to canceled/expired then).
 */
export async function getActiveMembership(
  userId: string | null | undefined,
): Promise<{ subscription: Subscription; plan: MembershipPlan } | null> {
  if (!userId) return null
  const [row] = await db
    .select({ subscription: subscriptions, plan: membershipPlans })
    .from(subscriptions)
    .innerJoin(membershipPlans, eq(subscriptions.planId, membershipPlans.id))
    .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active")))
    .limit(1)
  return row ?? null
}

/** Store-wide discount percent for a member, or 0. Used by checkout pricing. */
export async function getMembershipDiscountPercent(userId: string | null | undefined): Promise<number> {
  const membership = await getActiveMembership(userId)
  return membership?.plan.discountPercent ?? 0
}

/**
 * Credits left in the current billing cycle. null = unlimited (Elite). A plan
 * with a fixed monthly grant returns grants minus redemptions since the
 * period started; anything before an active period returns 0.
 */
export async function computeRemainingCredits(
  subscription: Subscription,
  plan: MembershipPlan,
): Promise<number | null> {
  if (plan.monthlyCredits === null) return null // unlimited
  if (subscription.status !== "active" || !subscription.currentPeriodStart) return 0
  const [row] = await db
    .select({ total: sql<number>`coalesce(sum(${membershipCreditLedger.delta}), 0)` })
    .from(membershipCreditLedger)
    .where(
      and(
        eq(membershipCreditLedger.subscriptionId, subscription.id),
        gte(membershipCreditLedger.createdAt, subscription.currentPeriodStart),
      ),
    )
  return Math.max(0, Number(row?.total ?? 0))
}

/**
 * Grants this cycle's credits into the ledger, once. Idempotent by
 * (subscription, periodStart): a retried or duplicated webhook for the same
 * period is a no-op. Unlimited plans need no grant row.
 */
async function grantCycleCredits(subscription: Subscription, plan: MembershipPlan, periodStart: Date): Promise<void> {
  if (plan.monthlyCredits === null || plan.monthlyCredits <= 0) return
  const credits = plan.monthlyCredits
  // Fungies sends payment_success AND subscription_interval for every renewal
  // and may deliver either more than once, so two deliveries can race here.
  await db.transaction(async (tx) => {
    await lockSubscriptionCredits(tx, subscription.id)
    const [existing] = await tx
      .select({ id: membershipCreditLedger.id })
      .from(membershipCreditLedger)
      .where(
        and(
          eq(membershipCreditLedger.subscriptionId, subscription.id),
          eq(membershipCreditLedger.reason, "cycle_grant"),
          eq(membershipCreditLedger.periodStart, periodStart),
        ),
      )
      .limit(1)
    if (existing) return
    await tx.insert(membershipCreditLedger).values({
      subscriptionId: subscription.id,
      delta: credits,
      reason: "cycle_grant",
      periodStart,
    })
  })
}

/** Advisory-lock namespace for per-subscription credit-ledger writes. */
const CREDIT_LEDGER_LOCK = 72431

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0]

/**
 * Serialises every credit-ledger write for one subscription (cycle grants and
 * redemptions) until the surrounding transaction ends. The ledger has no
 * unique index to lean on, so each check-then-insert must run under this.
 */
export async function lockSubscriptionCredits(tx: Tx, subscriptionId: number): Promise<void> {
  await tx.execute(sql`SELECT pg_advisory_xact_lock(${CREDIT_LEDGER_LOCK}::int, ${subscriptionId}::int)`)
}

async function findSubscriptionRow(reference: string | null, fungiesSubscriptionId: string | null) {
  if (reference && isMembershipReference(reference)) {
    const [byRef] = await db.select().from(subscriptions).where(eq(subscriptions.reference, reference)).limit(1)
    if (byRef) return byRef
  }
  if (fungiesSubscriptionId) {
    const [bySub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.fungiesSubscriptionId, fungiesSubscriptionId))
      .limit(1)
    if (bySub) return bySub
  }
  return null
}

/**
 * Handles a paid subscription signal (`payment_success` or
 * `subscription_interval`). Activates the subscription and grants the cycle's
 * credits. Setting `active` on a paid signal is always an upgrade, so this is
 * safe against out-of-order delivery; credit grants are period-idempotent.
 */
export async function fulfillSubscriptionPayment(event: FungiesEvent): Promise<{ handled: boolean }> {
  const reference = orderNumberFromEvent(event)
  const subId = subscriptionIdFromEvent(event)
  if (!subId && !isMembershipReference(reference)) return { handled: false }

  const row = await findSubscriptionRow(reference, subId)
  if (!row) {
    console.error("[v0] Fungies subscription payment for unknown subscription", { subId, reference, eventId: event.id })
    return { handled: false }
  }
  if (!subId) {
    // Paid and ours, but without the subscription id we could never renew,
    // reconcile or cancel it. Fail loudly (the route answers 500 and Fungies
    // retries) rather than activate something we can't manage.
    throw new Error(`Fungies membership payment for ${row.reference} carried no subscription id`)
  }

  const [plan] = await db.select().from(membershipPlans).where(eq(membershipPlans.id, row.planId)).limit(1)
  if (!plan) return { handled: false }

  // The billing period comes from Fungies' own subscription record. Webhook
  // payloads may omit the interval dates (the documented subscription_interval
  // example carries only id and status), and the period start is the
  // idempotency key for this cycle's credit grant, so it must be identical for
  // every delivery of the same charge. A failed read throws: the route answers
  // 500 and Fungies retries, rather than granting under an unstable key.
  const sub = subscriptionFromEvent(event)
  const fresh = await getFungiesSubscription(subId)
  const periodStart =
    fungiesTimestampToDate(fresh.currentIntervalStart) ??
    fungiesTimestampToDate(sub?.currentIntervalStart) ??
    fungiesTimestampToDate(paidAtFromEvent(event))
  if (!periodStart) throw new Error(`No billing period available for Fungies subscription ${subId}`)
  const periodEnd =
    fungiesTimestampToDate(fresh.currentIntervalEnd) ??
    fungiesTimestampToDate(sub?.currentIntervalEnd) ??
    addInterval(periodStart, row.interval)
  const isRenewal = row.status === "active" && row.fungiesSubscriptionId === subId

  await db
    .update(subscriptions)
    .set({
      status: "active",
      fungiesSubscriptionId: subId,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: fresh.cancelAtIntervalEnd ?? sub?.cancelAtIntervalEnd ?? row.cancelAtPeriodEnd,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, row.id))

  await grantCycleCredits({ ...row, currentPeriodStart: periodStart }, plan, periodStart)

  await db.insert(operationEvents).values({
    eventType: isRenewal ? "subscription_renewed" : "subscription_activated",
    entityType: "subscription",
    entityId: row.reference,
    status: "resolved",
    payload: { planSlug: plan.slug, interval: row.interval, fungiesSubscriptionId: subId, eventId: event.id },
    createdBy: row.userId,
    resolvedAt: new Date(),
  })

  return { handled: true }
}

/**
 * Reconciles a status-change event (`subscription_updated` /
 * `subscription_cancelled`). Because events can arrive out of order, the
 * current status is always re-read from Fungies rather than trusted from the
 * event payload; a failed read never downgrades an existing row.
 */
export async function reconcileSubscription(event: FungiesEvent): Promise<{ handled: boolean }> {
  const sub = subscriptionFromEvent(event)
  if (!sub?.id) return { handled: false }

  const row = await findSubscriptionRow(orderNumberFromEvent(event), sub.id)
  if (!row) return { handled: false }

  let fresh
  try {
    fresh = await getFungiesSubscription(sub.id)
  } catch (error) {
    console.error("[v0] Could not reconcile Fungies subscription; leaving row unchanged", { subId: sub.id, error })
    return { handled: false }
  }

  const status = mapFungiesStatus(fresh.status)
  const periodStart = fungiesTimestampToDate(fresh.currentIntervalStart) ?? row.currentPeriodStart
  const periodEnd = fungiesTimestampToDate(fresh.currentIntervalEnd) ?? row.currentPeriodEnd

  await db
    .update(subscriptions)
    .set({
      status,
      cancelAtPeriodEnd: fresh.cancelAtIntervalEnd ?? row.cancelAtPeriodEnd,
      canceledAt: fungiesTimestampToDate(fresh.canceledAt) ?? row.canceledAt,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      fungiesSubscriptionId: sub.id,
      updatedAt: new Date(),
    })
    .where(eq(subscriptions.id, row.id))

  await db.insert(operationEvents).values({
    eventType: status === "active" ? "subscription_updated" : `subscription_${status}`,
    entityType: "subscription",
    entityId: row.reference,
    status: "resolved",
    payload: { fungiesStatus: fresh.status, mappedStatus: status, cancelAtPeriodEnd: fresh.cancelAtIntervalEnd, eventId: event.id },
    createdBy: row.userId,
    resolvedAt: new Date(),
  })

  return { handled: true }
}

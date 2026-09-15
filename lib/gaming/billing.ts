import "server-only"

/**
 * Gaming subscription billing — the trusted, webhook-side half. It mirrors
 * the membership flow in lib/membership.ts: every signup gets its own
 * single-use recurring Fungies offer (externalId = our GAME- reference) under
 * the plan's Fungies Subscription product, and only the verified webhook
 * activates it. User-facing actions live in lib/actions/gaming-subscriptions.ts.
 *
 * Gaming plans have their own table so one is never read as a store
 * membership, which carries discounts and download credits.
 */

import { randomBytes } from "node:crypto"
import { and, desc, eq, ne } from "drizzle-orm"
import { db } from "@/lib/db"
import { gamingFungiesProducts, gamingSubscriptions, operationEvents } from "@/lib/db/schema"
import {
  fungiesTimestampToDate,
  getFungiesSubscription,
  orderNumberFromEvent,
  paidAtFromEvent,
  subscriptionFromEvent,
  subscriptionIdFromEvent,
  type FungiesEvent,
} from "@/lib/fungies"
import { mapFungiesStatus } from "@/lib/membership"

export type GamingSubscription = typeof gamingSubscriptions.$inferSelect

/** Prefix on every Gaming subscription reference, so a webhook can tell it
 * apart from a membership (MEMB-) or a one-time order at a glance. */
export const GAMING_REFERENCE_PREFIX = "GAME-"

export function generateGamingReference(): string {
  return `${GAMING_REFERENCE_PREFIX}${randomBytes(12).toString("hex").toUpperCase()}`
}

export function isGamingReference(value: string | null | undefined): boolean {
  return typeof value === "string" && value.startsWith(GAMING_REFERENCE_PREFIX)
}

/**
 * The Fungies product and plan a Gaming product bills under, or null until
 * the admin sync has created both (or if the table isn't there yet).
 */
export async function getGamingFungiesIds(slug: string): Promise<{ productId: string; planId: string } | null> {
  try {
    const [row] = await db.select().from(gamingFungiesProducts).where(eq(gamingFungiesProducts.slug, slug)).limit(1)
    return row?.fungiesPlanId ? { productId: row.fungiesProductId, planId: row.fungiesPlanId } : null
  } catch (error) {
    console.error("[v0] Could not read gaming_fungies_products", error)
    return null
  }
}

function addInterval(from: Date, interval: string): Date {
  const d = new Date(from)
  if (interval === "year") d.setUTCFullYear(d.getUTCFullYear() + 1)
  else d.setUTCMonth(d.getUTCMonth() + 1)
  return d
}

async function findRow(reference: string | null, fungiesSubscriptionId: string | null): Promise<GamingSubscription | null> {
  if (reference && isGamingReference(reference)) {
    const [row] = await db.select().from(gamingSubscriptions).where(eq(gamingSubscriptions.reference, reference)).limit(1)
    if (row) return row
  }
  if (fungiesSubscriptionId) {
    const [row] = await db
      .select()
      .from(gamingSubscriptions)
      .where(eq(gamingSubscriptions.fungiesSubscriptionId, fungiesSubscriptionId))
      .limit(1)
    if (row) return row
  }
  return null
}

/**
 * Whether a webhook event belongs to a Gaming subscription: our GAME- reference
 * on the offer, or a Fungies subscription id we already hold. Answers false if
 * the lookup fails (for example before the table exists), so memberships and
 * one-time orders are never held up by it.
 */
export async function isGamingSubscriptionEvent(event: FungiesEvent): Promise<boolean> {
  if (isGamingReference(orderNumberFromEvent(event))) return true
  const subId = subscriptionIdFromEvent(event)
  if (!subId) return false
  try {
    const [row] = await db
      .select({ id: gamingSubscriptions.id })
      .from(gamingSubscriptions)
      .where(eq(gamingSubscriptions.fungiesSubscriptionId, subId))
      .limit(1)
    return Boolean(row)
  } catch (error) {
    console.error("[v0] gaming_subscriptions lookup failed; treating the event as not Gaming", error)
    return false
  }
}

/**
 * Handles a paid signal (`payment_success` or `subscription_interval`):
 * activates the subscription and records the billing period. Setting `active`
 * on a paid signal is always an upgrade, so out-of-order delivery is safe.
 */
export async function fulfillGamingSubscriptionPayment(event: FungiesEvent): Promise<{ handled: boolean }> {
  const reference = orderNumberFromEvent(event)
  const subId = subscriptionIdFromEvent(event)
  const row = await findRow(reference, subId)
  if (!row) {
    console.error("[v0] Fungies payment for an unknown Gaming subscription", { subId, reference, eventId: event.id })
    return { handled: false }
  }
  if (!subId) {
    // Paid and ours, but without the subscription id it could never be
    // renewed, reconciled or cancelled. Answer 500 so Fungies retries.
    throw new Error(`Fungies Gaming payment for ${row.reference} carried no subscription id`)
  }

  // The period comes from Fungies' own record: webhook payloads may omit it.
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
    .update(gamingSubscriptions)
    .set({
      status: "active",
      fungiesSubscriptionId: subId,
      currentPeriodStart: periodStart,
      currentPeriodEnd: periodEnd,
      cancelAtPeriodEnd: fresh.cancelAtIntervalEnd ?? sub?.cancelAtIntervalEnd ?? row.cancelAtPeriodEnd,
      updatedAt: new Date(),
    })
    .where(eq(gamingSubscriptions.id, row.id))

  await db.insert(operationEvents).values({
    eventType: isRenewal ? "gaming_subscription_renewed" : "gaming_subscription_activated",
    entityType: "gaming_subscription",
    entityId: row.reference,
    status: "resolved",
    payload: { productSlug: row.productSlug, interval: row.interval, fungiesSubscriptionId: subId, eventId: event.id },
    createdBy: row.userId,
    resolvedAt: new Date(),
  })

  return { handled: true }
}

/**
 * Reconciles `subscription_updated` / `subscription_cancelled`. The status is
 * re-read from Fungies because events can arrive out of order; a failed read
 * never downgrades a row.
 */
export async function reconcileGamingSubscription(event: FungiesEvent): Promise<{ handled: boolean }> {
  const sub = subscriptionFromEvent(event)
  if (!sub?.id) return { handled: false }
  const row = await findRow(orderNumberFromEvent(event), sub.id)
  if (!row) return { handled: false }

  let fresh
  try {
    fresh = await getFungiesSubscription(sub.id)
  } catch (error) {
    console.error("[v0] Could not reconcile Gaming subscription; leaving row unchanged", { subId: sub.id, error })
    return { handled: false }
  }

  const status = mapFungiesStatus(fresh.status)
  await db
    .update(gamingSubscriptions)
    .set({
      status,
      cancelAtPeriodEnd: fresh.cancelAtIntervalEnd ?? row.cancelAtPeriodEnd,
      canceledAt: fungiesTimestampToDate(fresh.canceledAt) ?? row.canceledAt,
      currentPeriodStart: fungiesTimestampToDate(fresh.currentIntervalStart) ?? row.currentPeriodStart,
      currentPeriodEnd: fungiesTimestampToDate(fresh.currentIntervalEnd) ?? row.currentPeriodEnd,
      fungiesSubscriptionId: sub.id,
      updatedAt: new Date(),
    })
    .where(eq(gamingSubscriptions.id, row.id))

  await db.insert(operationEvents).values({
    eventType: status === "active" ? "gaming_subscription_updated" : `gaming_subscription_${status}`,
    entityType: "gaming_subscription",
    entityId: row.reference,
    status: "resolved",
    payload: { fungiesStatus: fresh.status, mappedStatus: status, cancelAtPeriodEnd: fresh.cancelAtIntervalEnd, eventId: event.id },
    createdBy: row.userId,
    resolvedAt: new Date(),
  })

  return { handled: true }
}

/**
 * A user's Gaming subscriptions for the account page, newest first, without
 * abandoned checkouts. Empty (never an error) if the table isn't there yet.
 */
export async function listGamingSubscriptions(userId: string): Promise<GamingSubscription[]> {
  try {
    return await db
      .select()
      .from(gamingSubscriptions)
      .where(and(eq(gamingSubscriptions.userId, userId), ne(gamingSubscriptions.status, "pending")))
      .orderBy(desc(gamingSubscriptions.createdAt))
  } catch (error) {
    console.error("[v0] Could not read gaming_subscriptions", error)
    return []
  }
}

/** One subscription by reference, only if `ownerId` (an account or guest id) owns it. */
export async function findGamingSubscription(reference: string, ownerId: string): Promise<GamingSubscription | null> {
  try {
    const [row] = await db
      .select()
      .from(gamingSubscriptions)
      .where(and(eq(gamingSubscriptions.reference, reference), eq(gamingSubscriptions.userId, ownerId)))
      .limit(1)
    return row ?? null
  } catch (error) {
    console.error("[v0] Could not read gaming_subscriptions", error)
    return null
  }
}

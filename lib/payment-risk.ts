import "server-only"

/**
 * Internal-only checkout risk context.
 *
 * This file exists to answer one question: "is this a genuinely
 * recognizable, low-risk customer, truthfully?" It is used for our own
 * monitoring/analytics (see the `payment_*` events logged in
 * lib/actions/checkout.ts) — never as an input to TamPay.
 *
 * Why not send this to TamPay: TamPay's documented payment-link API
 * (https://tampay.io/docapi) only accepts title, amount, currency,
 * paymentMethod, description, customer.{name,email,phone,city,country},
 * collectCustomerInfo, and buyerPaysFee. There is no metadata, customer_id,
 * device, browser, account-history, or risk field in that surface, so
 * nothing computed here has anywhere documented to go. If TamPay ever adds
 * one, wire it through explicitly and keep this comment in sync — don't
 * guess at an undocumented field name.
 *
 * Every value below is computed from data we actually have. None of it is
 * invented, estimated, or used to fabricate a "trusted" appearance.
 */

import { db } from "@/lib/db"
import { orders, user } from "@/lib/db/schema"
import { and, eq, sql } from "drizzle-orm"
import { getDeviceId } from "@/lib/device"
import { getSession } from "@/lib/session"

export interface PaymentRiskContext {
  userAuthenticated: boolean
  accountAgeDays: number | null
  emailVerified: boolean | null
  successfulOrders: number
  previousSuccessfulPayment: boolean
  knownDevice: boolean
  deviceFirstSeenDaysAgo: number | null
}

/**
 * Builds a truthful, internal-only risk snapshot for the current
 * authenticated user (or guest) at the moment a payment is initiated.
 * Safe to log; contains no PAN/CVV/auth secrets and no PII beyond what we
 * already store for the account itself.
 */
export async function buildPaymentRiskContext(ownerId: string): Promise<PaymentRiskContext> {
  const session = await getSession()
  const authenticatedUserId = session?.user?.id ?? null

  let accountAgeDays: number | null = null
  let emailVerified: boolean | null = null
  if (authenticatedUserId) {
    const [row] = await db
      .select({ createdAt: user.createdAt, emailVerified: user.emailVerified })
      .from(user)
      .where(eq(user.id, authenticatedUserId))
      .limit(1)
    if (row) {
      accountAgeDays = Math.max(0, Math.floor((Date.now() - new Date(row.createdAt).getTime()) / (1000 * 60 * 60 * 24)))
      emailVerified = row.emailVerified
    }
  }

  const [{ count }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(orders)
    .where(and(eq(orders.userId, ownerId), eq(orders.status, "completed")))

  const deviceId = await getDeviceId()

  return {
    userAuthenticated: Boolean(authenticatedUserId),
    accountAgeDays,
    emailVerified,
    successfulOrders: count,
    previousSuccessfulPayment: count > 0,
    // We only know a device cookie's presence/absence here, not truthfully
    // how long ago it was first set (the cookie carries no timestamp of its
    // own, and inventing one would violate the no-fabricated-signals rule).
    // deviceFirstSeenDaysAgo is left null until we persist first/last-seen
    // timestamps server-side keyed by deviceId.
    knownDevice: Boolean(deviceId),
    deviceFirstSeenDaysAgo: null,
  }
}

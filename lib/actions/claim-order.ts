"use server"

/**
 * Claiming a guest purchase into a real account.
 *
 * Checkout never requires an account up front — a guest pays with just a
 * name and email, and the order is written under their guest cookie id
 * (see lib/guest.ts). This file is what lets that guest attach the order to
 * a real account afterward, either right on the success page (a fresh
 * account, claimed immediately) or later by signing in to an existing one
 * (claimed via the same merge step auth-form.tsx already uses for carts and
 * recently-viewed activity).
 *
 * `orders.userId`, `entitlements.userId` and `download_events.userId` are
 * plain text columns (not a foreign key to `user.id`) specifically so they
 * can hold either a signed-in user id or a guest cookie id — moving them
 * from one to the other is just an UPDATE, never a copy or a new row.
 */

import { db } from "@/lib/db"
import { downloadEvents, entitlements, orders } from "@/lib/db/schema"
import { getGuestId } from "@/lib/guest"
import { getSession } from "@/lib/session"
import { RATE_LIMITS, enforceRateLimit } from "@/lib/rate-limit"
import { desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

/** Re-points every guest-owned order, entitlement, and download event at `userId`. */
async function moveGuestPurchasesToUser(guestId: string, userId: string) {
  await db.transaction(async (tx) => {
    await tx.update(orders).set({ userId }).where(eq(orders.userId, guestId))
    await tx.update(entitlements).set({ userId }).where(eq(entitlements.userId, guestId))
    await tx.update(downloadEvents).set({ userId }).where(eq(downloadEvents.userId, guestId))
  })
}

/**
 * Read-only: the identity (email/name) to prefill the "create a password"
 * card with, sourced from the guest's own most recent order. Returns null
 * once the visitor is signed in (nothing left to claim) or has no guest
 * order at all — both cases hide the card entirely.
 */
export async function getClaimableGuestOrder() {
  const session = await getSession()
  if (session?.user) return null

  const guestId = await getGuestId()
  if (!guestId) return null

  const [order] = await db
    .select({ billingEmail: orders.billingEmail, billingName: orders.billingName })
    .from(orders)
    .where(eq(orders.userId, guestId))
    .orderBy(desc(orders.createdAt))
    .limit(1)

  return order ?? null
}

/**
 * Called right after a guest signs in to an EXISTING account from the
 * success page (the "USER_ALREADY_EXISTS" branch of the claim card). Mirrors
 * mergeGuestCartIntoAccount/mergeGuestActivityIntoAccount — safe to call any
 * time a session exists, a no-op if there's nothing to claim.
 */
export async function claimGuestPurchases() {
  const session = await getSession()
  const guestId = await getGuestId()
  if (!session?.user || !guestId || session.user.id === guestId) return { success: true as const }

  await moveGuestPurchasesToUser(guestId, session.user.id)
  revalidatePath("/account/library")
  revalidatePath("/account/orders")
  revalidatePath("/account/licenses")
  return { success: true as const }
}

/**
 * Called after the success-page card's authClient.signUp.email() succeeds
 * for a BRAND NEW account (the account itself is created client-side, since
 * Better Auth's session cookie is only reliably set through its own client
 * fetch — see the Better Auth skill). This just performs the ownership
 * transfer once that new session exists, identically to claimGuestPurchases.
 * Kept as a separate export so the two call sites (new account vs. sign-in
 * to an existing one) stay easy to reason about independently, even though
 * they currently share the same implementation.
 */
export async function claimGuestPurchasesAfterSignUp() {
  await enforceRateLimit("claim-account", RATE_LIMITS.claimAccount)
  return claimGuestPurchases()
}

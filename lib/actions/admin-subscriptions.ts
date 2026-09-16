"use server"

import { revalidatePath } from "next/cache"
import { and, eq, inArray, isNotNull } from "drizzle-orm"
import { db } from "@/lib/db"
import { membershipPlans } from "@/lib/db/schema"
import { requireAdmin } from "@/lib/actions/operations"
import { isFungiesConfigured } from "@/lib/env"
import { SYNCED_PLAN_KINDS, syncSubscriptionPlansToFungies, type PlanFungiesSyncBatch } from "@/lib/membership-fungies-sync"

/**
 * Admin → Subscriptions → Sync to Fungies. Handles one small batch per call;
 * the client calls again until `remaining` is 0. Runs on the deployment, with
 * the Fungies keys already configured there.
 */
export async function syncSubscriptionPlansAction(): Promise<PlanFungiesSyncBatch | { error: string }> {
  await requireAdmin()
  if (!isFungiesConfigured()) return { error: "Fungies isn't configured on this deployment." }
  try {
    const batch = await syncSubscriptionPlansToFungies({ limit: 4 })
    revalidatePath("/admin/subscriptions")
    return batch
  } catch (error) {
    console.error("[v0] Subscription plan Fungies sync failed", error)
    return { error: error instanceof Error ? error.message : "The sync failed." }
  }
}

/**
 * Publishes every synced plan, and only those: a plan without a Fungies plan
 * id cannot be checked out, so listing it would offer a subscription that
 * fails at the till. Unsynced plans are reported back, not published.
 */
export async function publishSyncedPlansAction(): Promise<{ published: number; skipped: string[] } | { error: string }> {
  await requireAdmin()
  try {
    const published = await db
      .update(membershipPlans)
      .set({ isActive: true })
      .where(
        and(
          inArray(membershipPlans.kind, [...SYNCED_PLAN_KINDS]),
          eq(membershipPlans.isActive, false),
          isNotNull(membershipPlans.fungiesPlanId),
        ),
      )
      .returning({ slug: membershipPlans.slug })

    const unsynced = await db
      .select({ slug: membershipPlans.slug })
      .from(membershipPlans)
      .where(and(inArray(membershipPlans.kind, [...SYNCED_PLAN_KINDS]), eq(membershipPlans.isActive, false)))

    revalidatePath("/admin/subscriptions")
    revalidatePath("/subscriptions")
    return { published: published.length, skipped: unsynced.map((r) => r.slug) }
  } catch (error) {
    console.error("[v0] Publishing subscription plans failed", error)
    return { error: error instanceof Error ? error.message : "Publishing failed." }
  }
}

/** Takes every club, bundle and All-Access plan off the storefront again. */
export async function unpublishAllPlansAction(): Promise<{ unpublished: number } | { error: string }> {
  await requireAdmin()
  try {
    const rows = await db
      .update(membershipPlans)
      .set({ isActive: false })
      .where(and(inArray(membershipPlans.kind, [...SYNCED_PLAN_KINDS]), eq(membershipPlans.isActive, true)))
      .returning({ slug: membershipPlans.slug })
    revalidatePath("/admin/subscriptions")
    revalidatePath("/subscriptions")
    return { unpublished: rows.length }
  } catch (error) {
    console.error("[v0] Unpublishing subscription plans failed", error)
    return { error: error instanceof Error ? error.message : "Unpublishing failed." }
  }
}

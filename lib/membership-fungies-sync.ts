import "server-only"

/**
 * Pushes the scoped subscription plans (clubs, bundles, All-Access) to
 * Fungies: one Subscription product per plan, with one plan inside it, and the
 * ids written back onto membership_plans so checkout can find them
 * (lib/membership.ts → planBilling). Driven from Admin → Subscriptions and run
 * on the deployment, where the Fungies keys live.
 *
 * Mirrors lib/gaming/fungies-sync.ts, including its guarantees: a product is
 * matched on the `internalId` we set as `externalId`, only rows without a plan
 * id are touched, and the work runs in small batches so no request hits the
 * function time limit.
 *
 * Prices are deliberately NOT synced. Every subscriber gets their own
 * single-use recurring offer whose amount is read from the plan row at
 * checkout, so the Fungies plan is only a container for reporting.
 */

import { and, eq, inArray, isNull, or } from "drizzle-orm"
import { db } from "@/lib/db"
import { membershipPlans } from "@/lib/db/schema"
import {
  addFungiesPlan,
  createFungiesSubscriptionProduct,
  getFungiesProduct,
  listFungiesProducts,
  type FungiesProduct,
} from "@/lib/fungies"
import { FUNGIES_MEMBERSHIP_PRODUCT_ID, type MembershipPlan } from "@/lib/membership"

/** The kinds this sync owns; the three original tiers bill through constants. */
export const SYNCED_PLAN_KINDS = ["club", "bundle", "all-access"] as const

export interface PlanFungiesSyncRow {
  slug: string
  name: string
  /** created: new product and plan · linked: product already in Fungies, now recorded · plan-added: recorded product, plan added */
  outcome: "created" | "linked" | "plan-added" | "failed"
  productId?: string
  error?: string
}

export interface PlanFungiesSyncBatch {
  rows: PlanFungiesSyncRow[]
  /** Plans still not set up after this batch. */
  remaining: number
  /** Why the run stopped early; sync again once it's fixed. */
  stopped?: string
}

/** Every plan this sync owns, whether or not it is mapped or active. */
export async function listSyncablePlans(): Promise<MembershipPlan[]> {
  return db
    .select()
    .from(membershipPlans)
    .where(inArray(membershipPlans.kind, [...SYNCED_PLAN_KINDS]))
    .orderBy(membershipPlans.sortOrder)
}

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

function describe(plan: MembershipPlan): string {
  const claims = plan.monthlyCredits === null ? "Unlimited claims" : `${plan.monthlyCredits} claim${plan.monthlyCredits === 1 ? "" : "s"} each month`
  const cap = plan.creditValueCapUsd === null ? "any price" : `up to $${Number.parseFloat(plan.creditValueCapUsd).toFixed(0)} per claim`
  return `<p>${escapeHtml(plan.tagline ?? plan.name)}</p><p>${claims}, ${cap}. Everything you claim stays yours under the personal licence.</p><ul>${(plan.perks ?? [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("")}</ul>`
}

/** Stable Fungies externalId for a plan, so reruns match instead of duplicating. */
const externalIdFor = (plan: MembershipPlan) => `membership-plan.${plan.slug}`

export async function syncSubscriptionPlansToFungies({ limit }: { limit: number }): Promise<PlanFungiesSyncBatch> {
  const all = await listSyncablePlans()
  const todo = all.filter((plan) => !plan.fungiesPlanId)
  if (todo.length === 0) return { rows: [], remaining: 0 }

  // Products already in Fungies, by the externalId we set.
  const existing = new Map<string, FungiesProduct>()
  for (const fp of await listFungiesProducts("Subscription")) if (fp.internalId) existing.set(fp.internalId, fp)

  // New products copy the membership product's visibility (it already takes
  // payments) and its project, unless FUNGIES_PROJECT_ID names one.
  let status: FungiesProduct["status"] = "HIDDEN"
  let projectId = process.env.FUNGIES_PROJECT_ID?.trim() || null
  if (todo.some((plan) => !existing.has(externalIdFor(plan)))) {
    const membership = await getFungiesProduct(FUNGIES_MEMBERSHIP_PRODUCT_ID)
    status = membership.status ?? "HIDDEN"
    projectId ??= membership.projectId ?? membership.project?.id ?? null
  }

  const rows: PlanFungiesSyncRow[] = []
  for (const plan of todo.slice(0, limit)) {
    const features = (plan.perks ?? []).slice(0, 8)
    let fp = existing.get(externalIdFor(plan))
    try {
      // A product an earlier run recorded is reused even if the list didn't
      // return it (a hidden product, say), so it is never created twice.
      if (!fp && plan.fungiesProductId) fp = await getFungiesProduct(plan.fungiesProductId).catch(() => undefined)
      let outcome: PlanFungiesSyncRow["outcome"] = plan.fungiesProductId === fp?.id ? "plan-added" : "linked"
      if (!fp) {
        fp = await createFungiesSubscriptionProduct({
          name: `DistroSource — ${plan.name}`,
          description: describe(plan),
          features,
          status,
          externalId: externalIdFor(plan),
          projectId,
        })
        outcome = "created"
      }
      // Recorded before the plan is added, so a failure in between never loses
      // the product; the plan id stays null until it really exists.
      if (plan.fungiesProductId !== fp.id) {
        await db
          .update(membershipPlans)
          .set({ fungiesProductId: fp.id, fungiesPlanId: null })
          .where(eq(membershipPlans.id, plan.id))
      }
      const created = await addFungiesPlan(fp.id, {
        name: plan.name,
        description: plan.tagline ?? plan.name,
        features,
        externalId: `${externalIdFor(plan)}.plan`,
      })
      await db.update(membershipPlans).set({ fungiesPlanId: created.id }).where(eq(membershipPlans.id, plan.id))
      rows.push({ slug: plan.slug, name: plan.name, outcome, productId: fp.id })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error("[v0] Subscription plan Fungies sync failed for", plan.slug, error)
      rows.push({ slug: plan.slug, name: plan.name, outcome: "failed", productId: fp?.id, error: message })
      // Whatever failed here would fail the same way for the rest, so stop
      // rather than repeat it for every remaining plan.
      const hint = /project/i.test(message)
        ? " Add FUNGIES_PROJECT_ID (the project id from your Fungies dashboard) to the Vercel environment, redeploy, and sync again."
        : ""
      return {
        rows,
        remaining: todo.length - rows.filter((r) => r.outcome !== "failed").length,
        stopped: `Stopped at ${plan.name}: ${message}${hint}`,
      }
    }
  }
  return { rows, remaining: todo.length - rows.length }
}

/** How many plans are ready to sell, for the admin summary. */
export async function countMappedPlans(): Promise<{ mapped: number; total: number }> {
  const rows = await db
    .select({ id: membershipPlans.id, planId: membershipPlans.fungiesPlanId })
    .from(membershipPlans)
    .where(inArray(membershipPlans.kind, [...SYNCED_PLAN_KINDS]))
  return { mapped: rows.filter((r) => r.planId).length, total: rows.length }
}

/** Plans that are live on the storefront but cannot be checked out. */
export async function findUnsellableActivePlans(): Promise<MembershipPlan[]> {
  return db
    .select()
    .from(membershipPlans)
    .where(
      and(
        inArray(membershipPlans.kind, [...SYNCED_PLAN_KINDS]),
        eq(membershipPlans.isActive, true),
        or(isNull(membershipPlans.fungiesPlanId), isNull(membershipPlans.fungiesProductId)),
      ),
    )
}

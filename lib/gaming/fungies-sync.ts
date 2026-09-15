import "server-only"

/**
 * Pushes the Gaming catalogue to Fungies: one Subscription product with one
 * plan per catalogue plan, recorded in gaming_fungies_products so checkout
 * can find them (lib/gaming/billing.ts). Driven from Admin → Gaming → Sync to
 * Fungies and runs on the deployment, where the Fungies keys live.
 *
 * Idempotent: a product is matched on its `internalId` (the catalogue id we
 * set as `externalId`), and only plans without a recorded plan id are
 * touched, so rerunning after adding a catalogue plan creates just that one.
 * Work is done in small batches so no request hits the function time limit.
 */

import { eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { gamingFungiesProducts } from "@/lib/db/schema"
import {
  addFungiesPlan,
  createFungiesSubscriptionProduct,
  getFungiesProduct,
  listFungiesProducts,
  type FungiesProduct,
} from "@/lib/fungies"
import { GAMING_CATALOG } from "@/lib/gaming/catalog/products"
import type { GamingProduct } from "@/lib/gaming/catalog/types"
import { FUNGIES_MEMBERSHIP_PRODUCT_ID } from "@/lib/membership"

export type GamingFungiesMapping = typeof gamingFungiesProducts.$inferSelect

export interface GamingFungiesSyncRow {
  slug: string
  title: string
  /** created: new product and plan · linked: product already in Fungies, now recorded · plan-added: recorded product, plan added */
  outcome: "created" | "linked" | "plan-added" | "failed"
  productId?: string
  error?: string
}

export interface GamingFungiesSyncBatch {
  rows: GamingFungiesSyncRow[]
  /** Plans still not set up after this batch. */
  remaining: number
  /** Why the run stopped early; sync again once it's fixed. */
  stopped?: string
}

/** Recorded Fungies ids by slug, or null if the table doesn't exist yet. */
export async function getGamingFungiesMappings(): Promise<Map<string, GamingFungiesMapping> | null> {
  try {
    const rows = await db.select().from(gamingFungiesProducts)
    return new Map(rows.map((row) => [row.slug, row]))
  } catch (error) {
    console.error("[v0] Could not read gaming_fungies_products", error)
    return null
  }
}

const escapeHtml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")

function describe(product: GamingProduct): string {
  return `<p>${escapeHtml(product.summary)}</p><ul>${product.whatYouGet.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
}

export async function syncGamingPlansToFungies({ limit }: { limit: number }): Promise<GamingFungiesSyncBatch> {
  const saved = await getGamingFungiesMappings()
  if (!saved) throw new Error("The billing tables don't exist yet. Run scripts/db/add-gaming-subscriptions.sql in the Neon console first.")

  const todo = GAMING_CATALOG.filter((p) => p.pricing.kind === "subscription" && !saved.get(p.slug)?.fungiesPlanId)
  if (todo.length === 0) return { rows: [], remaining: 0 }

  // Products already in Fungies, by catalogue id.
  const existing = new Map<string, FungiesProduct>()
  for (const fp of await listFungiesProducts("Subscription")) if (fp.internalId) existing.set(fp.internalId, fp)

  // New products copy the membership product's visibility (it already takes
  // payments) and its project, unless FUNGIES_PROJECT_ID names one.
  let status: FungiesProduct["status"] = "HIDDEN"
  let projectId = process.env.FUNGIES_PROJECT_ID?.trim() || null
  if (todo.some((p) => !existing.has(p.id))) {
    const membership = await getFungiesProduct(FUNGIES_MEMBERSHIP_PRODUCT_ID)
    status = membership.status ?? "HIDDEN"
    projectId ??= membership.projectId ?? membership.project?.id ?? null
  }

  const rows: GamingFungiesSyncRow[] = []
  for (const product of todo.slice(0, limit)) {
    const recorded = saved.get(product.slug)
    const features = product.whatYouGet.slice(0, 8)
    let fp = existing.get(product.id)
    try {
      let outcome: GamingFungiesSyncRow["outcome"] = recorded?.fungiesProductId === fp?.id ? "plan-added" : "linked"
      if (!fp) {
        fp = await createFungiesSubscriptionProduct({
          name: `DistroSource Gaming — ${product.title}`,
          description: describe(product),
          features,
          status,
          externalId: product.id,
          projectId,
        })
        outcome = "created"
      }
      // Recorded before the plan is added, so a failure in between never loses the product.
      if (recorded?.fungiesProductId !== fp.id) {
        await db
          .insert(gamingFungiesProducts)
          .values({ slug: product.slug, fungiesProductId: fp.id, fungiesPlanId: null })
          .onConflictDoUpdate({
            target: gamingFungiesProducts.slug,
            set: { fungiesProductId: fp.id, fungiesPlanId: null, syncedAt: new Date() },
          })
      }
      const plan = await addFungiesPlan(fp.id, {
        name: product.title,
        description: product.summary,
        features,
        externalId: `${product.id}.plan`,
      })
      await db
        .update(gamingFungiesProducts)
        .set({ fungiesPlanId: plan.id, syncedAt: new Date() })
        .where(eq(gamingFungiesProducts.slug, product.slug))
      rows.push({ slug: product.slug, title: product.title, outcome, productId: fp.id })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      console.error("[v0] Gaming Fungies sync failed for", product.slug, error)
      rows.push({ slug: product.slug, title: product.title, outcome: "failed", productId: fp?.id, error: message })
      // Whatever failed here (a missing project, a rejected field) would fail
      // the same way for the rest, so stop rather than repeat it 26 times.
      const hint = /project/i.test(message)
        ? " Add FUNGIES_PROJECT_ID (the project id from your Fungies dashboard) to the Vercel environment, redeploy, and sync again."
        : ""
      return {
        rows,
        remaining: todo.length - rows.filter((r) => r.outcome !== "failed").length,
        stopped: `Stopped at ${product.title}: ${message}${hint}`,
      }
    }
  }
  return { rows, remaining: todo.length - rows.length }
}

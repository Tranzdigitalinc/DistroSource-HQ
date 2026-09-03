"use server"

import { revalidatePath } from "next/cache"
import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { entitlements, products, reviews } from "@/lib/db/schema"
import { getOptionalUserId } from "@/lib/session"

/**
 * A review can only be left by a signed-in user with a live (non-revoked)
 * entitlement for the product — i.e. someone who actually bought it. This is
 * the only path that writes to the reviews table; there is no seed data or
 * fabricated review generation anywhere else in the codebase.
 */
export async function getReviewEligibility(productId: number) {
  const userId = await getOptionalUserId()
  if (!userId) return { canReview: false, reason: "signed-out" as const }

  const [entitlement] = await db
    .select({ id: entitlements.id })
    .from(entitlements)
    .where(and(eq(entitlements.userId, userId), eq(entitlements.productId, productId), eq(entitlements.isRevoked, false)))
    .limit(1)

  if (!entitlement) return { canReview: false, reason: "not-purchased" as const }

  const [existingReview] = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(and(eq(reviews.userId, userId), eq(reviews.productId, productId)))
    .limit(1)

  if (existingReview) return { canReview: false, reason: "already-reviewed" as const }

  return { canReview: true, reason: null }
}

export async function submitReview(input: { productId: number; rating: number; title: string; body: string }) {
  const userId = await getOptionalUserId()
  if (!userId) throw new Error("You must be signed in to leave a review.")

  const rating = Math.round(input.rating)
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5.")
  }

  const title = input.title.trim().slice(0, 120)
  const body = input.body.trim().slice(0, 2000)
  if (body.length < 10) {
    throw new Error("Please write at least a few words about your experience.")
  }

  const [product] = await db.select({ id: products.id, slug: products.slug }).from(products).where(eq(products.id, input.productId)).limit(1)
  if (!product) throw new Error("Product not found.")

  const [entitlement] = await db
    .select({ id: entitlements.id })
    .from(entitlements)
    .where(and(eq(entitlements.userId, userId), eq(entitlements.productId, product.id), eq(entitlements.isRevoked, false)))
    .limit(1)

  if (!entitlement) {
    throw new Error("Only customers who purchased this product can leave a review.")
  }

  const [existingReview] = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(and(eq(reviews.userId, userId), eq(reviews.productId, product.id)))
    .limit(1)

  if (existingReview) {
    throw new Error("You've already reviewed this product.")
  }

  await db.insert(reviews).values({
    productId: product.id,
    userId,
    rating,
    title: title || null,
    body: body || null,
  })

  revalidatePath(`/products/${product.slug}`)
  revalidatePath("/")

  return { success: true as const }
}

"use server"

import { revalidatePath } from "next/cache"
import { desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { products, reviews, user } from "@/lib/db/schema"
import { requireAdmin } from "@/lib/actions/operations"

export async function getAdminReviews() {
  await requireAdmin()

  return db
    .select({ review: reviews, product: products, reviewer: user })
    .from(reviews)
    .innerJoin(products, eq(reviews.productId, products.id))
    .leftJoin(user, eq(reviews.userId, user.id))
    .orderBy(desc(reviews.createdAt))
    .limit(200)
}

export async function deleteReview(reviewId: number) {
  await requireAdmin()
  await db.delete(reviews).where(eq(reviews.id, reviewId))
  revalidatePath("/admin/reviews")
}

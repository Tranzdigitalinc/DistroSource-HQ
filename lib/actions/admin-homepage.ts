"use server"

import { revalidatePath } from "next/cache"
import { desc, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { categories, products } from "@/lib/db/schema"
import { requireAdmin } from "@/lib/actions/operations"

export async function getHomepageMerchandising() {
  await requireAdmin()

  const rows = await db
    .select({ product: products, categoryName: categories.name })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.status, "published"))
    .orderBy(desc(products.updatedAt))

  const featured = rows.filter((r) => r.product.isFeatured)
  const newReleases = rows.filter((r) => r.product.isNewRelease)
  const rest = rows.filter((r) => !r.product.isFeatured && !r.product.isNewRelease)

  return { featured, newReleases, rest }
}

export async function toggleHomepageFlag(productId: number, flag: "isFeatured" | "isNewRelease", value: boolean) {
  await requireAdmin()
  await db
    .update(products)
    .set({ [flag]: value, updatedAt: new Date() })
    .where(eq(products.id, productId))
  revalidatePath("/admin/homepage")
  revalidatePath("/")
}

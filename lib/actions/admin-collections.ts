"use server"

import { revalidatePath } from "next/cache"
import { desc, eq, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { bundleItems, categories, products } from "@/lib/db/schema"
import { requireAdmin } from "@/lib/actions/operations"

export async function getAdminCollections() {
  await requireAdmin()

  const bundles = await db
    .select({ product: products, category: categories })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.isBundle, true))
    .orderBy(desc(products.updatedAt))

  const counts = await db
    .select({ bundleProductId: bundleItems.bundleProductId, count: sql<number>`count(*)::int` })
    .from(bundleItems)
    .groupBy(bundleItems.bundleProductId)
  const countByBundle = new Map(counts.map((c) => [c.bundleProductId, c.count]))

  return bundles.map((row) => ({
    ...row.product,
    categoryName: row.category.name,
    itemCount: countByBundle.get(row.product.id) ?? 0,
  }))
}

export async function createCollectionDraft(name: string) {
  await requireAdmin()
  const trimmed = name.trim()
  if (!trimmed) throw new Error("A bundle name is required.")

  const slug = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")

  const [defaultCategory] = await db.select({ id: categories.id }).from(categories).orderBy(categories.sortOrder).limit(1)
  if (!defaultCategory) throw new Error("Create a category before creating a bundle.")

  const [created] = await db
    .insert(products)
    .values({
      slug: slug || `bundle-${Date.now()}`,
      name: trimmed,
      description: "",
      categoryId: defaultCategory.id,
      status: "draft",
      basePrice: "0",
      isBundle: true,
    })
    .returning({ id: products.id })

  revalidatePath("/admin/collections")
  return created.id
}

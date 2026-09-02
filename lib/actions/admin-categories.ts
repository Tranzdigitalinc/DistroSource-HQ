"use server"

import { revalidatePath } from "next/cache"
import { and, eq, ne, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import { categories, products } from "@/lib/db/schema"
import { requireAdmin } from "@/lib/actions/operations"

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
}

export type CategoryFormInput = {
  name: string
  slug: string
  description: string
  icon: string
  heroImageUrl: string
  sortOrder: string
  seoTitle: string
  seoDescription: string
}

export async function getAdminCategories() {
  await requireAdmin()
  const rows = await db
    .select({
      id: categories.id,
      slug: categories.slug,
      name: categories.name,
      description: categories.description,
      icon: categories.icon,
      heroImageUrl: categories.heroImageUrl,
      sortOrder: categories.sortOrder,
      productCount: sql<number>`count(${products.id})`.mapWith(Number),
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(categories.sortOrder, categories.name)
  return rows
}

export async function getAdminCategoryById(id: number) {
  await requireAdmin()
  const [category] = await db.select().from(categories).where(eq(categories.id, id))
  return category ?? null
}

export async function createCategory(input: CategoryFormInput) {
  await requireAdmin()
  const slug = input.slug.trim() ? slugify(input.slug) : slugify(input.name)
  if (!slug) throw new Error("A category name or slug is required.")

  const [existing] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, slug))
  if (existing) throw new Error("A category with this slug already exists.")

  const [created] = await db
    .insert(categories)
    .values({
      slug,
      name: input.name.trim(),
      description: input.description.trim() || null,
      icon: input.icon.trim() || null,
      heroImageUrl: input.heroImageUrl.trim() || null,
      sortOrder: input.sortOrder ? Number.parseInt(input.sortOrder, 10) || 0 : 0,
      seoTitle: input.seoTitle.trim() || null,
      seoDescription: input.seoDescription.trim() || null,
    })
    .returning({ id: categories.id })

  revalidatePath("/admin/categories")
  revalidatePath("/categories")
  return created.id
}

export async function updateCategory(id: number, input: CategoryFormInput) {
  await requireAdmin()
  const slug = input.slug.trim() ? slugify(input.slug) : slugify(input.name)
  if (!slug) throw new Error("A category name or slug is required.")

  const [existing] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(and(eq(categories.slug, slug), ne(categories.id, id)))
  if (existing) throw new Error("Another category already uses this slug.")

  await db
    .update(categories)
    .set({
      slug,
      name: input.name.trim(),
      description: input.description.trim() || null,
      icon: input.icon.trim() || null,
      heroImageUrl: input.heroImageUrl.trim() || null,
      sortOrder: input.sortOrder ? Number.parseInt(input.sortOrder, 10) || 0 : 0,
      seoTitle: input.seoTitle.trim() || null,
      seoDescription: input.seoDescription.trim() || null,
    })
    .where(eq(categories.id, id))

  revalidatePath("/admin/categories")
  revalidatePath("/categories")
  revalidatePath(`/categories/${slug}`)
  return { slug }
}

export async function deleteCategory(id: number) {
  await requireAdmin()
  const [{ count }] = await db
    .select({ count: sql<number>`count(*)`.mapWith(Number) })
    .from(products)
    .where(eq(products.categoryId, id))

  if (count > 0) {
    throw new Error(`This category has ${count} product${count === 1 ? "" : "s"} assigned to it. Move or delete them first.`)
  }

  await db.delete(categories).where(eq(categories.id, id))
  revalidatePath("/admin/categories")
  revalidatePath("/categories")
}

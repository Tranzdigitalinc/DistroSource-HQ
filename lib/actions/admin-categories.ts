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
  parentId: string // "" means top-level department
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
      parentId: categories.parentId,
      productCount: sql<number>`count(${products.id})`.mapWith(Number),
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(categories.sortOrder, categories.name)
  return rows
}

// Top-level departments only, for the "parent department" select in the
// category form. A department cannot be nested under another department.
export async function getAdminDepartments() {
  await requireAdmin()
  return db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(sql`${categories.parentId} is null`)
    .orderBy(categories.sortOrder, categories.name)
}

export async function getAdminCategoryById(id: number) {
  await requireAdmin()
  const [category] = await db.select().from(categories).where(eq(categories.id, id))
  return category ?? null
}

// Only 2 levels are allowed: departments (parentId null) and subcategories
// (parentId -> a department). A subcategory can never be chosen as a parent.
async function resolveParentId(rawParentId: string, selfId?: number) {
  if (!rawParentId.trim()) return null
  const parentId = Number.parseInt(rawParentId, 10)
  if (!Number.isFinite(parentId)) throw new Error("Invalid parent department.")
  if (selfId !== undefined && parentId === selfId) throw new Error("A category cannot be its own parent.")

  const [parent] = await db.select({ id: categories.id, parentId: categories.parentId }).from(categories).where(eq(categories.id, parentId))
  if (!parent) throw new Error("Selected parent department does not exist.")
  if (parent.parentId !== null) throw new Error("The category model only supports 2 levels: a subcategory cannot be nested under another subcategory.")

  return parentId
}

export async function createCategory(input: CategoryFormInput) {
  await requireAdmin()
  const slug = input.slug.trim() ? slugify(input.slug) : slugify(input.name)
  if (!slug) throw new Error("A category name or slug is required.")

  const [existing] = await db.select({ id: categories.id }).from(categories).where(eq(categories.slug, slug))
  if (existing) throw new Error("A category with this slug already exists.")

  const parentId = await resolveParentId(input.parentId)

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
      parentId,
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

  const parentId = await resolveParentId(input.parentId, id)

  // Turning a department into a subcategory (or vice versa) is only safe
  // when nothing currently depends on the old shape.
  if (parentId !== null) {
    const [{ count: childCount }] = await db
      .select({ count: sql<number>`count(*)`.mapWith(Number) })
      .from(categories)
      .where(eq(categories.parentId, id))
    if (childCount > 0) {
      throw new Error(`This department has ${childCount} subcategor${childCount === 1 ? "y" : "ies"} under it. Move or delete them before assigning a parent department.`)
    }
  }

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
      parentId,
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

  const [{ childCount }] = await db
    .select({ childCount: sql<number>`count(*)`.mapWith(Number) })
    .from(categories)
    .where(eq(categories.parentId, id))
  if (childCount > 0) {
    throw new Error(`This department has ${childCount} subcategor${childCount === 1 ? "y" : "ies"} under it. Move or delete them first.`)
  }

  await db.delete(categories).where(eq(categories.id, id))
  revalidatePath("/admin/categories")
  revalidatePath("/categories")
}

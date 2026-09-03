"use server"

import { revalidatePath } from "next/cache"
import { and, asc, desc, eq, ilike, or, sql } from "drizzle-orm"
import { db } from "@/lib/db"
import {
  bundleItems,
  categories,
  productFiles,
  productImages,
  productLicenses,
  productVersions,
  products,
} from "@/lib/db/schema"
import { requireAdmin } from "@/lib/actions/operations"

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

function parseListField(value: string): string[] {
  return value
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
}

// Slugs have a unique constraint at the DB level, but nothing upstream of the
// insert/update ever checked for collisions — two products with the same or
// similarly-named title (e.g. importing the same Envato item twice, or two
// items that normalize to the same slug) hit a raw Postgres unique-violation
// that propagated out of the Server Action unhandled. Always resolve to a
// slug that's actually free before writing, appending -2, -3, etc. as needed.
async function ensureUniqueSlug(baseSlug: string, excludeId?: number): Promise<string> {
  const existing = await db
    .select({ slug: products.slug })
    .from(products)
    .where(
      excludeId !== undefined
        ? and(or(eq(products.slug, baseSlug), ilike(products.slug, `${baseSlug}-%`))!, sql`${products.id} != ${excludeId}`)
        : or(eq(products.slug, baseSlug), ilike(products.slug, `${baseSlug}-%`))!,
    )

  if (existing.length === 0) return baseSlug

  const taken = new Set(existing.map((row) => row.slug))
  if (!taken.has(baseSlug)) return baseSlug

  let n = 2
  while (taken.has(`${baseSlug}-${n}`)) n++
  return `${baseSlug}-${n}`
}

export async function getAdminProducts(
  search?: string,
  statusFilter?:
    | "ready"
    | "preview_only"
    | "draft"
    | "published"
    | "rights_pending"
    | "rights_rejected"
    | "rights_missing_proof",
) {
  await requireAdmin()

  const conditions = search
    ? [or(ilike(products.name, `%${search}%`), ilike(products.slug, `%${search}%`))!]
    : []

  if (statusFilter === "ready") conditions.push(eq(products.assetStatus, "ready"))
  else if (statusFilter === "preview_only") conditions.push(eq(products.assetStatus, "preview_only"))
  else if (statusFilter === "draft") conditions.push(eq(products.status, "draft"))
  else if (statusFilter === "published") conditions.push(eq(products.status, "published"))
  else if (statusFilter === "rights_pending") conditions.push(eq(products.rightsStatus, "pending_verification"))
  else if (statusFilter === "rights_rejected") conditions.push(eq(products.rightsStatus, "rejected"))
  else if (statusFilter === "rights_missing_proof")
    conditions.push(sql`(${products.proofOfRights} is null or trim(${products.proofOfRights}) = '')`)

  const rows = await db
    .select({ product: products, category: categories })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(products.updatedAt))

  return rows
}

export async function getAdminProductById(id: number) {
  await requireAdmin()

  const [row] = await db
    .select({ product: products, category: categories })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.id, id))
    .limit(1)

  if (!row) return null

  const [images, licenses, files, versions, allCategories, allProducts] = await Promise.all([
    db.select().from(productImages).where(eq(productImages.productId, id)).orderBy(asc(productImages.sortOrder)),
    db.select().from(productLicenses).where(eq(productLicenses.productId, id)).orderBy(asc(productLicenses.sortOrder)),
    db.select().from(productFiles).where(eq(productFiles.productId, id)).orderBy(asc(productFiles.sortOrder)),
    db.select().from(productVersions).where(eq(productVersions.productId, id)).orderBy(desc(productVersions.releasedAt)),
    db.select().from(categories).orderBy(asc(categories.sortOrder)),
    db.select({ id: products.id, name: products.name }).from(products).where(sql`${products.id} != ${id}`).orderBy(asc(products.name)),
  ])

  const bundleContents = row.product.isBundle
    ? await db.select().from(bundleItems).where(eq(bundleItems.bundleProductId, id))
    : []

  return {
    ...row,
    images,
    licenses,
    files,
    versions,
    bundleContents,
    allCategories,
    allProducts,
  }
}

export interface ProductFormInput {
  name: string
  slug?: string
  tagline: string
  description: string
  categoryId: number
  status: "draft" | "published"
  basePrice: string
  compareAtPrice: string
  thumbnailUrl: string
  coverImageUrl: string
  fileFormats: string
  fileSizeMb: string
  softwareCompatibility: string
  currentVersion: string
  includedFiles: string
  documentation: string
  tags: string
  isFeatured: boolean
  isNewRelease: boolean
  isFree: boolean
  isBundle: boolean
  seoTitle: string
  seoDescription: string
}

async function assertPublishable(id: number, status: string) {
  if (status !== "published") return
  const [[fileCount], [imageCount], [licenseCount]] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(productFiles).where(eq(productFiles.productId, id)),
    db.select({ count: sql<number>`count(*)::int` }).from(productImages).where(eq(productImages.productId, id)),
    db.select({ count: sql<number>`count(*)::int` }).from(productLicenses).where(eq(productLicenses.productId, id)),
  ])
  if ((fileCount?.count ?? 0) < 1) throw new Error("Add at least one downloadable file before publishing.")
  if ((imageCount?.count ?? 0) < 1) throw new Error("Add at least one preview image before publishing.")
  // Without a license row, the purchase panel has nothing to sell and
  // renders nothing — a live product with no way to buy it.
  if ((licenseCount?.count ?? 0) < 1) throw new Error("Add at least one license/pricing plan before publishing.")
}

export async function createProduct(input: ProductFormInput) {
  await requireAdmin()

  const requestedSlug = input.slug?.trim() ? slugify(input.slug) : slugify(input.name)
  if (!requestedSlug) throw new Error("A product name or slug is required.")
  const slug = await ensureUniqueSlug(requestedSlug)

  const [created] = await db
    .insert(products)
    .values({
      slug,
      name: input.name.trim(),
      tagline: input.tagline.trim() || null,
      description: input.description.trim(),
      categoryId: input.categoryId,
      status: "draft",
      basePrice: input.basePrice || "0",
      compareAtPrice: input.compareAtPrice || null,
      thumbnailUrl: input.thumbnailUrl.trim() || null,
      coverImageUrl: input.coverImageUrl.trim() || null,
      fileFormats: parseListField(input.fileFormats),
      fileSizeMb: input.fileSizeMb || null,
      softwareCompatibility: parseListField(input.softwareCompatibility),
      currentVersion: input.currentVersion.trim() || "1.0.0",
      includedFiles: parseListField(input.includedFiles),
      documentation: input.documentation.trim() || null,
      tags: parseListField(input.tags),
      isFeatured: input.isFeatured,
      isNewRelease: input.isNewRelease,
      isFree: input.isFree,
      isBundle: input.isBundle,
      seoTitle: input.seoTitle.trim() || null,
      seoDescription: input.seoDescription.trim() || null,
    })
    .returning({ id: products.id })

  revalidatePath("/admin/products")
  return created.id
}

export async function updateProduct(id: number, input: ProductFormInput) {
  await requireAdmin()

  if (input.status === "published") {
    await assertPublishable(id, input.status)
  }

  const requestedSlug = input.slug?.trim() ? slugify(input.slug) : slugify(input.name)
  const slug = await ensureUniqueSlug(requestedSlug, id)

  await db
    .update(products)
    .set({
      slug,
      name: input.name.trim(),
      tagline: input.tagline.trim() || null,
      description: input.description.trim(),
      categoryId: input.categoryId,
      status: input.status,
      basePrice: input.basePrice || "0",
      compareAtPrice: input.compareAtPrice || null,
      thumbnailUrl: input.thumbnailUrl.trim() || null,
      coverImageUrl: input.coverImageUrl.trim() || null,
      fileFormats: parseListField(input.fileFormats),
      fileSizeMb: input.fileSizeMb || null,
      softwareCompatibility: parseListField(input.softwareCompatibility),
      currentVersion: input.currentVersion.trim() || "1.0.0",
      includedFiles: parseListField(input.includedFiles),
      documentation: input.documentation.trim() || null,
      tags: parseListField(input.tags),
      isFeatured: input.isFeatured,
      isNewRelease: input.isNewRelease,
      isFree: input.isFree,
      isBundle: input.isBundle,
      seoTitle: input.seoTitle.trim() || null,
      seoDescription: input.seoDescription.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id))

  revalidatePath("/admin/products")
  revalidatePath(`/admin/products/${id}`)
  revalidatePath(`/products/${slug}`)
}

export async function deleteProduct(id: number) {
  await requireAdmin()
  await db.delete(products).where(eq(products.id, id))
  revalidatePath("/admin/products")
}

// --- Images ---

export async function addProductImage(productId: number, url: string, alt: string) {
  await requireAdmin()
  const [{ maxSort }] = await db
    .select({ maxSort: sql<number>`coalesce(max(${productImages.sortOrder}), -1)::int` })
    .from(productImages)
    .where(eq(productImages.productId, productId))

  await db.insert(productImages).values({ productId, url, alt: alt || null, sortOrder: maxSort + 1 })
  revalidatePath(`/admin/products/${productId}`)
}

export async function deleteProductImage(id: number, productId: number) {
  await requireAdmin()
  await db.delete(productImages).where(eq(productImages.id, id))
  revalidatePath(`/admin/products/${productId}`)
}

// --- Files ---

export async function addProductFile(
  productId: number,
  input: { fileName: string; blobPathname: string; fileSizeBytes: number | null; fileType: string | null; licenseType: string | null },
) {
  await requireAdmin()
  const [{ maxSort }] = await db
    .select({ maxSort: sql<number>`coalesce(max(${productFiles.sortOrder}), -1)::int` })
    .from(productFiles)
    .where(eq(productFiles.productId, productId))

  await db.insert(productFiles).values({
    productId,
    fileName: input.fileName,
    blobPathname: input.blobPathname,
    fileSizeBytes: input.fileSizeBytes,
    fileType: input.fileType,
    licenseType: input.licenseType,
    sortOrder: maxSort + 1,
  })
  revalidatePath(`/admin/products/${productId}`)
}

export async function deleteProductFile(id: number, productId: number) {
  await requireAdmin()
  await db.delete(productFiles).where(eq(productFiles.id, id))
  revalidatePath(`/admin/products/${productId}`)
}

// --- Licenses ---

export async function addProductLicense(
  productId: number,
  input: { licenseType: string; price: string; description: string },
) {
  await requireAdmin()
  const [{ maxSort }] = await db
    .select({ maxSort: sql<number>`coalesce(max(${productLicenses.sortOrder}), -1)::int` })
    .from(productLicenses)
    .where(eq(productLicenses.productId, productId))

  await db.insert(productLicenses).values({
    productId,
    licenseType: input.licenseType,
    price: input.price,
    description: input.description || null,
    sortOrder: maxSort + 1,
  })
  revalidatePath(`/admin/products/${productId}`)
}

export async function updateProductLicense(id: number, productId: number, input: { licenseType: string; price: string; description: string }) {
  await requireAdmin()
  await db
    .update(productLicenses)
    .set({ licenseType: input.licenseType, price: input.price, description: input.description || null })
    .where(eq(productLicenses.id, id))
  revalidatePath(`/admin/products/${productId}`)
}

export async function deleteProductLicense(id: number, productId: number) {
  await requireAdmin()
  await db.delete(productLicenses).where(eq(productLicenses.id, id))
  revalidatePath(`/admin/products/${productId}`)
}

// --- Versions ---

export async function addProductVersion(productId: number, input: { version: string; changelog: string }) {
  await requireAdmin()
  await db.insert(productVersions).values({ productId, version: input.version, changelog: input.changelog || null })
  await db.update(products).set({ currentVersion: input.version, updatedAt: new Date() }).where(eq(products.id, productId))
  revalidatePath(`/admin/products/${productId}`)
}

export async function deleteProductVersion(id: number, productId: number) {
  await requireAdmin()
  await db.delete(productVersions).where(eq(productVersions.id, id))
  revalidatePath(`/admin/products/${productId}`)
}

// --- Bundle contents ---

export async function setBundleContents(bundleProductId: number, includedProductIds: number[]) {
  await requireAdmin()
  await db.delete(bundleItems).where(eq(bundleItems.bundleProductId, bundleProductId))
  if (includedProductIds.length > 0) {
    await db.insert(bundleItems).values(includedProductIds.map((includedProductId) => ({ bundleProductId, includedProductId })))
  }
  revalidatePath(`/admin/products/${bundleProductId}`)
}

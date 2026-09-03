import { db } from "@/lib/db"
import {
  bundleItems,
  categories,
  productFiles,
  productImages,
  productLicenses,
  productVersions,
  products,
  reviews,
  user,
} from "@/lib/db/schema"
import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm"

// A product may be publicly listed/purchasable only when its distribution rights
// have been approved. Anything pending_verification or rejected must never surface
// on the storefront, even if status/assetStatus otherwise look "ready".
const APPROVED_RIGHTS_STATUSES = ["original", "licensed_for_distribution", "supplier_verified"] as const
const publiclyVisible = () =>
  and(eq(products.status, "published"), eq(products.assetStatus, "ready"), inArray(products.rightsStatus, APPROVED_RIGHTS_STATUSES))!

// Products only ever attach to a subcategory (parentId is not null), never
// directly to a top-level department. Every list of "categories" for filter
// pills, dropdowns, and sitemaps means subcategories unless noted otherwise.
export async function getCategories() {
  return db
    .select({
      id: categories.id,
      slug: categories.slug,
      name: categories.name,
      description: categories.description,
      icon: categories.icon,
      heroImageUrl: categories.heroImageUrl,
      sortOrder: categories.sortOrder,
      parentId: categories.parentId,
      productCount: sql<number>`cast(count(${products.id}) as int)`,
    })
    .from(categories)
    .leftJoin(products, and(eq(products.categoryId, categories.id), publiclyVisible()))
    .where(sql`${categories.parentId} is not null`)
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder))
}

export type CategoryTreeNode = Awaited<ReturnType<typeof getCategoryTree>>[number]

// Full 2-level hierarchy: top-level departments, each with its subcategories
// nested underneath and a rolled-up product count for the whole department.
export async function getCategoryTree() {
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
      productCount: sql<number>`cast(count(${products.id}) as int)`,
    })
    .from(categories)
    .leftJoin(products, and(eq(products.categoryId, categories.id), publiclyVisible()))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder))

  const departments = rows.filter((row) => row.parentId === null)
  const subcategoriesByParent = new Map<number, typeof rows>()
  for (const row of rows) {
    if (row.parentId === null) continue
    const list = subcategoriesByParent.get(row.parentId) ?? []
    list.push(row)
    subcategoriesByParent.set(row.parentId, list)
  }

  return departments.map((department) => {
    const subcategories = subcategoriesByParent.get(department.id) ?? []
    return {
      ...department,
      subcategories,
      productCount: subcategories.reduce((sum, sub) => sum + sub.productCount, 0),
    }
  })
}

export async function getCategoryBySlug(slug: string) {
  const rows = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1)
  return rows[0] ?? null
}

// For a category page's in-page nav: the department this category belongs
// to (itself, if it already is one) plus that department's subcategories,
// so the page can link to real sibling routes instead of a query param.
export async function getCategoryNavContext(category: { id: number; parentId: number | null }) {
  const departmentId = category.parentId ?? category.id
  const [department] = await db.select({ id: categories.id, slug: categories.slug, name: categories.name }).from(categories).where(eq(categories.id, departmentId))
  const subcategories = await db
    .select({ id: categories.id, slug: categories.slug, name: categories.name })
    .from(categories)
    .where(eq(categories.parentId, departmentId))
    .orderBy(asc(categories.sortOrder))

  return { department: department ?? null, subcategories }
}

// Resolves a category slug to the set of category ids whose products should
// be shown on that page: itself if it's a subcategory, or all of its
// subcategories if it's a top-level department (departments never hold
// products directly).
async function getCategoryIdsForSlug(slug: string) {
  const category = await getCategoryBySlug(slug)
  if (!category) return { category: null, ids: [] as number[] }
  if (category.parentId !== null) return { category, ids: [category.id] }

  const children = await db.select({ id: categories.id }).from(categories).where(eq(categories.parentId, category.id))
  return { category, ids: children.map((c) => c.id) }
}

async function attachRelations(productRows: (typeof products.$inferSelect)[]) {
  if (productRows.length === 0) return []
  const ids = productRows.map((p) => p.id)

  const [images, licenses] = await Promise.all([
    db.select().from(productImages).where(inArray(productImages.productId, ids)).orderBy(asc(productImages.sortOrder)),
    db.select().from(productLicenses).where(inArray(productLicenses.productId, ids)).orderBy(asc(productLicenses.sortOrder)),
  ])

  const imagesByProduct = new Map<number, typeof images>()
  for (const img of images) {
    const list = imagesByProduct.get(img.productId) ?? []
    list.push(img)
    imagesByProduct.set(img.productId, list)
  }
  const licensesByProduct = new Map<number, typeof licenses>()
  for (const lic of licenses) {
    const list = licensesByProduct.get(lic.productId) ?? []
    list.push(lic)
    licensesByProduct.set(lic.productId, list)
  }

  return productRows.map((product) => {
    const productLicensesList = licensesByProduct.get(product.id) ?? []
    const startingPrice = productLicensesList.length
      ? Math.min(...productLicensesList.map((l) => Number.parseFloat(l.price)))
      : Number.parseFloat(product.basePrice)
    return {
      product,
      images: imagesByProduct.get(product.id) ?? [],
      licenses: productLicensesList,
      startingPrice,
    }
  })
}

export type ProductWithRelations = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>

export async function getProductBySlug(slug: string) {
  const rows = await db
    .select({ product: products, category: categories })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.slug, slug))
    .limit(1)

  if (!rows[0]) return null
  const { product, category } = rows[0]

  const [images, licenses, files, productReviewRows, versions, bundleContents] = await Promise.all([
    db.select().from(productImages).where(eq(productImages.productId, product.id)).orderBy(asc(productImages.sortOrder)),
    db.select().from(productLicenses).where(eq(productLicenses.productId, product.id)).orderBy(asc(productLicenses.sortOrder)),
    db.select().from(productFiles).where(eq(productFiles.productId, product.id)).orderBy(asc(productFiles.sortOrder)),
    db
      .select({ review: reviews, authorName: user.name })
      .from(reviews)
      .innerJoin(user, eq(reviews.userId, user.id))
      .where(eq(reviews.productId, product.id))
      .orderBy(desc(reviews.createdAt))
      .limit(20),
    db.select().from(productVersions).where(eq(productVersions.productId, product.id)).orderBy(desc(productVersions.releasedAt)),
    product.isBundle
      ? db
          .select({ product: products, category: categories })
          .from(bundleItems)
          .innerJoin(products, eq(bundleItems.includedProductId, products.id))
          .innerJoin(categories, eq(products.categoryId, categories.id))
          .where(eq(bundleItems.bundleProductId, product.id))
      : Promise.resolve([]),
  ])

  const productReviews = productReviewRows.map((row) => ({ ...row.review, authorName: row.authorName }))

  const avgRating = productReviews.length
    ? productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length
    : null

  return {
    product,
    category,
    images,
    licenses,
    files,
    reviews: productReviews,
    versions,
    bundleContents,
    avgRating,
    reviewCount: productReviews.length,
  }
}

interface ProductQueryOptions {
  categorySlug?: string
  search?: string
  featured?: boolean
  newRelease?: boolean
  free?: boolean
  bundle?: boolean
  deal?: boolean
  maxPrice?: number
  minPrice?: number
  sort?: "featured" | "price-asc" | "price-desc" | "newest" | "rating"
  limit?: number
  offset?: number
  statusFilter?: "published" | "all"
}

function buildProductConditions(options: ProductQueryOptions) {
  // "preview_only" products can exist in the DB (visible in admin) but must never
  // appear as purchasable products on the public storefront.
  const conditions = options.statusFilter === "all" ? [] : [publiclyVisible()]

  if (options.search) {
    const term = `%${options.search.trim()}%`
    conditions.push(
      or(
        ilike(products.name, term),
        ilike(products.tagline, term),
        ilike(products.description, term),
        sql`exists (select 1 from unnest(${products.tags}) as tag where tag ilike ${term})`,
      )!,
    )
  }
  if (options.featured) conditions.push(eq(products.isFeatured, true))
  if (options.newRelease) conditions.push(eq(products.isNewRelease, true))
  if (options.free) conditions.push(eq(products.isFree, true))
  if (options.bundle) conditions.push(eq(products.isBundle, true))
  if (options.deal) conditions.push(sql`${products.compareAtPrice} is not null and ${products.compareAtPrice} > ${products.basePrice}`)

  return conditions
}

export async function getProductsCount(options: ProductQueryOptions = {}) {
  const conditions = buildProductConditions(options)
  if (options.categorySlug) {
    const { ids } = await getCategoryIdsForSlug(options.categorySlug)
    conditions.push(ids.length ? inArray(products.categoryId, ids) : sql`false`)
  }

  const rows = await db
    .select({ count: sql<number>`cast(count(*) as int)` })
    .from(products)
    .where(conditions.length ? and(...conditions) : undefined)

  // minPrice/maxPrice are applied in-memory on getProducts (startingPrice is
  // derived from license rows), so an exact count with those filters requires
  // fetching all matching rows. Fall back to the unfiltered count in that case.
  if (options.minPrice !== undefined || options.maxPrice !== undefined) {
    const all = await getProducts({ ...options, limit: 5000, offset: 0 })
    return all.length
  }

  return rows[0]?.count ?? 0
}

export async function getProducts(options: ProductQueryOptions = {}) {
  const conditions = buildProductConditions(options)

  if (options.categorySlug) {
    const { ids } = await getCategoryIdsForSlug(options.categorySlug)
    conditions.push(ids.length ? inArray(products.categoryId, ids) : sql`false`)
  }

  const ratingAverage = sql<number>`coalesce((select avg(${reviews.rating}) from ${reviews} where ${reviews.productId} = ${products.id}), 0)`
  const orderBy =
    options.sort === "newest"
      ? [desc(products.createdAt)]
      : options.sort === "price-asc" || options.sort === "price-desc"
        ? [asc(products.basePrice)]
        : options.sort === "rating"
          ? [desc(ratingAverage), desc(products.isFeatured), desc(products.createdAt)]
          : [desc(products.isFeatured), desc(products.createdAt)]

  const rows = await db
    .select({ product: products, category: categories })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(...orderBy)
    .limit(options.limit ?? 200)
    .offset(options.offset ?? 0)

  const withRelations = await attachRelations(rows.map((r) => r.product))
  const categoryById = new Map(rows.map((r) => [r.product.id, r.category]))

  let result = withRelations.map((item) => ({ ...item, category: categoryById.get(item.product.id)! }))

  if (options.minPrice !== undefined) result = result.filter((r) => r.startingPrice >= options.minPrice!)
  if (options.maxPrice !== undefined) result = result.filter((r) => r.startingPrice <= options.maxPrice!)

  if (options.sort === "price-asc") result = result.sort((a, b) => a.startingPrice - b.startingPrice)
  else if (options.sort === "price-desc") result = result.sort((a, b) => b.startingPrice - a.startingPrice)

  return result
}

export async function getProductsByIds(ids: number[]) {
  if (!ids.length) return []
  const rows = await db
    .select({ product: products, category: categories })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(inArray(products.id, ids))
  const withRelations = await attachRelations(rows.map((r) => r.product))
  const categoryById = new Map(rows.map((r) => [r.product.id, r.category]))
  return withRelations.map((item) => ({ ...item, category: categoryById.get(item.product.id)! }))
}

export async function getRecommendedProducts(categoryId: number, excludeProductId: number, limit = 8) {
  const rows = await db
    .select({ product: products, category: categories })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(
      and(eq(products.categoryId, categoryId), publiclyVisible(), sql`${products.id} != ${excludeProductId}`),
    )
    .orderBy(desc(products.isFeatured), desc(products.createdAt))
    .limit(limit)

  const withRelations = await attachRelations(rows.map((r) => r.product))
  const categoryById = new Map(rows.map((r) => [r.product.id, r.category]))
  return withRelations.map((item) => ({ ...item, category: categoryById.get(item.product.id)! }))
}

export const getRelatedProducts = getRecommendedProducts

export async function getFeaturedProducts(limit = 12) {
  return getProducts({ featured: true, limit })
}

export async function getNewReleases(limit = 12) {
  return getProducts({ newRelease: true, sort: "newest", limit })
}

export async function getFreeProducts(limit = 12) {
  return getProducts({ free: true, limit })
}

export async function getBundleProducts(limit = 12) {
  return getProducts({ bundle: true, limit })
}

export async function getUnderPriceProducts(maxPrice: number, limit = 12) {
  return getProducts({ maxPrice, sort: "price-asc", limit })
}

export async function getDealProducts(limit = 12) {
  return getProducts({ deal: true, sort: "featured", limit })
}

export async function getCatalogStats() {
  const [[productCount], [categoryCount], [reviewStats]] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(publiclyVisible()),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(categories)
      .where(sql`${categories.parentId} is not null`),
    db
      .select({ count: sql<number>`count(*)::int`, avgRating: sql<number>`coalesce(avg(${reviews.rating}), 0)` })
      .from(reviews),
  ])

  return {
    productCount: productCount?.count ?? 0,
    categoryCount: categoryCount?.count ?? 0,
    reviewCount: reviewStats?.count ?? 0,
    avgRating: Number(reviewStats?.avgRating ?? 0),
  }
}

export const getMarketplaceStats = getCatalogStats

export async function getTopReviews(limit = 8) {
  const rows = await db
    .select({ review: reviews, product: products, authorName: user.name })
    .from(reviews)
    .innerJoin(products, eq(reviews.productId, products.id))
    .innerJoin(user, eq(reviews.userId, user.id))
    .where(and(sql`${reviews.rating} >= 4`, sql`length(coalesce(${reviews.body}, '')) > 40`))
    .orderBy(desc(reviews.rating), desc(reviews.createdAt))
    .limit(limit)

  return rows.map((row) => ({ review: { ...row.review, authorName: row.authorName }, product: row.product }))
}

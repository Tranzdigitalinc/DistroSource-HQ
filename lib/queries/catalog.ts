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
      productCount: sql<number>`cast(count(${products.id}) as int)`,
    })
    .from(categories)
    .leftJoin(products, and(eq(products.categoryId, categories.id), eq(products.status, "published")))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder))
}

export async function getCategoryBySlug(slug: string) {
  const rows = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1)
  return rows[0] ?? null
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
  statusFilter?: "published" | "all"
}

export async function getProducts(options: ProductQueryOptions = {}) {
  const conditions = options.statusFilter === "all" ? [] : [eq(products.status, "published")]

  if (options.categorySlug) {
    const cat = await getCategoryBySlug(options.categorySlug)
    if (cat) conditions.push(eq(products.categoryId, cat.id))
  }
  if (options.search) {
    conditions.push(or(ilike(products.name, `%${options.search}%`), ilike(products.tagline, `%${options.search}%`))!)
  }
  if (options.featured) conditions.push(eq(products.isFeatured, true))
  if (options.newRelease) conditions.push(eq(products.isNewRelease, true))
  if (options.free) conditions.push(eq(products.isFree, true))
  if (options.bundle) conditions.push(eq(products.isBundle, true))
  if (options.deal) conditions.push(sql`${products.compareAtPrice} is not null and ${products.compareAtPrice} > ${products.basePrice}`)

  const orderBy =
    options.sort === "newest"
      ? [desc(products.createdAt)]
      : options.sort === "price-asc" || options.sort === "price-desc"
        ? [asc(products.basePrice)]
        : [desc(products.isFeatured), desc(products.createdAt)]

  const rows = await db
    .select({ product: products, category: categories })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(...orderBy)
    .limit(options.limit ?? 200)

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
    .where(and(eq(products.categoryId, categoryId), eq(products.status, "published"), sql`${products.id} != ${excludeProductId}`))
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
    db.select({ count: sql<number>`count(*)::int` }).from(products).where(eq(products.status, "published")),
    db.select({ count: sql<number>`count(*)::int` }).from(categories),
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

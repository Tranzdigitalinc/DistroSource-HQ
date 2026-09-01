import { db } from "@/lib/db"
import {
  brands,
  categories,
  countries,
  productVariants,
  products,
  reviews,
} from "@/lib/db/schema"
import { and, asc, desc, eq, ilike, inArray, or, sql } from "drizzle-orm"

export async function getCategories() {
  return db
    .select({
      id: categories.id,
      slug: categories.slug,
      name: categories.name,
      description: categories.description,
      iconName: categories.iconName,
      sortOrder: categories.sortOrder,
      productCount: sql<number>`cast(count(${products.id}) as int)`,
    })
    .from(categories)
    .leftJoin(products, eq(products.categoryId, categories.id))
    .groupBy(categories.id)
    .orderBy(asc(categories.sortOrder))
}

export async function getCategoryBySlug(slug: string) {
  const rows = await db.select().from(categories).where(eq(categories.slug, slug)).limit(1)
  return rows[0] ?? null
}

export async function getCountries() {
  return db.select().from(countries).orderBy(desc(countries.isPopular), asc(countries.name))
}

export async function getCountryByCode(code: string) {
  const rows = await db.select().from(countries).where(eq(countries.code, code)).limit(1)
  return rows[0] ?? null
}

export async function getBrands(options?: { categoryId?: number; featured?: boolean }) {
  const conditions = []
  if (options?.categoryId) conditions.push(eq(brands.categoryId, options.categoryId))
  if (options?.featured) conditions.push(eq(brands.isFeatured, true))
  return db
    .select()
    .from(brands)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(desc(brands.isFeatured), asc(brands.name))
}

export async function getBrandBySlug(slug: string) {
  const rows = await db.select().from(brands).where(eq(brands.slug, slug)).limit(1)
  return rows[0] ?? null
}

export type ProductWithRelations = Awaited<ReturnType<typeof getProductBySlug>>

export async function getProductBySlug(slug: string) {
  const rows = await db
    .select({
      product: products,
      brand: brands,
      category: categories,
      country: countries,
    })
    .from(products)
    .innerJoin(brands, eq(products.brandId, brands.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(countries, eq(products.countryId, countries.id))
    .where(eq(products.slug, slug))
    .limit(1)

  if (!rows[0]) return null

  const variants = await db
    .select()
    .from(productVariants)
    .where(eq(productVariants.productId, rows[0].product.id))
    .orderBy(asc(productVariants.sortOrder))

  const productReviews = await db
    .select()
    .from(reviews)
    .where(eq(reviews.productId, rows[0].product.id))
    .orderBy(desc(reviews.createdAt))
    .limit(20)

  return { ...rows[0], variants, reviews: productReviews }
}

interface ProductQueryOptions {
  categorySlug?: string
  brandSlug?: string
  countryCode?: string
  search?: string
  featured?: boolean
  deal?: boolean
  deliveryType?: string
  minDiscount?: number
  maxPrice?: number
  sort?: "popular" | "price-asc" | "price-desc" | "rating" | "newest" | "best-value"
  limit?: number
}

export async function getProducts(options: ProductQueryOptions = {}) {
  const conditions = []

  if (options.categorySlug) {
    const cat = await getCategoryBySlug(options.categorySlug)
    if (cat) conditions.push(eq(products.categoryId, cat.id))
  }
  if (options.brandSlug) {
    const brand = await getBrandBySlug(options.brandSlug)
    if (brand) conditions.push(eq(products.brandId, brand.id))
  }
  if (options.countryCode) {
    const country = await getCountryByCode(options.countryCode)
    if (country) conditions.push(eq(products.countryId, country.id))
  }
  if (options.search) {
    conditions.push(
      or(ilike(products.name, `%${options.search}%`), ilike(products.shortDescription, `%${options.search}%`)),
    )
  }
  if (options.featured) conditions.push(eq(products.isFeatured, true))
  if (options.deal) conditions.push(eq(products.isDeal, true))
  if (options.deliveryType) conditions.push(eq(products.deliveryType, options.deliveryType))

  const orderBy =
    options.sort === "rating"
      ? [desc(products.rating)]
      : options.sort === "newest"
        ? [desc(products.createdAt)]
        : [desc(products.salesCount)]

  const rows = await db
    .select({
      product: products,
      brand: brands,
      category: categories,
      country: countries,
    })
    .from(products)
    .innerJoin(brands, eq(products.brandId, brands.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(countries, eq(products.countryId, countries.id))
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(...orderBy)
    .limit(options.limit ?? 200)

  if (rows.length === 0) return []

  const productIds = rows.map((r) => r.product.id)
  const variantRows = await db
    .select()
    .from(productVariants)
    .where(inArray(productVariants.productId, productIds))
    .orderBy(asc(productVariants.sortOrder))

  const variantsByProduct = new Map<number, typeof variantRows>()
  for (const v of variantRows) {
    const list = variantsByProduct.get(v.productId) ?? []
    list.push(v)
    variantsByProduct.set(v.productId, list)
  }

  let result = rows.map((r) => ({
    ...r,
    variants: variantsByProduct.get(r.product.id) ?? [],
    minPrice: Math.min(...(variantsByProduct.get(r.product.id) ?? []).map((v) => Number.parseFloat(v.priceUsd))),
  })).filter((item) => {
    const maxDiscount = Math.max(0, ...item.variants.map((v) => Number(v.discountPercent)))
    return (options.maxPrice === undefined || item.minPrice <= options.maxPrice) && (options.minDiscount === undefined || maxDiscount >= options.minDiscount)
  })

  if (options.sort === "price-asc") {
    result = result.sort((a, b) => a.minPrice - b.minPrice)
  } else if (options.sort === "price-desc") {
    result = result.sort((a, b) => b.minPrice - a.minPrice)
  } else if (options.sort === "best-value") {
    result = result.sort((a, b) => {
      const aVariant = a.variants[0]
      const bVariant = b.variants[0]
      const aValue = aVariant ? Number(aVariant.discountPercent) + Number(a.product.rating) : 0
      const bValue = bVariant ? Number(bVariant.discountPercent) + Number(b.product.rating) : 0
      return bValue - aValue
    })
  }

  return result
}

export async function getProductsByIds(ids: number[]) {
  if (!ids.length) return []
  const rows = await db
    .select({ product: products, brand: brands, category: categories, country: countries })
    .from(products)
    .innerJoin(brands, eq(products.brandId, brands.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(countries, eq(products.countryId, countries.id))
    .where(inArray(products.id, ids))
  const variants = await db.select().from(productVariants).where(inArray(productVariants.productId, ids)).orderBy(asc(productVariants.sortOrder))
  return rows.map((row) => ({ ...row, variants: variants.filter((variant) => variant.productId === row.product.id) }))
}

export async function getRecommendedProducts(
  categoryId: number,
  brandId: number,
  excludeProductId: number,
  limit = 8,
  personalization?: { categoryIds: number[]; brandIds: number[] },
) {
  const categoryIds = Array.from(new Set([categoryId, ...(personalization?.categoryIds ?? [])]))
  const brandIds = Array.from(new Set([brandId, ...(personalization?.brandIds ?? [])]))

  const rows = await db
    .select({ product: products, brand: brands, category: categories, country: countries })
    .from(products)
    .innerJoin(brands, eq(products.brandId, brands.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(countries, eq(products.countryId, countries.id))
    .where(and(or(inArray(products.brandId, brandIds), inArray(products.categoryId, categoryIds)), sql`${products.id} != ${excludeProductId}`))
    .orderBy(desc(products.isFeatured), desc(products.salesCount), desc(products.rating))
    .limit(limit)

  const ids = rows.map((row) => row.product.id)
  const variantRows = ids.length ? await db.select().from(productVariants).where(inArray(productVariants.productId, ids)) : []
  return rows.map((row) => ({ ...row, variants: variantRows.filter((variant) => variant.productId === row.product.id) }))
}

export async function getFeaturedProducts(limit = 12) {
  return getProducts({ featured: true, limit })
}

export async function getDealProducts(limit = 12) {
  return getProducts({ deal: true, sort: "price-asc", limit })
}

export async function getMarketplaceStats() {
  const [[productCount], [brandCount], [countryCount], [reviewStats]] = await Promise.all([
    db.select({ count: sql<number>`count(*)::int` }).from(products),
    db.select({ count: sql<number>`count(*)::int` }).from(brands),
    db.select({ count: sql<number>`count(*)::int` }).from(countries),
    db
      .select({
        count: sql<number>`count(*)::int`,
        avgRating: sql<number>`coalesce(avg(${reviews.rating}), 0)`,
      })
      .from(reviews),
  ])

  return {
    productCount: productCount?.count ?? 0,
    brandCount: brandCount?.count ?? 0,
    countryCount: countryCount?.count ?? 0,
    reviewCount: reviewStats?.count ?? 0,
    avgRating: Number(reviewStats?.avgRating ?? 0),
  }
}

export async function getTopReviews(limit = 8) {
  const rows = await db
    .select({
      review: reviews,
      product: products,
      brand: brands,
    })
    .from(reviews)
    .innerJoin(products, eq(reviews.productId, products.id))
    .innerJoin(brands, eq(products.brandId, brands.id))
    .where(
      and(eq(reviews.isVerifiedPurchase, true), sql`${reviews.rating} >= 4`, sql`length(${reviews.body}) > 40`),
    )
    .orderBy(desc(reviews.rating), desc(reviews.createdAt))
    .limit(limit)

  return rows
}

export async function getRelatedProducts(categoryId: number, excludeProductId: number, limit = 8) {
  const rows = await db
    .select({
      product: products,
      brand: brands,
      category: categories,
      country: countries,
    })
    .from(products)
    .innerJoin(brands, eq(products.brandId, brands.id))
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .leftJoin(countries, eq(products.countryId, countries.id))
    .where(and(eq(products.categoryId, categoryId), sql`${products.id} != ${excludeProductId}`))
    .orderBy(desc(products.salesCount))
    .limit(limit)

  const productIds = rows.map((r) => r.product.id)
  const variantRows = productIds.length
    ? await db.select().from(productVariants).where(inArray(productVariants.productId, productIds))
    : []
  const variantsByProduct = new Map<number, typeof variantRows>()
  for (const v of variantRows) {
    const list = variantsByProduct.get(v.productId) ?? []
    list.push(v)
    variantsByProduct.set(v.productId, list)
  }

  return rows.map((r) => ({ ...r, variants: variantsByProduct.get(r.product.id) ?? [] }))
}

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
  return db.select().from(categories).orderBy(asc(categories.sortOrder))
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
  sort?: "popular" | "price-asc" | "price-desc" | "rating" | "newest"
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
  }))

  if (options.sort === "price-asc") {
    result = result.sort((a, b) => a.minPrice - b.minPrice)
  } else if (options.sort === "price-desc") {
    result = result.sort((a, b) => b.minPrice - a.minPrice)
  }

  return result
}

export async function getFeaturedProducts(limit = 12) {
  return getProducts({ featured: true, limit })
}

export async function getDealProducts(limit = 12) {
  return getProducts({ deal: true, sort: "price-asc", limit })
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

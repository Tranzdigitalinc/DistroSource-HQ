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

/**
 * A few real product thumbnails per department, keyed by department id.
 *
 * The homepage department cards used to be typographic art with no
 * connection to stock. Showing what is actually inside a department is both
 * better merchandising and self-correcting: a department with nothing
 * published simply has no images to show.
 *
 * One query over the visible catalog (a few hundred rows), grouped in memory,
 * and cached with the rest of the homepage.
 */
export async function getDepartmentPreviews(perDepartment = 3) {
  const rows = await db
    .select({
      departmentId: categories.parentId,
      thumbnailUrl: products.thumbnailUrl,
      coverImageUrl: products.coverImageUrl,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(and(publiclyVisible(), sql`${categories.parentId} is not null`))
    .orderBy(desc(products.isFeatured), desc(products.createdAt))

  // A plain object rather than a Map: the homepage passes this through
  // unstable_cache, which serialises to JSON — a Map would come back as {}.
  const byDepartment: Record<number, string[]> = {}
  for (const row of rows) {
    if (row.departmentId === null) continue
    const image = row.thumbnailUrl ?? row.coverImageUrl
    if (!image) continue
    const list = (byDepartment[row.departmentId] ??= [])
    if (list.length < perDepartment) list.push(image)
  }
  return byDepartment
}

/** id → name for a set of category ids (library, order pages). */
export async function getCategoryNamesByIds(ids: number[]) {
  const unique = [...new Set(ids)]
  if (unique.length === 0) return new Map<number, string>()
  const rows = await db.select({ id: categories.id, name: categories.name }).from(categories).where(inArray(categories.id, unique))
  return new Map(rows.map((r) => [r.id, r.name]))
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
  // productCount lets the nav skip empty siblings instead of linking to a
  // page that renders "0 products".
  const subcategories = await db
    .select({
      id: categories.id,
      slug: categories.slug,
      name: categories.name,
      productCount: sql<number>`cast(count(${products.id}) as int)`,
    })
    .from(categories)
    .leftJoin(products, and(eq(products.categoryId, categories.id), publiclyVisible()))
    .where(eq(categories.parentId, departmentId))
    .groupBy(categories.id)
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

// Every product's category is a subcategory (see note above), so cards and
// list pages that want to show the full "Department / Subcategory" chain
// need the parent department's name too. Looks it up in one extra query
// against the (tiny) categories table rather than a self-join everywhere.
async function attachDepartments<T extends { category: typeof categories.$inferSelect }>(
  rows: T[],
): Promise<(T & { department: { slug: string; name: string } | null })[]> {
  const departmentIds = [...new Set(rows.map((r) => r.category.parentId).filter((id): id is number => id !== null))]
  if (departmentIds.length === 0) return rows.map((r) => ({ ...r, department: null }))

  const departmentRows = await db
    .select({ id: categories.id, slug: categories.slug, name: categories.name })
    .from(categories)
    .where(inArray(categories.id, departmentIds))
  const byId = new Map(departmentRows.map((d) => [d.id, { slug: d.slug, name: d.name }]))

  return rows.map((r) => ({ ...r, department: r.category.parentId ? byId.get(r.category.parentId) ?? null : null }))
}

// Distinct file formats across the published catalog, ranked by how many
// products carry each one — powers the "Format" catalog filter.
export async function getAvailableFileFormats(limit = 14) {
  const rows = await db.select({ fileFormats: products.fileFormats }).from(products).where(publiclyVisible())
  const counts = new Map<string, number>()
  for (const row of rows) {
    for (const format of row.fileFormats) {
      counts.set(format, (counts.get(format) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .map(([format, count]) => ({ format, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

/** Software names with visible-product counts, for the catalog filter. */
export async function getAvailableSoftware(limit = 12) {
  const rows = await db.select({ software: products.softwareCompatibility }).from(products).where(publiclyVisible())
  const counts = new Map<string, number>()
  for (const row of rows) for (const name of row.software) counts.set(name, (counts.get(name) ?? 0) + 1)
  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

/** Source types and licence tiers actually present on visible products. */
export async function getCatalogFacets() {
  const [sources, licenses] = await Promise.all([
    db
      .select({ value: products.sourceType, count: sql<number>`count(*)::int` })
      .from(products)
      .where(publiclyVisible())
      .groupBy(products.sourceType),
    db
      .select({ value: productLicenses.licenseType, count: sql<number>`count(distinct ${products.id})::int` })
      .from(productLicenses)
      .innerJoin(products, eq(productLicenses.productId, products.id))
      .where(publiclyVisible())
      .groupBy(productLicenses.licenseType),
  ])
  return { sources, licenses }
}

async function attachRelations(productRows: (typeof products.$inferSelect)[]) {
  if (productRows.length === 0) return []
  const ids = productRows.map((p) => p.id)

  const [images, licenses, reviewStatsRows] = await Promise.all([
    db.select().from(productImages).where(inArray(productImages.productId, ids)).orderBy(asc(productImages.sortOrder)),
    db.select().from(productLicenses).where(inArray(productLicenses.productId, ids)).orderBy(asc(productLicenses.sortOrder)),
    db
      .select({
        productId: reviews.productId,
        avgRating: sql<number>`avg(${reviews.rating})`,
        count: sql<number>`count(*)::int`,
      })
      .from(reviews)
      .where(inArray(reviews.productId, ids))
      .groupBy(reviews.productId),
  ])
  const reviewStatsByProduct = new Map(reviewStatsRows.map((r) => [r.productId, { avgRating: Number(r.avgRating), count: r.count }]))

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
    const reviewStats = reviewStatsByProduct.get(product.id)
    return {
      product,
      images: imagesByProduct.get(product.id) ?? [],
      licenses: productLicensesList,
      startingPrice,
      avgRating: reviewStats?.avgRating ?? 0,
      reviewCount: reviewStats?.count ?? 0,
    }
  })
}

export type ProductWithRelations = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>

export async function getProductBySlug(slug: string) {
  const rows = await db
    .select({ product: products, category: categories })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    // Gated: without this, a draft / rights-rejected / preview-only product
    // stays fully readable at its public slug URL. The product page only
    // disabled the buy button for these, which hides the purchase path but
    // not the listing itself.
    .where(and(eq(products.slug, slug), publiclyVisible()))
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

export type ProductSort = "featured" | "price-asc" | "price-desc" | "newest" | "rating"

const PRODUCT_SORTS: readonly ProductSort[] = ["featured", "price-asc", "price-desc", "newest", "rating"]

/** Narrow an arbitrary query-string value to a supported sort, defaulting to "featured". */
export function parseProductSort(value: string | undefined): ProductSort {
  return (PRODUCT_SORTS as readonly string[]).includes(value ?? "") ? (value as ProductSort) : "featured"
}

interface ProductQueryOptions {
  categorySlug?: string
  search?: string
  featured?: boolean
  newRelease?: boolean
  free?: boolean
  bundle?: boolean
  deal?: boolean
  format?: string
  /** Exact match against products.softwareCompatibility, e.g. "Figma". */
  software?: string
  /** products.sourceType, e.g. "distrosource_original". */
  source?: string
  /** A licence tier the product offers, e.g. "commercial". */
  license?: string
  maxPrice?: number
  minPrice?: number
  minRating?: number
  sort?: ProductSort
  limit?: number
  offset?: number
  statusFilter?: "published" | "all"
}

function buildProductConditions(options: ProductQueryOptions) {
  // "preview_only" products can exist in the DB (visible in admin) but must never
  // appear as purchasable products on the public storefront.
  const conditions = options.statusFilter === "all" ? [] : [publiclyVisible()]

  if (options.search) {
    const raw = options.search.trim()
    const term = `%${raw}%`
    conditions.push(
      or(
        ilike(products.name, term),
        ilike(products.tagline, term),
        ilike(products.description, term),
        sql`exists (select 1 from unnest(${products.tags}) as tag where tag ilike ${term})`,
        sql`exists (select 1 from unnest(${products.searchKeywords}) as kw where kw ilike ${term})`,
        // word_similarity finds the best-matching word/phrase *within* the longer name or
        // tagline, so typos like "tempalte" still surface "Annual Report Template" even
        // though a plain-similarity comparison against the whole string would be diluted.
        sql`word_similarity(${raw}, ${products.name}) > 0.4`,
        sql`word_similarity(${raw}, coalesce(${products.tagline}, '')) > 0.4`,
      )!,
    )
  }
  if (options.featured) conditions.push(eq(products.isFeatured, true))
  if (options.newRelease) conditions.push(eq(products.isNewRelease, true))
  if (options.free) conditions.push(eq(products.isFree, true))
  if (options.bundle) conditions.push(eq(products.isBundle, true))
  if (options.deal) conditions.push(sql`${products.compareAtPrice} is not null and ${products.compareAtPrice} > ${products.basePrice}`)
  if (options.format) {
    conditions.push(sql`exists (select 1 from unnest(${products.fileFormats}) as fmt where fmt = ${options.format})`)
  }
  if (options.software) {
    conditions.push(sql`exists (select 1 from unnest(${products.softwareCompatibility}) as sw where sw = ${options.software})`)
  }
  if (options.source) conditions.push(eq(products.sourceType, options.source))
  if (options.license) {
    conditions.push(
      sql`exists (select 1 from ${productLicenses} where ${productLicenses.productId} = ${products.id} and ${productLicenses.licenseType} = ${options.license})`,
    )
  }
  if (options.minRating) {
    conditions.push(
      sql`(select coalesce(avg(${reviews.rating}), 0) from ${reviews} where ${reviews.productId} = ${products.id}) >= ${options.minRating}`,
    )
  }

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
  // When the caller searched by keyword and didn't ask for an explicit sort,
  // rank the closest name/tagline matches first instead of falling back to
  // the generic "featured" ordering.
  const searchRelevance = options.search
    ? sql<number>`greatest(word_similarity(${options.search.trim()}, ${products.name}), word_similarity(${options.search.trim()}, coalesce(${products.tagline}, '')) * 0.6)`
    : null
  const orderBy =
    options.sort === "newest"
      ? [desc(products.createdAt)]
      : options.sort === "price-asc" || options.sort === "price-desc"
        ? [asc(products.basePrice)]
        : options.sort === "rating"
          ? [desc(ratingAverage), desc(products.isFeatured), desc(products.createdAt)]
          : searchRelevance
            ? [desc(searchRelevance), desc(products.isFeatured), desc(products.createdAt)]
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

  return attachDepartments(result)
}

// Powers the header's predictive search dropdown: a small, fast, typo-tolerant
// lookup across both categories and products, categorized for display. Uses
// pg_trgm word_similarity (see the products_name_trgm_idx / products_tagline_trgm_idx /
// categories_name_trgm_idx indexes) so misspellings like "tempalte" still surface
// "Templates" even when they're a substring of a longer name.
export async function getSearchSuggestions(query: string, limit = 6) {
  const raw = query.trim()
  if (raw.length < 2) return { categories: [], products: [] }
  const term = `%${raw}%`

  const categoryRows = await db
    .select({
      id: categories.id,
      slug: categories.slug,
      name: categories.name,
      parentId: categories.parentId,
      relevance: sql<number>`word_similarity(${raw}, ${categories.name})`,
    })
    .from(categories)
    .where(or(ilike(categories.name, term), sql`word_similarity(${raw}, ${categories.name}) > 0.4`)!)
    .orderBy(desc(sql`word_similarity(${raw}, ${categories.name})`))
    .limit(4)

  const departmentIds = [...new Set(categoryRows.map((c) => c.parentId).filter((id): id is number => id !== null))]
  const departmentNameById = departmentIds.length
    ? new Map(
        (
          await db
            .select({ id: categories.id, name: categories.name })
            .from(categories)
            .where(inArray(categories.id, departmentIds))
        ).map((d) => [d.id, d.name]),
      )
    : new Map<number, string>()

  const productRows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      thumbnailUrl: products.thumbnailUrl,
      coverImageUrl: products.coverImageUrl,
      basePrice: products.basePrice,
      compareAtPrice: products.compareAtPrice,
      isFree: products.isFree,
      fileFormats: products.fileFormats,
      categoryName: categories.name,
      relevance: sql<number>`greatest(word_similarity(${raw}, ${products.name}), word_similarity(${raw}, coalesce(${products.tagline}, '')) * 0.6)`,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .where(
      and(
        publiclyVisible(),
        or(
          ilike(products.name, term),
          ilike(products.tagline, term),
          sql`word_similarity(${raw}, ${products.name}) > 0.4`,
          sql`word_similarity(${raw}, coalesce(${products.tagline}, '')) > 0.4`,
        )!,
      )!,
    )
    .orderBy(desc(sql`greatest(word_similarity(${raw}, ${products.name}), word_similarity(${raw}, coalesce(${products.tagline}, '')) * 0.6)`))
    .limit(limit)

  return {
    categories: categoryRows.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      department: c.parentId ? departmentNameById.get(c.parentId) ?? null : null,
      isDepartment: c.parentId === null,
    })),
    products: productRows.map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      image: p.thumbnailUrl ?? p.coverImageUrl ?? null,
      categoryName: p.categoryName,
      isFree: p.isFree,
      price: p.basePrice,
      compareAtPrice: p.compareAtPrice,
    })),
  }
}

export async function getProductsByIds(ids: number[]) {
  if (!ids.length) return []
  const rows = await db
    .select({ product: products, category: categories })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    // Gated: ids arrive straight from the query string on /compare and from
    // wishlist rows, either of which can reference a product that has since
    // been unpublished, had its rights revoked, or lost its assets. Without
    // this filter those products stay publicly viewable by direct id.
    .where(and(inArray(products.id, ids), publiclyVisible()))
  const withRelations = await attachRelations(rows.map((r) => r.product))
  const categoryById = new Map(rows.map((r) => [r.product.id, r.category]))
  return attachDepartments(withRelations.map((item) => ({ ...item, category: categoryById.get(item.product.id)! })))
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
  return attachDepartments(withRelations.map((item) => ({ ...item, category: categoryById.get(item.product.id)! })))
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
    // Per-type counts use the same predicates as getProducts()' free/bundle/
    // deal options, so a filter is offered only when it would return rows.
    db
      .select({
        count: sql<number>`count(*)::int`,
        freeCount: sql<number>`count(*) filter (where ${products.isFree})::int`,
        bundleCount: sql<number>`count(*) filter (where ${products.isBundle})::int`,
        dealCount: sql<number>`count(*) filter (where ${products.compareAtPrice} is not null and ${products.compareAtPrice} > ${products.basePrice})::int`,
      })
      .from(products)
      .where(publiclyVisible()),
    // Only categories that actually hold a publicly visible product. Counting
    // every subcategory row would advertise shelves that are still empty.
    db
      .select({ count: sql<number>`count(distinct ${products.categoryId})::int` })
      .from(products)
      .where(publiclyVisible()),
    db
      .select({ count: sql<number>`count(*)::int`, avgRating: sql<number>`coalesce(avg(${reviews.rating}), 0)` })
      .from(reviews),
  ])

  return {
    productCount: productCount?.count ?? 0,
    freeCount: productCount?.freeCount ?? 0,
    bundleCount: productCount?.bundleCount ?? 0,
    dealCount: productCount?.dealCount ?? 0,
    categoryCount: categoryCount?.count ?? 0,
    reviewCount: reviewStats?.count ?? 0,
    avgRating: Number(reviewStats?.avgRating ?? 0),
  }
}

export const getStorefrontStats = getCatalogStats

export async function getTopReviews(limit = 8) {
  const rows = await db
    .select({ review: reviews, product: products, authorName: user.name })
    .from(reviews)
    .innerJoin(products, eq(reviews.productId, products.id))
    .innerJoin(user, eq(reviews.userId, user.id))
    // Reviews may only be surfaced for products that are themselves publicly
    // visible — otherwise a testimonial can outlive the listing it describes.
    .where(and(sql`${reviews.rating} >= 4`, sql`length(coalesce(${reviews.body}, '')) > 40`, publiclyVisible()))
    .orderBy(desc(reviews.rating), desc(reviews.createdAt))
    .limit(limit)

  return rows.map((row) => ({ review: { ...row.review, authorName: row.authorName }, product: row.product }))
}

import { GAMING_PRODUCTS } from "@/lib/gaming/products"
import {
  GAMING_PRICE_BANDS,
  type GamingCategory,
  type GamingPlatform,
  type GamingProduct,
  type GamingSort,
} from "@/lib/gaming/types"

/** Only published products are ever returned to the storefront. */
const published = () => GAMING_PRODUCTS.filter((p) => p.published)

export function getGamingProducts(): GamingProduct[] {
  return published()
}

export function getGamingProductBySlug(slug: string): GamingProduct | null {
  return published().find((p) => p.slug === slug) ?? null
}

export function getGamingProductSlugs(): string[] {
  return published().map((p) => p.slug)
}

export interface GamingQuery {
  platform?: GamingPlatform
  category?: GamingCategory
  price?: string
  sort?: GamingSort
  q?: string
}

/** Narrows an arbitrary query-string value to a supported sort. */
export function parseGamingSort(value: string | undefined): GamingSort {
  const allowed: GamingSort[] = ["featured", "newest", "price-asc", "price-desc", "popular"]
  return allowed.includes(value as GamingSort) ? (value as GamingSort) : "featured"
}

export function filterGamingProducts({ platform, category, price, sort = "featured", q }: GamingQuery): GamingProduct[] {
  let rows = published()

  if (platform) rows = rows.filter((p) => p.platform === platform)
  if (category) rows = rows.filter((p) => p.category === category)

  if (price) {
    const band = GAMING_PRICE_BANDS.find((b) => b.id === price)
    if (band) rows = rows.filter((p) => p.price >= band.min && p.price < band.max)
  }

  if (q?.trim()) {
    const term = q.trim().toLowerCase()
    rows = rows.filter((p) =>
      [p.title, p.shortDescription, p.subcategory, ...p.tags].some((field) => field.toLowerCase().includes(term)),
    )
  }

  const sorted = [...rows]
  switch (sort) {
    case "newest":
      sorted.sort((a, b) => b.releasedAt.localeCompare(a.releasedAt))
      break
    case "price-asc":
      sorted.sort((a, b) => a.price - b.price)
      break
    case "price-desc":
      sorted.sort((a, b) => b.price - a.price)
      break
    case "popular":
      // No sales data exists yet, so "popular" is an editorial flag rather
      // than a measured ranking — never presented as a sales figure.
      sorted.sort((a, b) => Number(b.popular) - Number(a.popular) || Number(b.bestseller) - Number(a.bestseller))
      break
    default:
      sorted.sort(
        (a, b) =>
          Number(b.featured) - Number(a.featured) ||
          Number(b.bestseller) - Number(a.bestseller) ||
          b.releasedAt.localeCompare(a.releasedAt),
      )
  }
  return sorted
}

export function getFeaturedGamingProducts(limit = 4): GamingProduct[] {
  return filterGamingProducts({ sort: "featured" }).slice(0, limit)
}

export function getGamingProductsByPlatform(platform: GamingPlatform, limit?: number): GamingProduct[] {
  const rows = filterGamingProducts({ platform })
  return limit ? rows.slice(0, limit) : rows
}

/** Products in the same platform, excluding the one being viewed. */
export function getRelatedGamingProducts(product: GamingProduct, limit = 4): GamingProduct[] {
  const sameCategory = published().filter((p) => p.slug !== product.slug && p.platform === product.platform && p.category === product.category)
  const samePlatform = published().filter((p) => p.slug !== product.slug && p.platform === product.platform && p.category !== product.category)
  return [...sameCategory, ...samePlatform].slice(0, limit)
}

/** Counts per platform and per category, for filter labels that mean something. */
export function getGamingFacets(scope: { platform?: GamingPlatform } = {}) {
  const rows = scope.platform ? published().filter((p) => p.platform === scope.platform) : published()
  const platforms: Record<string, number> = {}
  const categories: Record<string, number> = {}
  const prices: Record<string, number> = {}

  for (const p of published()) platforms[p.platform] = (platforms[p.platform] ?? 0) + 1
  for (const p of rows) categories[p.category] = (categories[p.category] ?? 0) + 1
  for (const p of rows) {
    const band = GAMING_PRICE_BANDS.find((b) => p.price >= b.min && p.price < b.max)
    if (band) prices[band.id] = (prices[band.id] ?? 0) + 1
  }
  return { platforms, categories, prices, total: rows.length }
}

const DAY = 24 * 60 * 60 * 1000

/**
 * Badges are derived from real dates and editorial flags — there is no
 * ratings or sales data behind them, so nothing here claims a number.
 * Capped at two so a card never turns into a badge wall.
 */
export function getGamingBadges(product: GamingProduct, now = Date.now()): string[] {
  const badges: string[] = []
  const isNew = now - new Date(product.releasedAt).getTime() < 60 * DAY
  const isUpdated = !isNew && now - new Date(product.lastUpdated).getTime() < 45 * DAY

  if (isNew) badges.push("New")
  if (product.bestseller) badges.push("Bestseller")
  if (isUpdated) badges.push("Updated")
  if (product.popular) badges.push("Popular")
  return badges.slice(0, 2)
}

/** Feeds the global storefront search; results are badged as Gaming. */
export function searchGamingProducts(query: string, limit = 4) {
  const term = query.trim().toLowerCase()
  if (term.length < 2) return []
  return published()
    .filter((p) => [p.title, p.shortDescription, p.subcategory, ...p.tags].some((f) => f.toLowerCase().includes(term)))
    .slice(0, limit)
}

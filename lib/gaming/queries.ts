import { GAMING_CATALOG } from "@/lib/gaming/catalog/products"
import { listPrice } from "@/lib/gaming/catalog/pricing"
import {
  FRAMEWORK_LABEL,
  FRAMEWORK_ORDER,
  GAMING_PLATFORMS,
  GAMING_PRICE_BANDS,
  GAMING_SORTS,
  PLATFORM_BY_ID,
  SUBSCRIPTION_MODELS,
  categoryLabel,
  type GamingPriceBand,
  type GamingSort,
} from "@/lib/gaming/catalog/taxonomy"
import type { GamingFramework, GamingPlatform, GamingProduct, GamingSubscriptionModel } from "@/lib/gaming/catalog/types"

/**
 * Storefront accessors for the Gaming catalogue.
 *
 * Only listed products (`on-sale` or `launching`) are ever returned. There
 * is no popularity or bestseller logic: no sales data exists, so none is
 * implied. "Featured" is the explicit editorial `curation` order.
 */

const listed = (): GamingProduct[] => GAMING_CATALOG.filter((p) => p.availability !== "unlisted")

export function getGamingProducts(): GamingProduct[] {
  return listed()
}

export function getGamingProductBySlug(slug: string): GamingProduct | null {
  return listed().find((p) => p.slug === slug) ?? null
}

export function getGamingProductSlugs(): string[] {
  return listed().map((p) => p.slug)
}

/* ------------------------------------------------------------------ */
/* Query parsing                                                       */
/* ------------------------------------------------------------------ */

export type GamingKind = "one-time" | "subscription"

export interface GamingQuery {
  platform?: GamingPlatform
  category?: string
  framework?: GamingFramework
  kind?: GamingKind
  model?: GamingSubscriptionModel
  price?: GamingPriceBand
  sort: GamingSort
  q?: string
}

type RawParams = Record<string, string | string[] | undefined>

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v)?.trim() || undefined

/** Narrows untrusted URL parameters to supported values. Anything unknown is dropped. */
export function parseGamingQuery(params: RawParams, fixed: Partial<GamingQuery> = {}): GamingQuery {
  const platformRaw = fixed.platform ?? first(params.platform)
  const platform = GAMING_PLATFORMS.some((p) => p.id === platformRaw) ? (platformRaw as GamingPlatform) : undefined
  const categoryRaw = first(params.category)
  const category =
    platform && PLATFORM_BY_ID[platform].categories.some((c) => c.id === categoryRaw) ? categoryRaw : undefined
  const frameworkRaw = first(params.framework)
  const framework = FRAMEWORK_ORDER.includes(frameworkRaw as GamingFramework) ? (frameworkRaw as GamingFramework) : undefined
  const kindRaw = fixed.kind ?? first(params.kind)
  const kind = kindRaw === "one-time" || kindRaw === "subscription" ? kindRaw : undefined
  const modelRaw = first(params.model)
  const model = modelRaw && modelRaw in SUBSCRIPTION_MODELS ? (modelRaw as GamingSubscriptionModel) : undefined
  const priceRaw = first(params.price)
  const price = GAMING_PRICE_BANDS.some((b) => b.id === priceRaw) ? (priceRaw as GamingPriceBand) : undefined
  const sortRaw = first(params.sort)
  const sort = GAMING_SORTS.some((s) => s.id === sortRaw) ? (sortRaw as GamingSort) : "featured"
  const q = first(params.q)?.slice(0, 80)
  return { platform, category, framework, kind, model, price, sort, q }
}

/* ------------------------------------------------------------------ */
/* Matching                                                            */
/* ------------------------------------------------------------------ */

function haystack(p: GamingProduct): string {
  return [
    p.title,
    p.summary,
    PLATFORM_BY_ID[p.platform].label,
    categoryLabel(p.platform, p.category),
    ...p.tags,
    ...p.frameworks.map((f) => FRAMEWORK_LABEL[f]),
    ...p.models.map((m) => SUBSCRIPTION_MODELS[m].label),
    ...(p.searchTerms ?? []),
  ]
    .join(" ")
    .toLowerCase()
}

/** Every word of the query must appear somewhere in the searchable fields. */
function matchesText(p: GamingProduct, q: string): boolean {
  const words = q.toLowerCase().split(/\s+/).filter(Boolean)
  if (words.length === 0) return true
  const text = haystack(p)
  return words.every((w) => text.includes(w))
}

type FacetKey = "platform" | "category" | "framework" | "kind" | "model" | "price"

function matches(p: GamingProduct, q: GamingQuery, skip?: FacetKey): boolean {
  if (skip !== "platform" && q.platform && p.platform !== q.platform) return false
  if (skip !== "category" && q.category && p.category !== q.category) return false
  if (skip !== "framework" && q.framework && !p.frameworks.includes(q.framework)) return false
  if (skip !== "kind" && q.kind && p.pricing.kind !== q.kind) return false
  if (skip !== "model" && q.model && !p.models.includes(q.model)) return false
  if (skip !== "price" && q.price) {
    const band = GAMING_PRICE_BANDS.find((b) => b.id === q.price)
    const value = listPrice(p.pricing)
    if (band && !(value >= band.min && value < band.max)) return false
  }
  if (q.q && !matchesText(p, q.q)) return false
  return true
}

function sortProducts(rows: GamingProduct[], sort: GamingSort): GamingProduct[] {
  const out = [...rows]
  const byCuration = (a: GamingProduct, b: GamingProduct) => a.curation - b.curation
  switch (sort) {
    case "newest":
      return out.sort((a, b) => b.releasedAt.localeCompare(a.releasedAt) || byCuration(a, b))
    case "price-asc":
      return out.sort((a, b) => listPrice(a.pricing) - listPrice(b.pricing) || byCuration(a, b))
    case "price-desc":
      return out.sort((a, b) => listPrice(b.pricing) - listPrice(a.pricing) || byCuration(a, b))
    default:
      return out.sort(byCuration)
  }
}

export function filterGamingProducts(query: Partial<GamingQuery>): GamingProduct[] {
  const q: GamingQuery = { sort: "featured", ...query }
  return sortProducts(listed().filter((p) => matches(p, q)), q.sort)
}

/* ------------------------------------------------------------------ */
/* Facets                                                              */
/* ------------------------------------------------------------------ */

export interface GamingFacetOption {
  id: string
  label: string
  count: number
}

export interface GamingFacets {
  platforms: GamingFacetOption[]
  categories: GamingFacetOption[]
  frameworks: GamingFacetOption[]
  kinds: GamingFacetOption[]
  models: GamingFacetOption[]
  prices: GamingFacetOption[]
}

/**
 * Options and counts for every filter. Each dimension is counted against the
 * other active filters, and options with no products are dropped, so the
 * storefront never offers a filter value that leads nowhere.
 */
export function getGamingFacets(query: GamingQuery): GamingFacets {
  const all = listed()
  const count = (skip: FacetKey, test: (p: GamingProduct) => boolean) => all.filter((p) => matches(p, query, skip) && test(p)).length
  const keep = (options: GamingFacetOption[]) => options.filter((o) => o.count > 0)

  const platforms = keep(GAMING_PLATFORMS.map((p) => ({ id: p.id, label: p.label, count: count("platform", (x) => x.platform === p.id) })))
  const categories = query.platform
    ? keep(
        PLATFORM_BY_ID[query.platform].categories.map((c) => ({
          id: c.id,
          label: c.label,
          count: count("category", (x) => x.platform === query.platform && x.category === c.id),
        })),
      )
    : []
  const frameworks = keep(FRAMEWORK_ORDER.map((f) => ({ id: f, label: FRAMEWORK_LABEL[f], count: count("framework", (x) => x.frameworks.includes(f)) })))
  const kinds = keep([
    { id: "subscription", label: "Subscription", count: count("kind", (x) => x.pricing.kind === "subscription") },
    { id: "one-time", label: "One-time", count: count("kind", (x) => x.pricing.kind === "one-time") },
  ])
  const models = keep(
    (Object.keys(SUBSCRIPTION_MODELS) as GamingSubscriptionModel[]).map((m) => ({
      id: m,
      label: SUBSCRIPTION_MODELS[m].label,
      count: count("model", (x) => x.models.includes(m)),
    })),
  )
  const prices = keep(
    GAMING_PRICE_BANDS.map((b) => ({
      id: b.id,
      label: b.label,
      count: count("price", (x) => {
        const v = listPrice(x.pricing)
        return v >= b.min && v < b.max
      }),
    })),
  )
  return { platforms, categories, frameworks, kinds, models, prices }
}

/* ------------------------------------------------------------------ */
/* Collections                                                         */
/* ------------------------------------------------------------------ */

export function getFeaturedGamingProducts(limit = 4): GamingProduct[] {
  return filterGamingProducts({ sort: "featured" }).slice(0, limit)
}

export function getGamingProductsByPlatform(platform: GamingPlatform, limit?: number): GamingProduct[] {
  const rows = filterGamingProducts({ platform })
  return limit ? rows.slice(0, limit) : rows
}

/** Same category first, then same platform, then other recurring plans. */
export function getRelatedGamingProducts(product: GamingProduct, limit = 4): GamingProduct[] {
  const others = sortProducts(listed().filter((p) => p.slug !== product.slug), "featured")
  const tiers = [
    others.filter((p) => p.platform === product.platform && p.category === product.category),
    others.filter((p) => p.platform === product.platform && p.category !== product.category),
    others.filter((p) => p.platform !== product.platform && p.pricing.kind === product.pricing.kind),
    others,
  ]
  const seen = new Set<string>()
  const out: GamingProduct[] = []
  for (const tier of tiers) {
    for (const p of tier) {
      if (out.length >= limit) return out
      if (!seen.has(p.slug)) {
        seen.add(p.slug)
        out.push(p)
      }
    }
  }
  return out
}

/** Platforms that currently have listed products, in taxonomy order. */
export function getGamingPlatformsInUse(): { id: GamingPlatform; label: string; blurb: string; count: number }[] {
  const all = listed()
  return GAMING_PLATFORMS.map((p) => ({ id: p.id, label: p.label, blurb: p.blurb, count: all.filter((x) => x.platform === p.id).length })).filter(
    (p) => p.count > 0,
  )
}

/** Feeds the global storefront search; results are badged as Gaming. */
export function searchGamingProducts(query: string, limit = 4): GamingProduct[] {
  const term = query.trim()
  if (term.length < 2) return []
  return sortProducts(listed().filter((p) => matchesText(p, term)), "featured").slice(0, limit)
}

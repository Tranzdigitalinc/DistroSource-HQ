// Server-only client for the Envato Market API.
// Docs: https://build.envato.com/api/
// Used to search Envato marketplaces and pull item details for admin import
// into the DistroSource catalog. Never call this from client components.

const ENVATO_SEARCH_URL = "https://api.envato.com/v1/discovery/search/search/item"
const ENVATO_ITEM_URL = "https://api.envato.com/v3/market/catalog/item"

export type EnvatoSite = "themeforest.net" | "codecanyon.net" | "graphicriver.net"

export const ENVATO_SITES: { value: EnvatoSite; label: string }[] = [
  { value: "themeforest.net", label: "ThemeForest" },
  { value: "codecanyon.net", label: "CodeCanyon" },
  { value: "graphicriver.net", label: "GraphicRiver" },
]

export interface EnvatoSearchResult {
  id: number
  name: string
  site: string
  url: string
  priceCents: number
  numberOfSales: number
  rating: number | null
  thumbnailUrl: string | null
  author: string
  tags: string[]
  summary: string | null
}

interface EnvatoRawItem {
  id: number
  name: string
  site: string
  url: string
  price_cents?: number
  number_of_sales?: number
  rating?: { rating: number } | null
  previews?: {
    icon_with_landscape_preview?: { icon_url?: string; landscape_url?: string }
    icon_preview?: { icon_url?: string }
    live_site_preview?: { icon_url?: string; landscape_url?: string }
    thumbnail_preview?: { small_url?: string; large_url?: string }
  }
  author_username?: string
  tags?: string[]
  summary?: string
  classification?: string
}

function requireApiKey() {
  const key = process.env.ENVATO_API_KEY
  if (!key) throw new Error("ENVATO_API_KEY is not configured.")
  return key
}

function extractThumbnail(item: EnvatoRawItem): string | null {
  const previews = item.previews
  if (!previews) return null
  return (
    previews.icon_with_landscape_preview?.landscape_url ||
    previews.icon_with_landscape_preview?.icon_url ||
    previews.live_site_preview?.landscape_url ||
    previews.thumbnail_preview?.large_url ||
    previews.thumbnail_preview?.small_url ||
    previews.icon_preview?.icon_url ||
    null
  )
}

function mapResult(item: EnvatoRawItem): EnvatoSearchResult {
  return {
    id: item.id,
    name: item.name,
    site: item.site,
    url: item.url,
    priceCents: item.price_cents ?? 0,
    numberOfSales: item.number_of_sales ?? 0,
    rating: item.rating?.rating ?? null,
    thumbnailUrl: extractThumbnail(item),
    author: item.author_username ?? "unknown",
    tags: item.tags ?? [],
    summary: item.summary ?? null,
  }
}

export async function searchEnvatoItems(params: {
  term: string
  sites: EnvatoSite[]
  page?: number
}): Promise<EnvatoSearchResult[]> {
  const apiKey = requireApiKey()
  const { term, sites, page = 1 } = params
  if (!term.trim() || sites.length === 0) return []

  const requests = sites.map(async (site) => {
    const url = new URL(ENVATO_SEARCH_URL)
    url.searchParams.set("term", term.trim())
    url.searchParams.set("site", site)
    url.searchParams.set("page", String(page))
    url.searchParams.set("page_size", "12")

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${apiKey}` },
      cache: "no-store",
    })
    if (!res.ok) return []
    const json = (await res.json()) as { matches?: EnvatoRawItem[] }
    return (json.matches ?? []).map(mapResult)
  })

  const results = await Promise.all(requests)
  return results.flat()
}

export interface EnvatoItemDetail extends EnvatoSearchResult {
  description: string
  screenshots: string[]
}

export async function getEnvatoItemDetail(id: number): Promise<EnvatoItemDetail | null> {
  const apiKey = requireApiKey()
  const url = new URL(ENVATO_ITEM_URL)
  url.searchParams.set("id", String(id))

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${apiKey}` },
    cache: "no-store",
  })
  if (!res.ok) return null
  const item = (await res.json()) as EnvatoRawItem & { description?: string }

  const base = mapResult(item)
  const previews = item.previews
  const screenshots = [
    previews?.icon_with_landscape_preview?.landscape_url,
    previews?.live_site_preview?.landscape_url,
    previews?.thumbnail_preview?.large_url,
  ].filter((v): v is string => Boolean(v))

  return {
    ...base,
    description: item.description ?? item.summary ?? "",
    screenshots: Array.from(new Set(screenshots)),
  }
}

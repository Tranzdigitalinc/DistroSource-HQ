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
  previews?: Record<string, Record<string, unknown> | undefined>
  author_username?: string
  tags?: string[]
  summary?: string
  classification?: string
  attributes?: { name: string; value: unknown; label?: string }[]
}

// The `previews` object's shape varies by item type (theme, script, graphic,
// video) and Envato adds/renames sub-keys over time, so rather than pinning
// to a few known keys we walk the whole tree and pull every image URL we
// find. This is what actually gets us "all" media instead of just one
// hero thumbnail.
const PREVIEW_IMAGE_KEYS = new Set(["icon_url", "landscape_url", "small_url", "large_url", "large_landscape_url"])

function collectPreviewUrls(previews: EnvatoRawItem["previews"]): string[] {
  if (!previews) return []
  const urls: string[] = []
  const seen = new Set<string>()

  function walk(node: unknown) {
    if (!node || typeof node !== "object") return
    for (const [key, value] of Object.entries(node as Record<string, unknown>)) {
      if (typeof value === "string" && PREVIEW_IMAGE_KEYS.has(key) && !seen.has(value)) {
        seen.add(value)
        urls.push(value)
      } else if (value && typeof value === "object") {
        walk(value)
      }
    }
  }

  walk(previews)
  return urls
}

// Envato listing descriptions embed real product screenshots inline as plain
// <img> tags, but also embed promo badges ("Exclusive") and cross-sell ads
// for unrelated products/tech-stack variants wrapped in affiliate links
// (envato.market redirects). We want the former as gallery media and must
// drop the latter — they aren't pictures of this item.
const AFFILIATE_LINK_RE = /<a\b[^>]*href="[^"]*(?:envato\.market|click\.linksynergy)[^"]*"[^>]*>[\s\S]*?<\/a>/gi
const IMG_TAG_RE = /<img\b[^>]*\ssrc="([^"]+)"[^>]*>/gi

function extractContentImages(html: string | null | undefined): string[] {
  if (!html) return []
  const withoutAffiliateAds = html.replace(AFFILIATE_LINK_RE, " ")
  const urls: string[] = []
  let match: RegExpExecArray | null
  while ((match = IMG_TAG_RE.exec(withoutAffiliateAds))) {
    const [fullTag, src] = match
    if (/exclusive|badge|banner/i.test(fullTag)) continue
    urls.push(src)
  }
  return urls
}

function requireApiKey() {
  const key = process.env.ENVATO_API_KEY
  if (!key) throw new Error("ENVATO_API_KEY is not configured.")
  return key
}

function extractThumbnail(item: EnvatoRawItem): string | null {
  return collectPreviewUrls(item.previews)[0] ?? null
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
  liveDemoUrl: string | null
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
  // Pull every preview image Envato exposes for this item (hero/landscape,
  // icon, live-site preview, etc.) plus every real screenshot embedded in
  // the description body — this is the full gallery, not a single thumbnail.
  const screenshots = Array.from(
    new Set([...collectPreviewUrls(item.previews), ...extractContentImages(item.description)]),
  )

  const demoAttribute = item.attributes?.find((a) => a.name === "demo-url")
  const liveDemoUrl = typeof demoAttribute?.value === "string" ? demoAttribute.value : null

  return {
    ...base,
    description: item.description ?? item.summary ?? "",
    screenshots,
    liveDemoUrl,
  }
}

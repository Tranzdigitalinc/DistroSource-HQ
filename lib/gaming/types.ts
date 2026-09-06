/**
 * DistroSource Gaming — first-party catalogue types.
 *
 * Every product in this department is owned and sold directly by
 * DistroSource. There is deliberately no seller, creator, vendor, author or
 * commission field anywhere in this shape: Gaming is a department of the
 * store, not a marketplace, and the data model is where that has to be true
 * first — a field that does not exist cannot leak into the UI later.
 *
 * Tebex is payment infrastructure only. Each product carries the package
 * identifiers Tebex needs; nothing else about the product depends on it.
 */

export type GamingPlatform = "fivem" | "minecraft" | "other"

export type GamingCategory =
  | "maps-mlos"
  | "scripts-systems"
  | "ui-hud"
  | "server-resources"
  | "textures"
  | "graphics"
  | "configurations"
  | "bundles"

/** Chooses which illustrative preview graphic a product renders. */
export type GamingPreviewKind = "mlo" | "map" | "hud" | "ui" | "script" | "config" | "texture" | "bundle"

export interface GamingFaq {
  question: string
  answer: string
}

export interface GamingChangelogEntry {
  version: string
  date: string
  notes: string[]
}

export interface GamingProduct {
  id: string
  title: string
  slug: string
  /** One line, used on cards and as the meta description. */
  shortDescription: string
  /** Long-form copy for the product page. */
  description: string
  price: number
  /** Struck-through reference price. Null when the product is not discounted. */
  originalPrice: number | null
  platform: GamingPlatform
  category: GamingCategory
  subcategory: string
  /**
   * Real capture URLs once they exist. Empty today — the storefront renders
   * an illustrative preview instead, and never presents that preview as a
   * screenshot of the delivered files.
   */
  images: string[]
  previewKind: GamingPreviewKind
  version: string
  /** ISO date. Drives the "Updated" badge. */
  lastUpdated: string
  /** ISO date. Drives the "New" badge. */
  releasedAt: string
  compatibility: string[]
  requirements: string[]
  features: string[]
  included: string[]
  installation: string[]
  changelog: GamingChangelogEntry[]
  faq: GamingFaq[]
  tags: string[]
  /** Placeholder until the real Tebex packages are created. */
  tebexPackageId: string
  tebexPackageUrl: string
  featured: boolean
  bestseller: boolean
  popular: boolean
  published: boolean
}

export const GAMING_PLATFORMS: { id: GamingPlatform; label: string; blurb: string }[] = [
  { id: "fivem", label: "FiveM", blurb: "Maps, MLOs, interfaces and systems for FiveM servers." },
  { id: "minecraft", label: "Minecraft", blurb: "Maps, server packs, resource packs and configurations." },
  { id: "other", label: "Game Servers", blurb: "Cross-platform bundles and community resources." },
]

export const GAMING_CATEGORIES: { id: GamingCategory; label: string; blurb: string }[] = [
  { id: "maps-mlos", label: "Maps & MLOs", blurb: "Interiors, environments and playable worlds." },
  { id: "scripts-systems", label: "Scripts & Systems", blurb: "Gameplay systems and server-side logic." },
  { id: "ui-hud", label: "UI & HUD", blurb: "Interfaces, HUDs and in-game menus." },
  { id: "server-resources", label: "Server Resources", blurb: "Everything needed to stand a server up." },
  { id: "textures", label: "Textures", blurb: "Resource packs and texture sets." },
  { id: "graphics", label: "Graphics", blurb: "Branding and community graphics." },
  { id: "configurations", label: "Configurations", blurb: "Tuned, ready-to-run server configs." },
  { id: "bundles", label: "Bundles", blurb: "Multi-product packs at a single price." },
]

export const PLATFORM_LABEL: Record<GamingPlatform, string> = {
  fivem: "FiveM",
  minecraft: "Minecraft",
  other: "Game Servers",
}

export const CATEGORY_LABEL: Record<GamingCategory, string> = Object.fromEntries(
  GAMING_CATEGORIES.map((c) => [c.id, c.label]),
) as Record<GamingCategory, string>

/** Price bands used by the catalogue filter. */
export const GAMING_PRICE_BANDS = [
  { id: "under-10", label: "Under $10", min: 0, max: 10 },
  { id: "10-25", label: "$10 – $25", min: 10, max: 25 },
  { id: "25-50", label: "$25 – $50", min: 25, max: 50 },
  { id: "50-plus", label: "$50+", min: 50, max: Number.POSITIVE_INFINITY },
] as const

export type GamingSort = "featured" | "newest" | "price-asc" | "price-desc" | "popular"

export const GAMING_SORTS: { id: GamingSort; label: string }[] = [
  { id: "featured", label: "Featured" },
  { id: "newest", label: "Newest" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
  { id: "popular", label: "Popular" },
]

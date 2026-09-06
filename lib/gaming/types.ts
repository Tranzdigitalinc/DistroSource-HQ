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
  | "vehicles"
  | "clothing"
  | "characters"
  | "weapons"
  | "animations"
  | "audio"
  | "plugins"
  | "security"
  | "server-resources"
  | "textures"
  | "graphics"
  | "configurations"
  | "bundles"

/* -------------------------------------------------------------------------
 * Product artwork
 *
 * These are rendered scenes, not diagrams. A buyer scanning a gaming store
 * expects to see the thing — a lit interior, a built world, an interface in
 * use — so each product describes a scene and the renderer draws it with
 * materials, depth and light rather than outlines on a grid.
 *
 * They remain illustrations drawn by DistroSource, not screen captures.
 * Photographic captures of the delivered files go in `images`, which takes
 * precedence over everything here once populated. Nothing in this module is
 * ever presented as a capture.
 *
 * Coordinates are in a 400 x 300 viewBox.
 * ---------------------------------------------------------------------- */

/** Lighting and material treatment for an interior scene. */
export type GamingInteriorTone = "warm" | "cool" | "clinical" | "neon" | "showroom"

/** Objects the interior renderer can place in the room, drawn in perspective. */
export type GamingInteriorProp =
  | "desk"
  | "counter"
  | "sofa"
  | "shelf"
  | "locker"
  | "cell"
  | "car"
  | "bar"
  | "screen"
  | "plant"
  | "crate"
  | "table"

/** Sky and ambient treatment for an isometric world scene. */
export type GamingWorldSky = "day" | "dusk" | "night" | "cave"

/** Structures the world renderer can place on the terrain. */
export type GamingWorldStructure =
  | "castle"
  | "house"
  | "tower"
  | "hall"
  | "tree"
  | "pine"
  | "water"
  | "portal"
  | "arena"
  | "path"

/** A labelled bar: a stat readout, a config value, a capacity meter. */
export interface GamingArtBar {
  label: string
  /** 0-1. */
  fill: number
  value?: string
}

/** One app on the phone home screen. `hue` is an HSL hue in degrees. */
export interface GamingArtApp {
  name: string
  hue: number
}

export type GamingArt =
  /** A lit interior in one-point perspective. MLOs and built interiors. */
  | { scene: "interior"; caption: string; tone: GamingInteriorTone; props: GamingInteriorProp[] }
  /** An isometric landscape under a sky. Minecraft worlds and maps. */
  | { scene: "world"; caption: string; sky: GamingWorldSky; structures: GamingWorldStructure[] }
  /** A vehicle HUD drawn over the road scene it sits on. */
  | { scene: "hud"; caption: string; speed: string; unit: string; gauges: GamingArtBar[]; chips: string[] }
  /** An in-game interface with tabs and a populated item grid. */
  | {
      scene: "screen"
      caption: string
      app: string
      tabs: string[]
      activeTab: number
      slots: number
      meter?: GamingArtBar
    }
  /** A handset home screen with coloured app tiles. */
  | { scene: "phone"; caption: string; apps: GamingArtApp[] }
  /** Server-side logic as a lit pipeline of named stages. */
  | { scene: "system"; caption: string; stages: string[]; activeStage: number }
  /** Named configuration values and where they sit in their range. */
  | { scene: "config"; caption: string; rows: GamingArtBar[] }
  /** A texture sheet — game block textures or a brand palette. */
  | { scene: "palette"; caption: string; kind: "blocks" | "brand" }
  /** A row of assets on a display stage — vehicles, characters or weapons. */
  | {
      scene: "lineup"
      caption: string
      subject: "vehicle" | "character" | "weapon"
      count: number
      accentIndex?: number
    }
  /** A waveform over labelled channel strips. Sound and music packs. */
  | { scene: "audio"; caption: string; tracks: GamingArtBar[] }
  /** What a multi-product pack contains, as thumbnailed cards. */
  | { scene: "pack"; caption: string; items: string[] }

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
   * Photographic captures of the delivered files. These take precedence over
   * `art` wherever both exist — as soon as a product has real captures, the
   * illustrations stop being shown for it.
   */
  images: string[]
  /**
   * An 800x500 render of the cover for listing cards, so a grid of forty
   * cards does not download forty 1600px images. Optional; the card falls
   * back to `images[0]`.
   */
  cardImage?: string
  /**
   * One entry per gallery view. The first is the card thumbnail, so it
   * should be the view that identifies the product fastest.
   */
  art: GamingArt[]
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
  { id: "vehicles", label: "Vehicles", blurb: "Vehicle packs, liveries and handling." },
  { id: "clothing", label: "Clothing & EUP", blurb: "Uniforms and civilian clothing sets." },
  { id: "characters", label: "Characters & Peds", blurb: "Player models, peds and character art." },
  { id: "weapons", label: "Weapons", blurb: "Weapon packs, attachments and ballistics." },
  { id: "animations", label: "Animations & Emotes", blurb: "Emotes, job animations and interactions." },
  { id: "audio", label: "Sounds & Audio", blurb: "Sirens, engines, ambience and music." },
  { id: "plugins", label: "Plugins", blurb: "Server-side plugins and gameplay features." },
  { id: "security", label: "Anticheat & Security", blurb: "Cheat detection and server hardening." },
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

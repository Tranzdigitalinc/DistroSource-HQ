/**
 * DistroSource Gaming — catalogue model.
 *
 * Gaming is a first-party department: DistroSource makes and sells every
 * product, so there is deliberately no seller, creator or vendor field.
 *
 * Two rules are enforced by the shape itself:
 *
 * 1. Display is separate from commerce. A product can be shown before it can
 *    be sold (`availability: "launching"`), and only `on-sale` products ever
 *    offer checkout. A rendered preview is never evidence that files exist.
 * 2. There is nowhere to put social proof. No rating, review, sales,
 *    download, member or popularity field exists, so none can reach the UI.
 *    `curation` is an editorial display order, not a sales rank, and is
 *    never labelled as one.
 */

export type GamingPlatform = "fivem" | "minecraft" | "community" | "creator"

/** FiveM frameworks. Only listed where the product genuinely supports them. */
export type GamingFramework = "esx" | "qbcore" | "qbox" | "standalone"

/**
 * How a recurring product delivers value. A plan may combine models, e.g. a
 * vault that also publishes a monthly drop.
 */
export type GamingSubscriptionModel =
  | "vault"
  | "monthly-drop"
  | "membership"
  | "pick-and-keep"
  | "credits"
  | "update-plan"
  | "server-owner"
  | "creator"

/**
 * on-sale    checkout is offered (requires real deliverables + a payment mapping)
 * launching  fully presented, checkout not yet offered, clearly stated as such
 * unlisted   kept as data, hidden from listings, search and the sitemap
 */
export type GamingAvailability = "on-sale" | "launching" | "unlisted"

/** Where an image came from. Rendered previews are labelled as previews. */
export type GamingMediaProvenance = "rendered-preview" | "capture"

export interface GamingImageRendition {
  src: string
  width: number
}

export interface GamingImage {
  kind: "image"
  src: string
  width: number
  height: number
  alt: string
  /** Smaller renditions of the same image, for `srcset`. */
  renditions?: GamingImageRendition[]
  caption?: string
  provenance: GamingMediaProvenance
}

/**
 * Reserved for real product videos. The gallery already renders this kind;
 * no product carries one until an actual video exists.
 */
export interface GamingVideo {
  kind: "video"
  src: string
  poster: GamingImage
  caption?: string
}

export type GamingMedia = GamingImage | GamingVideo

export type GamingPricing =
  | { kind: "one-time"; price: number }
  /** `annual` is the full yearly price; the saving is always computed, never stored. */
  | { kind: "subscription"; monthly: number; annual?: number }

export interface GamingFeature {
  title: string
  body: string
}

export interface GamingProduct {
  id: string
  slug: string
  title: string
  platform: GamingPlatform
  /** A category id from the taxonomy for this platform. */
  category: string
  /** 1–3 short display tags, e.g. "MLO", "ESX", "VAULT". */
  tags: string[]
  frameworks: GamingFramework[]
  /** One value line for cards and the meta description. */
  summary: string
  /** Overview paragraphs. Recurring products: 120–220 meaningful words. */
  description: string[]
  /** 5–8 concrete bullets. */
  whatYouGet: string[]
  features: GamingFeature[]
  compatibility: string[]
  requirements: string[]
  license: string[]
  installation: string[]
  pricing: GamingPricing
  /** Empty for one-time products. */
  models: GamingSubscriptionModel[]
  /** Recurring products: what arrives and how often. */
  cadence?: string[]
  /** Recurring products: exactly what happens on cancellation. */
  afterCancel?: string[]
  /** Recurring products: the resource types the plan covers. */
  eligibleResourceTypes?: string[]
  /** First item is the cover. */
  media: GamingMedia[]
  /** 800×500 rendition of the cover for listing cards. */
  cardImage: GamingImage
  availability: GamingAvailability
  /** Editorial display order for "Featured". Lower first. Not a sales rank. */
  curation: number
  /** ISO date. */
  releasedAt: string
  /** ISO date. */
  updatedAt: string
  /** Extra search terms that are not already in the title, tags or summary. */
  searchTerms?: string[]
}

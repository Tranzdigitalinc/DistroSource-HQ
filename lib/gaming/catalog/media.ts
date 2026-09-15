import type { GamingImage } from "@/lib/gaming/catalog/types"

/** Shared building blocks for catalogue records. */

const RENDITIONS = [1200, 800] as const

/** A 1600×1000 WebP under /public/gaming/catalog/<slug>/, with 1200 and 800 px renditions. */
export function image(slug: string, name: string, alt: string, caption?: string): GamingImage {
  const base = `/gaming/catalog/${slug}/${name}`
  return {
    kind: "image",
    src: `${base}.webp`,
    width: 1600,
    height: 1000,
    alt,
    caption,
    renditions: RENDITIONS.map((w) => ({ src: `${base}-${w}.webp`, width: w })),
    provenance: "rendered-preview",
  }
}

/** The 800×500 rendition of a product's cover, for listing cards. */
export function card(slug: string, alt: string): GamingImage {
  return {
    kind: "image",
    src: `/gaming/catalog/${slug}/cover-800.webp`,
    width: 800,
    height: 500,
    alt,
    provenance: "rendered-preview",
  }
}

export const LICENSE_SERVER = [
  "Licensed for one server network you own or operate.",
  "You may edit, re-texture and configure resources for that network.",
  "Reselling, sharing or re-uploading the files is not permitted.",
]

export const LICENSE_CREATOR = [
  "Licensed for your own community, server, team or channel.",
  "You may edit and publish the designs for that community.",
  "Reselling the files or offering them as templates is not permitted.",
]

export const LAUNCH_DATE = "2026-09-15"

/** Cancellation terms shared by plans whose licence ends with the subscription. */
export const AFTER_CANCEL_LICENSED = (what: string) => [
  "Access and updates continue until the end of the period you paid for.",
  `The licence to run ${what} ends with the subscription.`,
  `Remove ${what} from live servers once access ends.`,
]

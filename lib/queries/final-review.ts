import "server-only"

import { db } from "@/lib/db"
import { bundleItems, productFiles, productImages, productLicenses, products, categories } from "@/lib/db/schema"
import { eq, sql } from "drizzle-orm"

/**
 * Final Catalog Review — the launch gate.
 *
 * `finalReviewStatus` is DERIVED here rather than stored. Adding the column
 * requires ALTER TABLE, which needs ownership of `products`; the available
 * database role has DML but not DDL. Deriving it has an advantage in any case:
 * the status cannot drift out of date when a file, licence or price changes.
 *
 * To persist manual overrides later, apply:
 *
 *   ALTER TABLE products
 *     ADD COLUMN "finalReviewStatus" text NOT NULL DEFAULT 'pending';
 *   ALTER TABLE products ADD CONSTRAINT products_final_review_status_check
 *     CHECK ("finalReviewStatus" IN ('pending','approved','changes_required'));
 *
 * then read the stored value in preference to the derived one.
 */

export type FinalReviewStatus = "pending" | "approved" | "changes_required"

export type ReviewFlag =
  | "needs_file"
  | "needs_rights_review"
  | "needs_image_review"
  | "needs_licence_review"
  | "ready_for_launch"
  | "draft"
  | "published"

const APPROVED_RIGHTS = ["original", "licensed_for_distribution", "supplier_verified"]

/** Below this a download cannot plausibly be the product it describes. */
const STUB_FILE_BYTES = 20_000

/** Legacy hero art: AI marketing renders seeded under products/images/. */
const LEGACY_HERO = "public.blob.vercel-storage.com/products/images/"

export interface FinalReviewRow {
  id: number
  slug: string
  name: string
  primaryImage: string | null
  primaryImageIsGenerated: boolean
  assetStatus: string
  rightsStatus: string
  status: string
  fileName: string | null
  fileFormats: string[]
  fileSizeBytes: number | null
  basePrice: string
  licences: { type: string; price: string }[]
  previewCount: number
  isBundle: boolean
  bundleItemCount: number
  reviewStatus: FinalReviewStatus
  flags: ReviewFlag[]
  blockers: string[]
  department: string | null
  category: string
}

export async function getFinalReviewRows(): Promise<FinalReviewRow[]> {
  const parent = { ...categories }

  const rows = await db
    .select({
      id: products.id,
      slug: products.slug,
      name: products.name,
      thumbnailUrl: products.thumbnailUrl,
      assetStatus: products.assetStatus,
      rightsStatus: products.rightsStatus,
      status: products.status,
      isBundle: products.isBundle,
      isFree: products.isFree,
      basePrice: products.basePrice,
      fileFormats: products.fileFormats,
      rightsOwner: products.rightsOwner,
      proofOfRights: products.proofOfRights,
      category: categories.name,
      parentId: categories.parentId,
    })
    .from(products)
    .innerJoin(categories, eq(products.categoryId, categories.id))
    .orderBy(products.id)

  const depts = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(sql`${categories.parentId} is null`)
  const deptById = new Map(depts.map((d) => [d.id, d.name]))

  const files = await db.select().from(productFiles)
  const filesByProduct = new Map<number, typeof files>()
  for (const f of files) {
    const list = filesByProduct.get(f.productId) ?? []
    list.push(f)
    filesByProduct.set(f.productId, list)
  }

  const licences = await db.select().from(productLicenses)
  const licencesByProduct = new Map<number, typeof licences>()
  for (const l of licences) {
    const list = licencesByProduct.get(l.productId) ?? []
    list.push(l)
    licencesByProduct.set(l.productId, list)
  }

  const images = await db.select().from(productImages)
  const imagesByProduct = new Map<number, typeof images>()
  for (const i of images) {
    const list = imagesByProduct.get(i.productId) ?? []
    list.push(i)
    imagesByProduct.set(i.productId, list)
  }

  const bundles = await db.select().from(bundleItems)
  const bundleCount = new Map<number, number>()
  for (const b of bundles) {
    bundleCount.set(b.bundleProductId, (bundleCount.get(b.bundleProductId) ?? 0) + 1)
  }

  return rows.map((p) => {
    const pFiles = filesByProduct.get(p.id) ?? []
    const pLicences = licencesByProduct.get(p.id) ?? []
    const pImages = imagesByProduct.get(p.id) ?? []
    const generated = pImages.filter((i) => decodeURIComponent(i.url).includes("catalog/previews/"))
    const itemCount = bundleCount.get(p.id) ?? 0

    const blockers: string[] = []
    const flags: ReviewFlag[] = []

    // --- fulfilment -------------------------------------------------------
    if (p.isBundle) {
      if (itemCount === 0) blockers.push("Bundle has no included products identified")
      // Fulfilment does not expand bundles into per-product entitlements.
      blockers.push("Bundle fulfilment does not grant entitlements for included products")
    } else if (pFiles.length === 0) {
      blockers.push("No downloadable file attached")
    }
    const primaryFile = pFiles[0] ?? null
    const size = primaryFile?.fileSizeBytes == null ? null : Number(primaryFile.fileSizeBytes)
    if (primaryFile && size !== null && size < STUB_FILE_BYTES) {
      blockers.push(`Download is only ${size} bytes — cannot match the description`)
    }
    if (primaryFile && size === null) {
      blockers.push("File size unknown — object may be missing from storage")
    }
    if (blockers.some((b) => /file|Bundle/i.test(b))) flags.push("needs_file")

    // --- rights -----------------------------------------------------------
    if (!APPROVED_RIGHTS.includes(p.rightsStatus)) {
      blockers.push(`Rights status is ${p.rightsStatus}`)
      flags.push("needs_rights_review")
    } else if (p.rightsStatus !== "original" && !p.proofOfRights) {
      flags.push("needs_rights_review")
    }

    // --- imagery ----------------------------------------------------------
    const heroIsLegacy = Boolean(p.thumbnailUrl && p.thumbnailUrl.includes(LEGACY_HERO))
    if (!p.thumbnailUrl) {
      blockers.push("No primary image")
      flags.push("needs_image_review")
    } else if (heroIsLegacy) {
      flags.push("needs_image_review")
    }
    if (generated.length < 4) flags.push("needs_image_review")

    // --- licensing --------------------------------------------------------
    const types = pLicences.map((l) => l.licenseType)
    if (!p.isFree) {
      if (!types.includes("personal")) {
        blockers.push("No Personal licence tier")
        flags.push("needs_licence_review")
      }
      const prices = Object.fromEntries(pLicences.map((l) => [l.licenseType, Number(l.price)]))
      if (prices.personal !== undefined && prices.personal <= 0) {
        blockers.push("Paid product priced at zero")
        flags.push("needs_licence_review")
      }
      if (prices.commercial !== undefined && prices.personal !== undefined && prices.commercial <= prices.personal) {
        blockers.push("Commercial tier is not above Personal")
        flags.push("needs_licence_review")
      }
      if (prices.agency !== undefined && prices.commercial !== undefined && prices.agency <= prices.commercial) {
        blockers.push("Agency tier is not above Commercial")
        flags.push("needs_licence_review")
      }
      if (types.includes("extended_commercial") || types.includes("regular_license")) {
        flags.push("needs_licence_review")
      }
    }

    if (p.status === "published") flags.push("published")
    else flags.push("draft")

    const reviewStatus: FinalReviewStatus = blockers.length ? "changes_required" : "pending"
    if (!blockers.length) flags.push("ready_for_launch")

    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      primaryImage: p.thumbnailUrl,
      primaryImageIsGenerated: Boolean(p.thumbnailUrl && decodeURIComponent(p.thumbnailUrl).includes("catalog/previews/")),
      assetStatus: p.assetStatus,
      rightsStatus: p.rightsStatus,
      status: p.status,
      fileName: primaryFile?.fileName ?? null,
      fileFormats: p.fileFormats ?? [],
      fileSizeBytes: size,
      basePrice: p.basePrice,
      licences: pLicences
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map((l) => ({ type: l.licenseType, price: l.price })),
      previewCount: generated.length,
      isBundle: p.isBundle,
      bundleItemCount: itemCount,
      reviewStatus,
      flags: [...new Set(flags)],
      blockers,
      department: p.parentId ? (deptById.get(p.parentId) ?? null) : null,
      category: p.category,
    }
  })
}

/**
 * The launch gate. A product may only be published once its derived review
 * status is `approved` — which, while approval is derived, means it has no
 * blockers at all.
 */
export function canPublish(row: Pick<FinalReviewRow, "blockers">): boolean {
  return row.blockers.length === 0
}

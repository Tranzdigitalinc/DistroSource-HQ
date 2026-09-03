"use server"

import { put } from "@vercel/blob"
import { requireAdmin } from "@/lib/actions/operations"
import {
  createProduct,
  updateProduct,
  addProductImage,
  addProductFile,
  addProductLicense,
  type ProductFormInput,
} from "@/lib/actions/admin-products"
import { searchEnvatoItems, getEnvatoItemDetail, type EnvatoSite, type EnvatoSearchResult } from "@/lib/envato"
import { mirrorUrlToBlob } from "@/lib/blob-mirror"
import { htmlToLiteMarkdown, stripLiteMarkdown } from "@/lib/html-to-text"
import { createPlaceholderZip } from "@/lib/zip-placeholder"

export async function searchEnvatoCatalog(term: string, sites: EnvatoSite[]) {
  await requireAdmin()
  return searchEnvatoItems({ term, sites })
}

export interface ImportEnvatoItemInput {
  envatoId: number
  categoryId: number
  isFeatured: boolean
}

function slugifyName(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

// Imports a single Envato Market item as a fully live DistroSource product:
// - Description is converted from raw HTML into a light markdown format
//   (headings, bullets, bold kept) instead of one flat paragraph, and
//   cross-sell/affiliate ad content is filtered out — see htmlToLiteMarkdown.
// - Every preview image Envato exposes (hero/landscape, icon, live-site
//   preview) plus every real screenshot embedded in the description body is
//   downloaded and re-uploaded to our own Blob storage, so the full gallery
//   keeps working even if the Envato API key is revoked or the source item
//   is later removed.
// - Price matches Envato's listed price exactly, and that price is written
//   as a real Regular License row — without this, the product has nothing
//   to sell and the purchase panel simply doesn't render.
// - A placeholder .zip is attached as the downloadable file so the product
//   can publish immediately and the full purchase -> entitlement -> download
//   flow can be tested before the real package replaces it.
export async function importEnvatoItem(input: ImportEnvatoItemInput) {
  await requireAdmin()

  const item = await getEnvatoItemDetail(input.envatoId)
  if (!item) throw new Error("Could not load this item from Envato. It may have been removed.")

  let description = htmlToLiteMarkdown(item.description) || item.summary || item.name
  if (item.liveDemoUrl) {
    description += `\n\n## Live preview\n${item.liveDemoUrl}`
  }
  const tagline = stripLiteMarkdown(description).slice(0, 140).trim()
  const basePrice = (item.priceCents / 100).toFixed(2)

  const sourceImageUrls = Array.from(
    new Set([item.thumbnailUrl, ...item.screenshots].filter((url): url is string => Boolean(url))),
  )
  if (sourceImageUrls.length === 0) {
    throw new Error("This Envato item has no preview images to import.")
  }

  const mirroredUrls = await Promise.all(sourceImageUrls.map((url) => mirrorUrlToBlob(url, "products/envato")))
  const [thumbnailUrl, ...restImages] = mirroredUrls

  const formInput: ProductFormInput = {
    name: item.name,
    slug: slugifyName(item.name),
    tagline,
    description,
    categoryId: input.categoryId,
    status: "draft",
    basePrice,
    compareAtPrice: "",
    thumbnailUrl,
    coverImageUrl: restImages[0] || thumbnailUrl,
    fileFormats: "",
    fileSizeMb: "",
    softwareCompatibility: "",
    // Bulk imports intentionally do not assign a release version. Add one
    // later from the product editor when the real package is uploaded.
    currentVersion: "",
    includedFiles: "",
    documentation: "",
    tags: item.tags.slice(0, 12).join(", "),
    isFeatured: input.isFeatured,
    isNewRelease: false,
    isFree: false,
    isBundle: false,
    seoTitle: "",
    seoDescription: tagline,
  }

  const productId = await createProduct(formInput)

  for (const url of mirroredUrls) {
    await addProductImage(productId, url, item.name)
  }

  const zipBuffer = createPlaceholderZip(item.name)
  const zipBlob = await put(`products/${Date.now()}-${slugifyName(item.name)}-placeholder.zip`, zipBuffer, {
    access: "private",
    contentType: "application/zip",
  })
  // Store the raw private-blob pathname, not a URL — /api/downloads/[fileId]
  // resolves this via get() after re-checking entitlement.
  await addProductFile(productId, {
    fileName: `${slugifyName(item.name)}.zip`,
    blobPathname: zipBlob.pathname,
    fileSizeBytes: zipBuffer.length,
    fileType: "application/zip",
    licenseType: null,
  })

  // Envato's public catalog API only ever exposes a single price — the
  // Regular License price shown on the listing. Extended License pricing
  // (when an item even offers one) isn't part of this API, so we import
  // exactly what Envato actually gives us rather than inventing a second
  // tier with a made-up price.
  await addProductLicense(productId, {
    licenseType: "regular_license",
    price: basePrice,
    description: "Use in a single end product, for yourself or one client — matches the license terms on the original Envato listing.",
  })

  // Now that it has images, a license to sell, and a downloadable file,
  // publish it live.
  await updateProduct(productId, { ...formInput, status: "published" })

  return productId
}

export type BulkImportResult = {
  envatoId: number
  name: string
  productId?: number
  error?: string
}

// Import one item at a time so Envato and Blob requests stay within safe
// limits. Bulk imports intentionally pass no version value; the product can
// be versioned later from its editor when a real package is uploaded.
export async function importEnvatoItems(input: {
  items: Pick<EnvatoSearchResult, "id" | "name">[]
  categoryId: number
  isFeatured: boolean
}): Promise<BulkImportResult[]> {
  await requireAdmin()
  const results: BulkImportResult[] = []
  for (const item of input.items) {
    try {
      const productId = await importEnvatoItem({
        envatoId: item.id,
        categoryId: input.categoryId,
        isFeatured: input.isFeatured,
      })
      results.push({ envatoId: item.id, name: item.name, productId })
    } catch (error) {
      results.push({
        envatoId: item.id,
        name: item.name,
        error: error instanceof Error ? error.message : "Import failed.",
      })
    }
  }
  return results
}

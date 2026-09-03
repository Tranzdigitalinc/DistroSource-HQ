"use server"

import { put } from "@vercel/blob"
import { requireAdmin } from "@/lib/actions/operations"
import { createProduct, updateProduct, addProductImage, addProductFile, type ProductFormInput } from "@/lib/actions/admin-products"
import { searchEnvatoItems, getEnvatoItemDetail, type EnvatoSite } from "@/lib/envato"
import { mirrorUrlToBlob } from "@/lib/blob-mirror"
import { htmlToPlainText } from "@/lib/html-to-text"
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
// - Description is cleaned from raw HTML into plain text.
// - Preview images are downloaded and re-uploaded to our own Blob storage, so
//   the listing keeps working even if the Envato API key is revoked or the
//   source item is later removed.
// - Price matches Envato's listed price exactly.
// - A placeholder .zip is attached as the downloadable file so the product
//   can publish immediately and the full purchase -> entitlement -> download
//   flow can be tested before the real package replaces it.
export async function importEnvatoItem(input: ImportEnvatoItemInput) {
  await requireAdmin()

  const item = await getEnvatoItemDetail(input.envatoId)
  if (!item) throw new Error("Could not load this item from Envato. It may have been removed.")

  const cleanDescription = htmlToPlainText(item.description) || item.summary || item.name
  const tagline = cleanDescription.slice(0, 140).trim()
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
    description: cleanDescription,
    categoryId: input.categoryId,
    status: "draft",
    basePrice,
    compareAtPrice: "",
    thumbnailUrl,
    coverImageUrl: restImages[0] || thumbnailUrl,
    fileFormats: "",
    fileSizeMb: "",
    softwareCompatibility: "",
    currentVersion: "1.0.0",
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

  // Now that it has images and a downloadable file, publish it live.
  await updateProduct(productId, { ...formInput, status: "published" })

  return productId
}

"use server"

import { requireAdmin } from "@/lib/actions/operations"
import { createProduct, addProductImage } from "@/lib/actions/admin-products"
import { searchEnvatoItems, getEnvatoItemDetail, type EnvatoSite } from "@/lib/envato"

export async function searchEnvatoCatalog(term: string, sites: EnvatoSite[]) {
  await requireAdmin()
  return searchEnvatoItems({ term, sites })
}

export interface ImportEnvatoItemInput {
  envatoId: number
  categoryId: number
  basePrice: string
  isFeatured: boolean
}

export async function importEnvatoItem(input: ImportEnvatoItemInput) {
  await requireAdmin()

  const item = await getEnvatoItemDetail(input.envatoId)
  if (!item) throw new Error("Could not load this item from Envato. It may have been removed.")

  const thumbnailUrl = item.thumbnailUrl || item.screenshots[0] || ""

  const productId = await createProduct({
    name: item.name,
    slug: "",
    tagline: item.summary?.slice(0, 140) || "",
    description: item.description || item.summary || item.name,
    categoryId: input.categoryId,
    status: "draft",
    basePrice: input.basePrice,
    compareAtPrice: "",
    thumbnailUrl,
    coverImageUrl: item.screenshots[0] || thumbnailUrl,
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
    seoDescription: "",
  })

  const extraImages = item.screenshots.filter((url) => url !== thumbnailUrl)
  for (const url of extraImages) {
    await addProductImage(productId, url, item.name)
  }
  if (thumbnailUrl) {
    await addProductImage(productId, thumbnailUrl, item.name)
  }

  return productId
}

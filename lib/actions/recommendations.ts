"use server"

import { getCartItems } from "@/lib/actions/cart"
import { getProducts, getRecommendedProducts } from "@/lib/queries/catalog"

type Item = Awaited<ReturnType<typeof getProducts>>[number]
const hasCover = (p: Item) => Boolean(p.product.coverImageUrl ?? p.images[0]?.url ?? p.product.thumbnailUrl)

/**
 * Products to suggest next to the cart: the same category as the most
 * recent line, excluding anything already in the cart, products with a
 * cover image first. Falls back to the featured order for an empty cart.
 * Read-only.
 */
export async function getCartRecommendations(limit = 4) {
  const items = await getCartItems()
  const inCart = new Set(items.map((i) => i.product.id))
  const last = items[items.length - 1]
  const want = limit * 3 + inCart.size
  const pool =
    last && last.product.categoryId !== null
      ? await getRecommendedProducts(last.product.categoryId, last.product.id, want)
      : await getProducts({ featured: true, limit: want })
  const candidates = pool.filter((p) => !inCart.has(p.product.id))
  return [...candidates.filter(hasCover), ...candidates.filter((p) => !hasCover(p))].slice(0, limit)
}

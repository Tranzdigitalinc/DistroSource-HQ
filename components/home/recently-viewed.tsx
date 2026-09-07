import { getRecentlyViewed } from "@/lib/actions/recently-viewed"
import { getProductsByIds } from "@/lib/queries/catalog"
import { ProductCarousel } from "@/components/home/product-carousel"

type Full = Awaited<ReturnType<typeof getProductsByIds>>[number]

/**
 * "Pick up where you left off": the visitor's recently viewed products,
 * newest first, as a carousel. Per-visitor (guest cookie or account), so it
 * is never cached and renders nothing until there are at least two items.
 */
export async function RecentlyViewed({ excludeId, limit = 8 }: { excludeId?: number; limit?: number }) {
  const recent = await getRecentlyViewed(limit + 1).catch(() => [])
  const ids = recent
    .map((r) => r?.product.id)
    .filter((id): id is number => typeof id === "number" && id !== excludeId)
    .slice(0, limit)
  if (ids.length < 2) return null

  const full = await getProductsByIds(ids)
  const byId = new Map(full.map((f) => [f.product.id, f]))
  const ordered = ids.map((id) => byId.get(id)).filter((f): f is Full => Boolean(f))
  if (ordered.length < 2) return null

  return <ProductCarousel eyebrow="Recently viewed" title="Pick up where you left off" subtitle="The products you looked at most recently, newest first." href="/products" items={ordered} />
}

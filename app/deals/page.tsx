import { CatalogPage } from "@/components/catalog/catalog-page"
import { getProducts } from "@/lib/queries/catalog"

export const metadata = {
  title: "Today's deals — DistroSource",
}

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const sp = await searchParams
  const products = await getProducts({
    deal: true,
    categorySlug: sp.category,
    search: sp.q,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    format: sp.format,
    minRating: sp.minRating ? Number(sp.minRating) : undefined,
    sort: (sp.sort as any) ?? "featured",
  })

  return (
    <CatalogPage
      title="Today's deals"
      subtitle="Limited-time discounts across templates, fonts, and every other category"
      products={products}
      clearHref="/deals"
      banner={
        <div className="bg-primary py-3 text-center text-sm font-medium text-primary-foreground">
          Deal prices update regularly — grab your favorite products before the discount ends
        </div>
      }
    />
  )
}

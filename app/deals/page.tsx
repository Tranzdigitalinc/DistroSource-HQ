import { CatalogPage } from "@/components/catalog/catalog-page"
import { getProducts } from "@/lib/queries/catalog"

export default async function DealsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const sp = await searchParams
  const products = await getProducts({
    deal: true,
    categorySlug: sp.category,
    brandSlug: sp.brand,
    countryCode: sp.country,
    search: sp.q,
    sort: (sp.sort as any) ?? "price-asc",
  })

  return (
    <CatalogPage
      title="Today's deals"
      subtitle="Limited-time discounts across gaming, streaming, and shopping brands"
      products={products}
      banner={
        <div className="bg-primary py-3 text-center text-sm font-medium text-primary-foreground">
          Deal prices update daily — grab your favorite codes before they&apos;re gone
        </div>
      }
    />
  )
}

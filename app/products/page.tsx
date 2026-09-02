import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { CatalogFilters } from "@/components/catalog/catalog-filters"
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar"
import { ProductGrid } from "@/components/catalog/product-grid"
import { getCategories, getBrands, getCountries, getProducts } from "@/lib/queries/catalog"

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const [categories, brands, countries, products] = await Promise.all([
    getCategories(),
    getBrands(),
    getCountries(),
    getProducts({
      categorySlug: params.category,
      brandSlug: params.brand,
      countryCode: params.country,
      search: params.q,
      deliveryType: params.delivery,
      minDiscount: params.discount ? Number(params.discount) : undefined,
      maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
      sort: (params.sort as any) ?? "popular",
    }),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
          <div className="mb-6">
            <h1 className="font-display text-3xl font-bold tracking-tight">
              {params.q ? `Results for "${params.q}"` : "All products"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse gift cards, top-ups, and digital codes from trusted brands
            </p>
          </div>
          <div className="flex flex-col gap-8 lg:flex-row">
            <CatalogFilters categories={categories} brands={brands} countries={countries} />
            <div className="flex-1">
              <CatalogToolbar resultCount={products.length} />
              <ProductGrid items={products} />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

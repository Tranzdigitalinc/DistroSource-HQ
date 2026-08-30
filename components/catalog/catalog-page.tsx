import Image from "next/image"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { CatalogFilters } from "@/components/catalog/catalog-filters"
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar"
import { ProductGrid } from "@/components/catalog/product-grid"
import { getCategories, getBrands, getCountries, getProducts } from "@/lib/queries/catalog"

export async function CatalogPage({
  title,
  subtitle,
  logoUrl,
  banner,
  products,
}: {
  title: React.ReactNode
  subtitle?: string
  logoUrl?: string | null
  banner?: React.ReactNode
  products: Awaited<ReturnType<typeof getProducts>>
}) {
  const [categories, brands, countries] = await Promise.all([getCategories(), getBrands(), getCountries()])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {banner}
        <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
          <div className="mb-6 flex items-center gap-4">
            {logoUrl && (
              <div className="flex size-14 shrink-0 items-center justify-center rounded-xl border border-border bg-white p-2.5 shadow-sm">
                <Image
                  src={logoUrl || "/placeholder.svg"}
                  alt={`${title} logo`}
                  width={44}
                  height={44}
                  className="size-full object-contain"
                />
              </div>
            )}
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
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

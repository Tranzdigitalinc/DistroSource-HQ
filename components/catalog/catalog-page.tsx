import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { CatalogFilters } from "@/components/catalog/catalog-filters"
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar"
import { CategoryPillBar } from "@/components/catalog/category-pill-bar"
import { ProductGrid } from "@/components/catalog/product-grid"
import { getCategories, getProducts } from "@/lib/queries/catalog"

export async function CatalogPage({
  title,
  subtitle,
  banner,
  products,
  categoryPillBar,
}: {
  title: React.ReactNode
  subtitle?: string
  banner?: React.ReactNode
  products: Awaited<ReturnType<typeof getProducts>>
  // Defaults to the query-param-driven CategoryPillBar (used by /products and
  // /deals, which filter via `?category=`). Pass a real navigation element
  // instead on pages like /categories/[slug] where the category is set by
  // the route, not a query param — a query-param pill there would render
  // but silently do nothing when clicked.
  categoryPillBar?: React.ReactNode
}) {
  const categories = categoryPillBar === undefined ? await getCategories() : null

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {banner}
        <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
          {!banner && (
            <div className="mb-6">
              <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
          )}
          {categoryPillBar !== undefined ? categoryPillBar : <CategoryPillBar categories={categories!} />}
          <div className="flex flex-col gap-8 lg:flex-row">
            <CatalogFilters />
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

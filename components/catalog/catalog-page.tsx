import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { CatalogFilters } from "@/components/catalog/catalog-filters"
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar"
import { CategoryPillBar } from "@/components/catalog/category-pill-bar"
import { ProductGrid, type ProductGridEmptyState } from "@/components/catalog/product-grid"
import { getAvailableFileFormats, getCatalogStats, getCategories, getProducts } from "@/lib/queries/catalog"

export async function CatalogPage({
  title,
  subtitle,
  banner,
  products,
  categoryPillBar,
  clearHref,
  emptyState,
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
  /** Where "Clear filters" in the empty state should go. Defaults to the bare pathname. */
  clearHref?: string
  /** Copy for an empty result that isn't caused by filters (e.g. a category with nothing published yet). */
  emptyState?: ProductGridEmptyState
}) {
  const [categories, formats, stats] = await Promise.all([
    categoryPillBar === undefined ? getCategories() : Promise.resolve(null),
    getAvailableFileFormats(),
    getCatalogStats(),
  ])

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {banner}
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10">
          {!banner && (
            <div className="mb-6">
              <h1 className="font-display text-3xl font-bold tracking-tight">{title}</h1>
              {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
            </div>
          )}
          {categoryPillBar !== undefined ? categoryPillBar : <CategoryPillBar categories={categories!} />}
          <div className="flex flex-col gap-8 lg:flex-row">
            {/* reviewCount keeps the rating filter hidden while there are no reviews to filter by. */}
            <CatalogFilters
              formats={formats}
              reviewCount={stats.reviewCount}
              typeCounts={{ free: stats.freeCount, bundle: stats.bundleCount, deal: stats.dealCount }}
            />
            <div className="min-w-0 flex-1">
              <CatalogToolbar resultCount={products.length} />
              <ProductGrid items={products} clearHref={clearHref} emptyState={emptyState} />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

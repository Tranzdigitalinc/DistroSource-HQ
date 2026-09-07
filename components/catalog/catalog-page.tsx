import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { CatalogFilters } from "@/components/catalog/catalog-filters"
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar"
import { CategoryPillBar } from "@/components/catalog/category-pill-bar"
import { ProductGrid, type ProductGridEmptyState } from "@/components/catalog/product-grid"
import { PageHeader } from "@/components/page-header"
import { getAvailableFileFormats, getCatalogStats, getCategories, getProducts } from "@/lib/queries/catalog"

export async function CatalogPage({
  eyebrow,
  title,
  subtitle,
  banner,
  products,
  categoryPillBar,
  clearHref,
  emptyState,
}: {
  eyebrow?: string
  title: React.ReactNode
  subtitle?: string
  banner?: React.ReactNode
  products: Awaited<ReturnType<typeof getProducts>>
  // Defaults to the query-param-driven CategoryPillBar (used by /products and
  // /deals, which filter via `?category=`). Pass a real navigation element
  // on pages like /categories/[slug] where the category is set by the route.
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

  const filters = (
    <CatalogFilters formats={formats} reviewCount={stats.reviewCount} typeCounts={{ free: stats.freeCount, bundle: stats.bundleCount, deal: stats.dealCount }} />
  )

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {banner}
        <div className="container-x py-10 sm:py-12">
          {!banner && <PageHeader eyebrow={eyebrow} title={title} description={subtitle} className="mb-8" />}
          <div className="mb-6">{categoryPillBar !== undefined ? categoryPillBar : <CategoryPillBar categories={categories!} />}</div>
          <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
            {filters}
            <div className="min-w-0 flex-1">
              <div className="mb-6 border-b border-border pb-4">
                <CatalogToolbar resultCount={products.length} />
              </div>
              <ProductGrid items={products} clearHref={clearHref} emptyState={emptyState} />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

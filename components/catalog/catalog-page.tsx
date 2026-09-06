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
  categoryPillBar?: React.ReactNode
  clearHref?: string
  emptyState?: ProductGridEmptyState
}) {
  const [categories, formats, stats] = await Promise.all([
    categoryPillBar === undefined ? getCategories() : Promise.resolve(null),
    getAvailableFileFormats(),
    getCatalogStats(),
  ])

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        {banner}

        {!banner && (
          <section className="border-b border-border/70 bg-secondary/18">
            <div className="mx-auto max-w-[94rem] px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
                <div className="max-w-4xl">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-primary">Discover DistroSource</p>
                  <h1 className="mt-3 font-display text-4xl font-black leading-[0.95] tracking-[-0.05em] text-foreground sm:text-5xl lg:text-6xl">{title}</h1>
                  {subtitle && <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{subtitle}</p>}
                </div>
                <div className="hidden border-l border-border pl-5 text-right lg:block">
                  <p className="font-display text-3xl font-black tabular-nums text-foreground">{products.length}</p>
                  <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-muted-foreground">shown on this page</p>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="mx-auto max-w-[94rem] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          <div className="mb-8 overflow-hidden">{categoryPillBar !== undefined ? categoryPillBar : <CategoryPillBar categories={categories!} />}</div>

          <div className="grid gap-8 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-10 xl:grid-cols-[18rem_minmax(0,1fr)]">
            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="mb-4 hidden lg:block">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Refine</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">Narrow by type, format, price and rating.</p>
              </div>
              <CatalogFilters
                formats={formats}
                reviewCount={stats.reviewCount}
                typeCounts={{ free: stats.freeCount, bundle: stats.bundleCount, deal: stats.dealCount }}
              />
            </aside>

            <div className="min-w-0">
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

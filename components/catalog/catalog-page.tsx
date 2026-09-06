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
        {banner ?? (
          <section className="relative overflow-hidden border-b border-border bg-secondary/30">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.25] [background-image:radial-gradient(circle_at_center,var(--border)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
            <div className="relative mx-auto max-w-[1540px] px-4 py-14 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-primary">DistroSource catalog</p>
              <h1 className="mt-4 max-w-5xl font-display text-[clamp(3rem,7vw,7rem)] font-black leading-[0.86] tracking-[-0.075em] text-foreground">{title}</h1>
              {subtitle && <p className="mt-6 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">{subtitle}</p>}
            </div>
          </section>
        )}

        <section className="mx-auto max-w-[1540px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          {categoryPillBar !== undefined ? categoryPillBar : <CategoryPillBar categories={categories!} />}

          <div className="mb-5 flex items-center justify-between lg:hidden">
            <CatalogFilters
              formats={formats}
              reviewCount={stats.reviewCount}
              typeCounts={{ free: stats.freeCount, bundle: stats.bundleCount, deal: stats.dealCount }}
            />
          </div>

          <div className="flex items-start gap-10 xl:gap-14">
            <div className="hidden lg:block">
              <CatalogFilters
                formats={formats}
                reviewCount={stats.reviewCount}
                typeCounts={{ free: stats.freeCount, bundle: stats.bundleCount, deal: stats.dealCount }}
              />
            </div>

            <div className="min-w-0 flex-1">
              <CatalogToolbar resultCount={products.length} />
              <ProductGrid items={products} clearHref={clearHref} emptyState={emptyState} />
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

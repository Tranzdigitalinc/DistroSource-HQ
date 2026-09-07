import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { CatalogFilters } from "@/components/catalog/catalog-filters"
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar"
import { CategoryPillBar } from "@/components/catalog/category-pill-bar"
import { ProductGrid, type ProductGridEmptyState } from "@/components/catalog/product-grid"
import { getAvailableFileFormats, getCatalogStats, getCategories, getProducts } from "@/lib/queries/catalog"

export async function CatalogPage({ title, subtitle, banner, products, categoryPillBar, clearHref, emptyState }: {
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
          <section className="border-b border-border bg-[#111827] text-white">
            <div className="mx-auto max-w-[1600px] px-4 py-14 sm:px-6 sm:py-18 lg:px-8 lg:py-20">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-primary">DistroSource catalog</p>
              <h1 className="mt-4 max-w-5xl font-display text-[clamp(3.3rem,7vw,7rem)] font-black leading-[0.86] tracking-[-0.075em]">{title}</h1>
              {subtitle && <p className="mt-5 max-w-2xl text-sm leading-7 text-white/50 sm:text-base">{subtitle}</p>}
            </div>
          </section>
        )}

        <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
          {categoryPillBar !== undefined ? categoryPillBar : <CategoryPillBar categories={categories!} />}
          <div className="grid gap-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-12">
            <CatalogFilters formats={formats} reviewCount={stats.reviewCount} typeCounts={{ free: stats.freeCount, bundle: stats.bundleCount, deal: stats.dealCount }} />
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

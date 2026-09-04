import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { CatalogFilters } from "@/components/catalog/catalog-filters"
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar"
import { CategoryPillBar } from "@/components/catalog/category-pill-bar"
import { ProductGrid } from "@/components/catalog/product-grid"
import { CatalogPagination } from "@/components/catalog/catalog-pagination"
import {
  getAvailableFileFormats,
  getAvailableSoftware,
  getCatalogFacets,
  getCatalogStats,
  getCategories,
  getProducts,
  getProductsCount,
  parseProductSort,
} from "@/lib/queries/catalog"

export const metadata = {
  title: "Digital products — DistroSource",
  description: "Templates, dashboards, UI kits, fonts, graphics and development resources. Instant delivery, clear licensing.",
}

const PAGE_SIZE = 24
const FILTER_KEYS = ["q", "free", "bundle", "deal", "maxPrice", "format", "software", "source", "license", "minRating", "category"] as const

export default async function ProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams
  const currentPage = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1)
  const filtered = FILTER_KEYS.some((k) => !!params[k])

  const queryOptions = {
    categorySlug: params.category,
    search: params.q,
    free: params.free === "true",
    bundle: params.bundle === "true",
    deal: params.deal === "true",
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    format: params.format,
    software: params.software,
    source: params.source,
    license: params.license,
    minRating: params.minRating ? Number(params.minRating) : undefined,
    sort: parseProductSort(params.sort),
  }

  const [categories, totalCount, formats, software, facets, stats] = await Promise.all([
    getCategories(),
    getProductsCount(queryOptions),
    getAvailableFileFormats(),
    getAvailableSoftware(),
    getCatalogFacets(),
    getCatalogStats(),
  ])

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)
  const products = await getProducts({ ...queryOptions, limit: PAGE_SIZE, offset: (safePage - 1) * PAGE_SIZE })

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                {params.q ? `Results for “${params.q}”` : "Digital products"}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {params.q
                  ? "Matches across product names, descriptions and categories."
                  : "Templates, dashboards, UI kits, fonts, graphics and development resources. Every product is an instant download with the licence stated up front."}
              </p>
            </div>
            {/* Real count from getProductsCount(), same visibility filter as the grid. */}
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold tabular-nums text-foreground">{totalCount.toLocaleString()}</span> {totalCount === 1 ? "product" : "products"}
            </p>
          </div>

          <CategoryPillBar categories={categories} />

          <div className="flex flex-col gap-8 lg:flex-row">
            <CatalogFilters
              formats={formats}
              software={software}
              sources={facets.sources}
              licenses={facets.licenses}
              reviewCount={stats.reviewCount}
              typeCounts={{ free: stats.freeCount, bundle: stats.bundleCount, deal: stats.dealCount }}
            />
            <div className="min-w-0 flex-1">
              <CatalogToolbar resultCount={totalCount} />
              <ProductGrid items={products} clearHref={filtered ? "/products" : undefined} />
              <CatalogPagination currentPage={safePage} totalPages={totalPages} params={params} />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

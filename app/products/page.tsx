import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { CatalogFilters } from "@/components/catalog/catalog-filters"
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar"
import { CategoryPillBar } from "@/components/catalog/category-pill-bar"
import { ProductGrid } from "@/components/catalog/product-grid"
import { CatalogPagination } from "@/components/catalog/catalog-pagination"
import { PageHeader } from "@/components/page-header"
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
        <div className="container-x py-10 sm:py-12">
          <PageHeader
            eyebrow={params.q ? "Search" : "Catalog"}
            title={params.q ? `Results for “${params.q}”` : "Every digital product"}
            description={
              params.q
                ? "Matches across product names, descriptions and categories."
                : "Templates, dashboards, UI kits, fonts, graphics and development resources. Every product is an instant download with the licence stated up front."
            }
            className="mb-8"
          />

          <div className="mb-6">
            <CategoryPillBar categories={categories} />
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:gap-10">
            <CatalogFilters
              formats={formats}
              software={software}
              sources={facets.sources}
              licenses={facets.licenses}
              reviewCount={stats.reviewCount}
              typeCounts={{ free: stats.freeCount, bundle: stats.bundleCount, deal: stats.dealCount }}
            />
            <div className="min-w-0 flex-1">
              <div className="mb-6 border-b border-border pb-4">
                <CatalogToolbar resultCount={totalCount} />
              </div>
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

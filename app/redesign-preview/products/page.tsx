import { RedesignHeader } from "@/components/redesign/redesign-header"
import { RedesignFooter } from "@/components/redesign/redesign-footer"
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
  getCategoryTree,
  getProducts,
  getProductsCount,
  parseProductSort,
} from "@/lib/queries/catalog"

export const metadata = {
  title: "Redesign preview — Digital products — DistroSource",
  description: "Preview of the redesigned DistroSource digital product catalog.",
}

const PAGE_SIZE = 24
const FILTER_KEYS = ["q", "free", "bundle", "deal", "maxPrice", "format", "software", "source", "license", "minRating", "category"] as const

export default async function RedesignProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams
  const currentPage = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1)
  const filtered = FILTER_KEYS.some((key) => !!params[key])

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

  const [departments, categories, totalCount, formats, software, facets, stats] = await Promise.all([
    getCategoryTree(),
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
    <div className="flex min-h-screen flex-col bg-background">
      <RedesignHeader departments={departments} />
      <main className="flex-1">
        <section className="border-b border-border bg-secondary/20">
          <div className="mx-auto max-w-[1500px] px-6 py-12 sm:px-8 lg:px-10 lg:py-16">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div className="max-w-3xl">
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">DistroSource catalog</p>
                <h1 className="mt-3 font-display text-5xl font-black leading-[0.94] tracking-[-0.05em] text-foreground sm:text-6xl">
                  {params.q ? `Results for “${params.q}”` : "The digital shelf."}
                </h1>
                <p className="mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                  {params.q
                    ? "Matches across product names, descriptions and categories. Refine the result set without leaving the preview experience."
                    : "Templates, dashboards, UI kits, fonts, graphics and development resources — searchable, filterable and built from the live catalog."}
                </p>
              </div>
              <div className="border-l-2 border-primary pl-4">
                <p className="font-display text-3xl font-black tabular-nums text-foreground">{totalCount.toLocaleString()}</p>
                <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-muted-foreground">{totalCount === 1 ? "product" : "products"} visible</p>
              </div>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1500px] px-6 py-10 sm:px-8 lg:px-10 lg:py-14">
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
              <ProductGrid items={products} clearHref={filtered ? "/redesign-preview/products" : undefined} />
              <CatalogPagination currentPage={safePage} totalPages={totalPages} params={params} />
            </div>
          </div>
        </div>
      </main>
      <RedesignFooter />
    </div>
  )
}

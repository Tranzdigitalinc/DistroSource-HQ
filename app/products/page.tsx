import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { CatalogFilters } from "@/components/catalog/catalog-filters"
import { CatalogToolbar } from "@/components/catalog/catalog-toolbar"
import { CategoryPillBar } from "@/components/catalog/category-pill-bar"
import { ProductGrid } from "@/components/catalog/product-grid"
import { CatalogPagination } from "@/components/catalog/catalog-pagination"
import { getAvailableFileFormats, getCategories, getProducts, getProductsCount } from "@/lib/queries/catalog"

export const metadata = {
  title: "All products — DistroSource",
}

const PAGE_SIZE = 24

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const currentPage = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1)

  const queryOptions = {
    categorySlug: params.category,
    search: params.q,
    free: params.free === "true",
    bundle: params.bundle === "true",
    deal: params.deal === "true",
    maxPrice: params.maxPrice ? Number(params.maxPrice) : undefined,
    format: params.format,
    minRating: params.minRating ? Number(params.minRating) : undefined,
    sort: (params.sort as any) ?? "featured",
  }

  const [categories, totalCount, formats] = await Promise.all([
    getCategories(),
    getProductsCount(queryOptions),
    getAvailableFileFormats(),
  ])

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE))
  const safePage = Math.min(currentPage, totalPages)

  const products = await getProducts({
    ...queryOptions,
    limit: PAGE_SIZE,
    offset: (safePage - 1) * PAGE_SIZE,
  })

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
          <div className="mb-6">
            <h1 className="font-display text-3xl font-bold tracking-tight">
              {params.q ? `Results for "${params.q}"` : "All products"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Browse templates, fonts, presentations, and digital products across every category
            </p>
          </div>
          <CategoryPillBar categories={categories} />
          <div className="flex flex-col gap-8 lg:flex-row">
            <CatalogFilters formats={formats} />
            <div className="flex-1">
              <CatalogToolbar resultCount={totalCount} />
              <ProductGrid items={products} />
              <CatalogPagination currentPage={safePage} totalPages={totalPages} params={params} />
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

import { SiteHeader } from "@/components/header/site-header"
import { ProductGridSkeleton } from "@/components/catalog/product-grid-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Rendered instantly by Next while the catalog query runs, so a navigation
 * never lands on a blank page. The shape mirrors app/products/page.tsx —
 * heading, category pills, filter sidebar, grid — so nothing jumps when the
 * real content arrives.
 */
export default function ProductsLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1" aria-busy="true" aria-label="Loading products">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <Skeleton className="h-9 w-64 md:h-10" />
              <Skeleton className="mt-3 h-4 w-full max-w-xl" />
              <Skeleton className="mt-2 h-4 w-2/3 max-w-md" />
            </div>
            <Skeleton className="h-5 w-24" />
          </div>

          <div className="mb-6 flex gap-2 overflow-hidden">
            {Array.from({ length: 7 }, (_, i) => (
              <Skeleton key={i} className="h-8 w-28 shrink-0 rounded-full" />
            ))}
          </div>

          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="w-full lg:w-60">
              <Skeleton className="h-11 w-full rounded-lg lg:hidden" />
              <div className="hidden rounded-lg border border-border bg-card p-4 lg:block">
                {Array.from({ length: 4 }, (_, group) => (
                  <div key={group} className="mb-5 last:mb-0">
                    <Skeleton className="mb-2 h-3 w-20" />
                    {Array.from({ length: 4 }, (_, row) => (
                      <Skeleton key={row} className="mb-1.5 h-6 w-full last:mb-0" />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-9 w-44 rounded-md" />
              </div>
              <ProductGridSkeleton count={12} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

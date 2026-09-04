import { SiteHeader } from "@/components/header/site-header"
import { ProductGridSkeleton } from "@/components/catalog/product-grid-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

/** Matches the category banner + pill nav + grid shape of the real page. */
export default function CategoryLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1" aria-busy="true" aria-label="Loading category">
        <div className="border-b border-border bg-secondary/40">
          <div className="mx-auto flex w-full max-w-7xl items-center gap-4 px-4 py-5 sm:px-6 sm:py-6">
            <Skeleton className="size-12 shrink-0 rounded-lg sm:size-14" />
            <div className="min-w-0 flex-1">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="mt-2 h-7 w-64 sm:h-8" />
              <Skeleton className="mt-2 h-4 w-full max-w-md" />
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10">
          <div className="mb-6 flex gap-2 overflow-hidden">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-8 w-32 shrink-0 rounded-full" />
            ))}
          </div>
          <div className="flex flex-col gap-8 lg:flex-row">
            <div className="w-full lg:w-60">
              <Skeleton className="h-11 w-full rounded-lg lg:hidden" />
              <Skeleton className="hidden h-96 w-full rounded-lg lg:block" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-9 w-44 rounded-md" />
              </div>
              <ProductGridSkeleton count={8} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

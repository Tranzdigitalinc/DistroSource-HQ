import { SiteHeader } from "@/components/header/site-header"
import { Skeleton } from "@/components/ui/skeleton"

/** Mirrors the product page's 60/40 split so the layout does not shift on load. */
export default function ProductLoading() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1" aria-busy="true" aria-label="Loading product">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-8">
          <div className="mb-5 flex items-center gap-2">
            <Skeleton className="h-3 w-12" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12">
            <div className="flex flex-col gap-3">
              <Skeleton className="aspect-[4/3] w-full rounded-lg" />
              <div className="hidden grid-cols-5 gap-2 md:grid">
                {Array.from({ length: 5 }, (_, i) => (
                  <Skeleton key={i} className="aspect-[4/3] rounded-md" />
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <Skeleton className="h-3 w-24" />
                <Skeleton className="mt-3 h-8 w-full max-w-md" />
                <Skeleton className="mt-2 h-4 w-3/4" />
                <Skeleton className="mt-3 h-3 w-40" />
              </div>
              <div className="rounded-lg border border-border bg-card">
                <div className="border-b border-border px-5 py-4">
                  <Skeleton className="h-8 w-28" />
                  <Skeleton className="mt-2 h-3 w-44" />
                </div>
                <div className="flex flex-col gap-2 border-b border-border px-5 py-4">
                  {Array.from({ length: 3 }, (_, i) => (
                    <Skeleton key={i} className="h-14 w-full rounded-md" />
                  ))}
                </div>
                <div className="flex flex-col gap-2.5 px-5 py-4">
                  <Skeleton className="h-11 w-full rounded-lg" />
                  <Skeleton className="h-11 w-full rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

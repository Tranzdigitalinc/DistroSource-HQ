import { Skeleton } from "@/components/ui/skeleton"

export function ProductGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 pt-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" aria-label="Loading products" role="status">
      {Array.from({ length: count }, (_, index) => (
        <div key={index} className="overflow-hidden rounded-xl border border-border bg-card">
          <Skeleton className="aspect-square w-full rounded-none" />
          <div className="flex flex-col gap-3 p-3">
            <Skeleton className="h-3 w-2/5" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-3 w-3/5" />
            <div className="flex items-center justify-between gap-2 pt-1">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-8 w-8 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
      <span className="sr-only">Loading product catalog</span>
    </div>
  )
}

import { ProductGridSkeleton } from "@/components/catalog/product-grid-skeleton"
import { Skeleton } from "@/components/ui/skeleton"

export default function ProductsLoading() {
  return (
    <main className="mx-auto w-full max-w-7xl px-6 py-10 sm:px-8">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
      <div className="mt-8 flex flex-col gap-8 lg:flex-row">
        <Skeleton className="h-96 w-full rounded-xl lg:w-64" />
        <div className="flex-1">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-48 rounded-md" />
          </div>
          <ProductGridSkeleton />
        </div>
      </div>
    </main>
  )
}

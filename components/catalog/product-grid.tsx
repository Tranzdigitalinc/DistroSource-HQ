import { PackageSearch } from "lucide-react"
import { ProductCard } from "@/components/product/product-card"
import type { getProducts } from "@/lib/queries/catalog"

export function ProductGrid({ items }: { items: Awaited<ReturnType<typeof getProducts>> }) {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 py-20 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <PackageSearch className="size-6" />
        </div>
        <h3 className="font-display text-lg font-bold">No products found</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Try adjusting your filters or search terms to find what you&apos;re looking for.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 pt-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((item) => (
        <ProductCard key={item.product.id} item={item} />
      ))}
    </div>
  )
}

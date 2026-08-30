import { PackageSearch } from "lucide-react"
import { ProductCard, type ProductCardData } from "@/components/product/product-card"
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal"

export function ProductGrid({ items }: { items: ProductCardData[] }) {
  if (items.length === 0) {
    return (
      <Reveal className="flex flex-col items-center gap-3 py-20 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <PackageSearch className="size-6" />
        </div>
        <h3 className="font-display text-lg font-bold">No products found</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Try adjusting your filters or search terms to find what you&apos;re looking for.
        </p>
      </Reveal>
    )
  }

  return (
    <RevealGroup className="grid grid-cols-2 gap-4 pt-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" stagger={0.04}>
      {items.map((item) => (
        <RevealItem key={item.product.id}>
          <ProductCard item={item} />
        </RevealItem>
      ))}
    </RevealGroup>
  )
}

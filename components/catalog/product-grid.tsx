import Link from "next/link"
import { ArrowRight, SearchEmpty, ICON_SIZE } from "@/lib/storefront-icons"
import { ProductCard, type ProductCardData } from "@/components/product/product-card"
import { Button } from "@/components/ui/button"
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal"

export interface ProductGridEmptyState {
  title: string
  description: string
}

export function ProductGrid({
  items,
  clearHref,
  emptyState,
}: {
  items: ProductCardData[]
  clearHref?: string
  /** Override the "nothing matches" copy when the emptiness isn't caused by filters. */
  emptyState?: ProductGridEmptyState
}) {
  if (items.length === 0) {
    const title = emptyState?.title ?? "Nothing matches those filters"
    const description =
      emptyState?.description ??
      "Try removing a filter or broadening the search term. Every product shows its licence and delivery details before you buy."
    return (
      <Reveal className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-lg border border-border bg-card px-6 py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <SearchEmpty size={ICON_SIZE.feature} aria-hidden="true" />
        </span>
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">{title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          {clearHref && (
            <Button size="sm" render={<Link href={clearHref} />} nativeButton={false} className="font-semibold">
              Clear filters
            </Button>
          )}
          <Button size="sm" variant="outline" render={<Link href="/categories" />} nativeButton={false} className="bg-transparent font-semibold">
            Browse departments
            <ArrowRight size={ICON_SIZE.sm} aria-hidden="true" />
          </Button>
        </div>
      </Reveal>
    )
  }

  return (
    <RevealGroup className="grid grid-cols-2 gap-4 pt-6 sm:grid-cols-3 lg:grid-cols-4" stagger={0.03}>
      {items.map((item) => (
        <RevealItem key={item.product.id} className="h-full">
          <ProductCard item={item} />
        </RevealItem>
      ))}
    </RevealGroup>
  )
}

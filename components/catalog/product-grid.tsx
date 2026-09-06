import Link from "next/link"
import { ArrowRight, SearchEmpty } from "@/lib/storefront-icons"
import { V4ProductCard, type V4ProductCardData } from "@/components/v4/product-card"
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
  items: V4ProductCardData[]
  clearHref?: string
  emptyState?: ProductGridEmptyState
}) {
  if (items.length === 0) {
    const title = emptyState?.title ?? "Nothing matches yet."
    const description = emptyState?.description ?? "Try removing a filter, changing the search, or exploring another department."

    return (
      <Reveal className="flex min-h-[460px] flex-col items-center justify-center rounded-[32px] border border-dashed border-border bg-secondary/30 px-6 text-center">
        <span className="flex size-16 items-center justify-center rounded-full bg-background text-muted-foreground shadow-sm"><SearchEmpty size={24} /></span>
        <h3 className="mt-6 font-display text-3xl font-black tracking-[-0.045em] text-foreground">{title}</h3>
        <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">{description}</p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
          {clearHref && <Link href={clearHref} className="inline-flex h-11 items-center rounded-full bg-foreground px-5 text-sm font-semibold text-background">Clear filters</Link>}
          <Link href="/categories" className="group inline-flex h-11 items-center gap-2 rounded-full border border-border px-5 text-sm font-semibold transition-colors hover:bg-secondary">
            Browse departments <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </Reveal>
    )
  }

  return (
    <RevealGroup className="grid grid-cols-2 gap-x-3 gap-y-8 pt-7 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-3 xl:grid-cols-4" stagger={0.025}>
      {items.map((item) => (
        <RevealItem key={item.product.id} className="h-full">
          <V4ProductCard item={item} />
        </RevealItem>
      ))}
    </RevealGroup>
  )
}

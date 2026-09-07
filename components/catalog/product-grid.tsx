import Link from "next/link"
import { ArrowRight, SearchEmpty } from "@/lib/storefront-icons"
import { V5ProductCard, type V5ProductCardData } from "@/components/v5/product-card"

export interface ProductGridEmptyState {
  title: string
  description: string
}

export function ProductGrid({ items, clearHref, emptyState }: { items: V5ProductCardData[]; clearHref?: string; emptyState?: ProductGridEmptyState }) {
  if (items.length === 0) {
    const title = emptyState?.title ?? "Nothing matches those filters"
    const description = emptyState?.description ?? "Try removing a filter or broadening the search term."
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center border-y border-border px-6 py-20 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground"><SearchEmpty size={22} /></span>
        <h3 className="mt-5 font-display text-2xl font-black tracking-[-0.04em]">{title}</h3>
        <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
        <div className="mt-6 flex items-center gap-3">
          {clearHref && <Link href={clearHref} className="bg-foreground px-4 py-2.5 text-sm font-semibold text-background">Clear filters</Link>}
          <Link href="/categories" className="group inline-flex items-center gap-2 px-2 py-2 text-sm font-semibold">Browse departments <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" /></Link>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-8 pt-6 sm:grid-cols-2 md:gap-x-5 lg:grid-cols-3 xl:gap-x-6 xl:gap-y-10">
      {items.map((item) => <V5ProductCard key={item.product.id} item={item} />)}
    </div>
  )
}

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { ProductCard } from "@/components/product/product-card"
import type { getProducts } from "@/lib/queries/catalog"

export function ProductRail({
  title,
  subtitle,
  href,
  items,
}: {
  title: string
  subtitle?: string
  href: string
  items: Awaited<ReturnType<typeof getProducts>>
}) {
  if (items.length === 0) return null

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
        </div>
        <Link
          href={href}
          className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View all
          <ArrowRight className="size-4" />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {items.slice(0, 12).map((item) => (
          <ProductCard key={item.product.id} item={item} />
        ))}
      </div>
    </section>
  )
}

import Link from "next/link"
import { ArrowRight, Flame, Sparkles } from "lucide-react"
import { ProductCard } from "@/components/product/product-card"
import { RevealGroup, RevealItem } from "@/components/motion/reveal"
import type { getProducts } from "@/lib/queries/catalog"

export function ProductRail({
  title,
  subtitle,
  href,
  items,
  variant = "default",
}: {
  title: string
  subtitle?: string
  href: string
  items: Awaited<ReturnType<typeof getProducts>>
  variant?: "default" | "deals"
}) {
  if (items.length === 0) return null

  const Icon = variant === "deals" ? Flame : Sparkles

  return (
    <section className="mx-auto max-w-7xl px-6 py-10 sm:px-8">
      <div className="mb-6 flex items-end justify-between">
        <div className="flex items-start gap-3">
          {variant === "deals" && (
            <span className="mt-1 flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500/15 to-orange-500/15">
              <Icon className="size-4 text-amber-500" />
            </span>
          )}
          <div>
            <h2 className="font-display text-2xl font-medium tracking-tight sm:text-3xl">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        <Link
          href={href}
          className="flex shrink-0 items-center gap-1 rounded-full border border-border px-3.5 py-1.5 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          View all
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
      <RevealGroup className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6" stagger={0.05}>
        {items.slice(0, 12).map((item) => (
          <RevealItem key={item.product.id}>
            <ProductCard item={item} />
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  )
}

import Link from "next/link"
import { GamingProductCard } from "@/components/gaming/gaming-product-card"
import { ArrowUpRight } from "@/lib/storefront-icons"
import type { GamingProduct } from "@/lib/gaming/types"
import { cn } from "@/lib/utils"

/**
 * One curated row of Gaming products. Renders nothing when the section is
 * empty, so a platform page never shows a heading over a blank grid.
 */
export function GamingRail({
  title,
  subtitle,
  href,
  products,
  tone = "default",
  limit = 4,
}: {
  title: string
  subtitle?: string
  href?: string
  products: GamingProduct[]
  tone?: "default" | "muted"
  limit?: number
}) {
  if (products.length === 0) return null

  return (
    <section className={cn("border-b border-border", tone === "muted" && "bg-secondary/30")}>
      <div className="mx-auto max-w-7xl px-6 py-12 sm:px-8">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-bold tracking-tight sm:text-2xl">{title}</h2>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          {href && (
            <Link
              href={href}
              className="flex items-center gap-1 font-mono text-xs font-semibold uppercase tracking-[0.04em] text-primary hover:underline"
            >
              View all
              <ArrowUpRight className="size-3.5" />
            </Link>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, limit).map((product) => (
            <GamingProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

import Link from "next/link"
import { GamingProductCard } from "@/components/gaming/gaming-product-card"
import { Button } from "@/components/ui/button"
import { ArrowRight, GameController, ICON_SIZE } from "@/lib/storefront-icons"
import { getFeaturedGamingProducts } from "@/lib/gaming/queries"

/**
 * Gaming's presence on the main homepage: one band, four products, one way
 * in. Deliberately the same size as any other section — Gaming is a new
 * department inside DistroSource, not a takeover of the front page.
 */
export function GamingTeaser() {
  const products = getFeaturedGamingProducts(4)
  if (products.length === 0) return null

  return (
    <section className="border-y border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="flex items-center gap-2 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <GameController size={ICON_SIZE.sm} aria-hidden="true" />
              Explore DistroSource Gaming
            </p>
            <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">Digital resources built for gaming.</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              FiveM maps and MLOs, Minecraft server packs, interfaces and configurations — sold directly by DistroSource.
            </p>
          </div>
          <Button
            variant="outline"
            className="bg-transparent font-semibold"
            nativeButton={false}
            render={<Link href="/gaming" />}
          >
            Explore Gaming
            <ArrowRight size={ICON_SIZE.base} aria-hidden="true" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((product) => (
            <GamingProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  )
}

import Link from "next/link"
import { GamingProductCard } from "@/components/gaming/gaming-product-card"
import { ArrowRight, GameController } from "@/lib/storefront-icons"
import { getFeaturedGamingProducts } from "@/lib/gaming/queries"

export function GamingTeaser() {
  const products = getFeaturedGamingProducts(4)
  if (products.length === 0) return null

  return (
    <section className="bg-navy text-navy-foreground">
      <div className="mx-auto max-w-[94rem] px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-10 lg:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.7fr)] lg:items-end">
          <div className="max-w-xl">
            <span className="flex size-11 items-center justify-center rounded-xl border border-navy-foreground/12 bg-navy-foreground/5 text-primary">
              <GameController size={21} aria-hidden="true" />
            </span>
            <p className="mt-6 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-primary">DistroSource Gaming</p>
            <h2 className="mt-3 font-display text-4xl font-black leading-[0.96] tracking-[-0.045em] sm:text-5xl">
              Built for the worlds people play in.
            </h2>
            <p className="mt-4 text-sm leading-6 text-navy-foreground/58 sm:text-base">
              FiveM maps and MLOs, Minecraft server resources, interfaces and configurations — a dedicated gaming department inside DistroSource.
            </p>
            <Link href="/gaming" className="group mt-7 inline-flex items-center gap-2 text-sm font-bold text-navy-foreground hover:text-primary">
              Explore Gaming
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:gap-4">
            {products.map((product) => (
              <GamingProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

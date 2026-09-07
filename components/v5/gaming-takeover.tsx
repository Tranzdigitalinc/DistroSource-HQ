import Link from "next/link"
import { GamingPreview } from "@/components/gaming/gaming-preview"
import { getFeaturedGamingProducts } from "@/lib/gaming/queries"
import { ArrowRight, GameController } from "@/lib/storefront-icons"
import { formatUsd } from "@/lib/format"
import { PLATFORM_LABEL } from "@/lib/gaming/types"

export function V5GamingTakeover() {
  const products = getFeaturedGamingProducts(3)
  if (!products.length) return null

  return (
    <section className="overflow-hidden bg-[#07111f] py-18 text-white sm:py-22 lg:py-26">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
          <div>
            <p className="flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-primary"><GameController size={15} /> DistroSource Gaming</p>
            <h2 className="mt-4 max-w-3xl font-display text-[clamp(3.2rem,7vw,7rem)] font-black leading-[0.84] tracking-[-0.075em]">Built for the worlds you run.</h2>
          </div>
          <div className="lg:justify-self-end">
            <p className="max-w-xl text-sm leading-7 text-white/48">Premium FiveM, Minecraft and server resources sold directly by DistroSource through dedicated gaming checkout.</p>
            <Link href="/gaming" className="group mt-5 inline-flex items-center gap-2 text-sm font-semibold text-white">Explore Gaming <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></Link>
          </div>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-[1.25fr_0.75fr]">
          {products.slice(0, 1).map((product) => (
            <Link key={product.id} href={`/gaming/product/${product.slug}`} className="group relative min-h-[480px] overflow-hidden border border-white/10 bg-white/[0.03]">
              <GamingPreview art={product.art[0]} caption={false} className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-[1.025]" />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
                <p className="font-mono text-[9px] font-black uppercase tracking-[0.12em] text-white/45">{PLATFORM_LABEL[product.platform]}</p>
                <h3 className="mt-2 max-w-3xl font-display text-4xl font-black leading-[0.92] tracking-[-0.055em] sm:text-5xl">{product.title}</h3>
                <div className="mt-5 flex items-center gap-4"><span className="font-display text-2xl font-black text-primary">{formatUsd(product.price)}</span><span className="flex size-10 items-center justify-center rounded-full bg-white text-black"><ArrowRight size={14} /></span></div>
              </div>
            </Link>
          ))}

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {products.slice(1).map((product) => (
              <Link key={product.id} href={`/gaming/product/${product.slug}`} className="group relative min-h-[230px] overflow-hidden border border-white/10 bg-white/[0.03]">
                <GamingPreview art={product.art[0]} caption={false} className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-[1.03]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5"><p className="font-mono text-[9px] uppercase tracking-[0.1em] text-white/45">{PLATFORM_LABEL[product.platform]}</p><h3 className="mt-1 font-display text-2xl font-black tracking-[-0.04em]">{product.title}</h3><p className="mt-2 font-display text-lg font-black text-primary">{formatUsd(product.price)}</p></div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

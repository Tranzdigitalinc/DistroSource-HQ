import Image from "next/image"
import Link from "next/link"
import { GamingPreview } from "@/components/gaming/gaming-preview"
import { TebexBuyButton } from "@/components/gaming/tebex-buy-button"
import { getFeaturedGamingProducts } from "@/lib/gaming/queries"
import { hasRealImages, resolveGamingImage } from "@/lib/gaming/images"
import { CATEGORY_LABEL, PLATFORM_LABEL } from "@/lib/gaming/types"
import { formatUsd } from "@/lib/format"
import { ArrowRight, GameController } from "@/lib/storefront-icons"

export function V4GamingFeature() {
  const products = getFeaturedGamingProducts(3)
  if (!products.length) return null

  const lead = products[0]
  const rest = products.slice(1)

  return (
    <section className="overflow-hidden bg-[oklch(0.12_0.02_255)] py-20 text-white sm:py-24 lg:py-28">
      <div className="mx-auto max-w-[1540px] px-4 sm:px-6 lg:px-8">
        <div className="mb-10 grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-4xl">
            <p className="flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-primary">
              <GameController size={15} /> DistroSource Gaming
            </p>
            <h2 className="mt-4 font-display text-[clamp(2.7rem,6vw,6.4rem)] font-black leading-[0.88] tracking-[-0.07em]">
              Your server deserves
              <span className="block text-white/32">better than default.</span>
            </h2>
          </div>
          <Link href="/gaming" className="group inline-flex h-12 items-center gap-3 rounded-full border border-white/15 px-5 text-sm font-semibold transition-colors hover:bg-white hover:text-black">
            Explore Gaming
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.45fr_0.55fr] lg:gap-5">
          <article className="group relative overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.04]">
            <Link href={`/gaming/product/${lead.slug}`} className="relative block min-h-[420px] sm:min-h-[520px]">
              {hasRealImages(lead.images) ? (
                <Image src={resolveGamingImage(lead.images[0])} alt={lead.title} fill sizes="(max-width: 1024px) 100vw, 65vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.025]" />
              ) : (
                <GamingPreview art={lead.art[0]} caption={false} className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-[1.025]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/15 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8 lg:p-10">
                <div className="flex flex-wrap gap-2 font-mono text-[9px] font-black uppercase tracking-[0.1em] text-white/60">
                  <span>{PLATFORM_LABEL[lead.platform]}</span><span>/</span><span>{CATEGORY_LABEL[lead.category]}</span>
                </div>
                <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <h3 className="max-w-2xl font-display text-3xl font-black leading-[0.96] tracking-[-0.05em] sm:text-5xl">{lead.title}</h3>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-white/60">{lead.shortDescription}</p>
                  </div>
                  <div className="relative z-10 flex shrink-0 items-center gap-3">
                    <span className="font-display text-2xl font-black">{formatUsd(lead.price)}</span>
                    <TebexBuyButton product={lead} label="Buy now" className="h-11 rounded-full px-5" />
                  </div>
                </div>
              </div>
            </Link>
          </article>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 lg:gap-5">
            {rest.map((product) => (
              <article key={product.id} className="group flex min-h-[250px] flex-col overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.04]">
                <Link href={`/gaming/product/${product.slug}`} className="relative block flex-1 overflow-hidden">
                  {hasRealImages(product.images) ? (
                    <Image src={resolveGamingImage(product.images[0])} alt={product.title} fill sizes="(max-width: 1024px) 50vw, 30vw" className="object-cover transition-transform duration-700 group-hover:scale-[1.04]" />
                  ) : (
                    <GamingPreview art={product.art[0]} caption={false} className="absolute inset-0 h-full w-full" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-5">
                    <p className="font-mono text-[9px] font-black uppercase tracking-[0.1em] text-white/55">{PLATFORM_LABEL[product.platform]}</p>
                    <h3 className="mt-1 font-display text-xl font-black tracking-[-0.035em]">{product.title}</h3>
                    <p className="mt-2 font-display text-base font-black text-primary">{formatUsd(product.price)}</p>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

import Link from "next/link"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { V4GamingCard } from "@/components/v4/gaming-card"
import { ArrowRight, GameController } from "@/lib/storefront-icons"
import { filterGamingProducts } from "@/lib/gaming/queries"
import { CATEGORY_LABEL, PLATFORM_LABEL, type GamingCategory, type GamingPlatform } from "@/lib/gaming/types"

export function V4GamingPlatformPage({
  platform,
  eyebrow,
  title,
  description,
}: {
  platform: GamingPlatform
  eyebrow: string
  title: string
  description: string
}) {
  const all = filterGamingProducts({ platform })
  const featured = all.filter((product) => product.featured || product.bestseller)
  const latest = filterGamingProducts({ platform, sort: "newest" })
  const categories = Array.from(new Set(all.map((product) => product.category))) as GamingCategory[]
  const lead = featured[0] ?? all[0]
  const supporting = (featured.length > 1 ? featured.slice(1) : all.filter((product) => product.id !== lead?.id)).slice(0, 2)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 bg-[oklch(0.105_0.018_255)] text-white">
        <section className="relative overflow-hidden border-b border-white/10">
          <div aria-hidden="true" className="absolute -right-52 -top-64 size-[46rem] rounded-full bg-primary/20 blur-[130px]" />
          <div className="relative mx-auto max-w-[1540px] px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8 lg:pb-24 lg:pt-24">
            <p className="flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-primary"><GameController size={14} /> {eyebrow}</p>
            <h1 className="mt-5 max-w-6xl font-display text-[clamp(3.5rem,8.5vw,8.6rem)] font-black leading-[0.8] tracking-[-0.085em]">{title}</h1>
            <div className="mt-7 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
              <p className="max-w-2xl text-sm leading-7 text-white/48 sm:text-base">{description}</p>
              <Link href={`/gaming/products?platform=${platform}`} className="group inline-flex h-12 shrink-0 items-center gap-3 rounded-full bg-white px-5 text-sm font-bold text-black">Browse all {PLATFORM_LABEL[platform]} <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></Link>
            </div>

            {lead && (
              <div className="mt-14 grid gap-4 lg:grid-cols-[1.45fr_0.55fr]">
                <V4GamingCard product={lead} feature />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">{supporting.map((product) => <V4GamingCard key={product.id} product={product} />)}</div>
              </div>
            )}
          </div>
        </section>

        {categories.length > 0 && (
          <section className="border-b border-white/10 py-16 sm:py-20">
            <div className="mx-auto max-w-[1540px] px-4 sm:px-6 lg:px-8">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-primary">Explore by category</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <Link key={category} href={`/gaming/products?platform=${platform}&category=${category}`} className="group inline-flex h-11 items-center gap-3 rounded-full border border-white/10 px-4 text-sm font-semibold text-white/65 transition-colors hover:bg-white hover:text-black">
                    {CATEGORY_LABEL[category]}
                    <span className="font-mono text-[9px] opacity-45">{all.filter((product) => product.category === category).length}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="py-20 sm:py-24">
          <div className="mx-auto max-w-[1540px] px-4 sm:px-6 lg:px-8">
            <div className="mb-9 flex items-end justify-between gap-4">
              <div><p className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-primary">The collection</p><h2 className="mt-3 font-display text-[clamp(2.5rem,5vw,5rem)] font-black leading-[0.9] tracking-[-0.06em]">Built for {PLATFORM_LABEL[platform]}.</h2></div>
              <p className="hidden text-sm text-white/35 sm:block">{all.length} products</p>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 sm:gap-y-11 lg:grid-cols-4">{all.slice(0, 12).map((product) => <V4GamingCard key={product.id} product={product} />)}</div>
          </div>
        </section>

        {latest.length > 0 && (
          <section className="border-t border-white/10 bg-white/[0.02] py-16 sm:py-20">
            <div className="mx-auto max-w-[1540px] px-4 sm:px-6 lg:px-8">
              <div className="mb-8"><p className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-primary">Latest</p><h2 className="mt-3 font-display text-4xl font-black tracking-[-0.055em]">Newest {PLATFORM_LABEL[platform]} releases.</h2></div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 lg:grid-cols-4">{latest.slice(0, 8).map((product) => <V4GamingCard key={product.id} product={product} />)}</div>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}

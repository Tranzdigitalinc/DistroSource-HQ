import Link from "next/link"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { GamingPreview } from "@/components/gaming/gaming-preview"
import { GamingProductCard } from "@/components/gaming/gaming-product-card"
import { ArrowRight } from "@/lib/storefront-icons"
import { filterGamingProducts } from "@/lib/gaming/queries"
import { CATEGORY_LABEL, type GamingPlatform } from "@/lib/gaming/types"

export function V5GamingPlatformPage({ platform, eyebrow, title, description }: { platform: GamingPlatform; eyebrow: string; title: string; description: string }) {
  const all = filterGamingProducts({ platform })
  const featured = all.filter((product) => product.featured || product.bestseller).slice(0, 5)
  const lead = featured[0] ?? all[0]
  const supporting = (featured.length > 1 ? featured.slice(1) : all.filter((product) => product.id !== lead?.id)).slice(0, 4)
  const categories = [...new Set(all.map((product) => product.category))].slice(0, 8)

  return (
    <div className="flex min-h-screen flex-col bg-[#07111f] text-white">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-white/10">
          <div aria-hidden="true" className="absolute -right-44 -top-32 size-[42rem] rounded-full bg-primary/15 blur-[130px]" />
          <div className="relative mx-auto max-w-[1600px] px-4 py-14 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
              <div>
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
                <h1 className="mt-5 font-display text-[clamp(3.8rem,8vw,8rem)] font-black leading-[0.82] tracking-[-0.08em]">{title}</h1>
                <p className="mt-6 max-w-xl text-sm leading-7 text-white/48 sm:text-base">{description}</p>
                <div className="mt-7 flex flex-wrap gap-3"><Link href={`/gaming/products?platform=${platform}`} className="group inline-flex h-12 items-center gap-3 bg-white px-5 text-sm font-black text-[#07111f]">Browse all {all.length} products <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></Link><Link href="/gaming" className="inline-flex h-12 items-center border border-white/15 px-5 text-sm font-semibold text-white/65 hover:text-white">All Gaming</Link></div>
              </div>
              {lead && <Link href={`/gaming/product/${lead.slug}`} className="group relative block min-h-[380px] overflow-hidden border border-white/10 bg-white/[0.03] sm:min-h-[500px]"><GamingPreview art={lead.art[0]} caption={false} className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-[1.025]" /><div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-6 sm:p-8"><p className="font-mono text-[9px] font-black uppercase tracking-[0.12em] text-white/40">Platform pick</p><h2 className="mt-2 max-w-3xl font-display text-3xl font-black leading-[0.94] tracking-[-0.055em] sm:text-5xl">{lead.title}</h2><span className="mt-5 inline-flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground"><ArrowRight size={14} /></span></div></Link>}
            </div>
          </div>
        </section>

        {categories.length > 0 && <nav aria-label={`${eyebrow} categories`} className="border-b border-white/10"><div className="mx-auto flex max-w-[1600px] gap-0 overflow-x-auto px-4 sm:px-6 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">{categories.map((category) => <Link key={category} href={`/gaming/products?platform=${platform}&category=${category}`} className="shrink-0 border-r border-white/10 px-4 py-4 font-mono text-[9px] font-black uppercase tracking-[0.09em] text-white/40 transition-colors first:border-l hover:bg-white/[0.04] hover:text-white">{CATEGORY_LABEL[category]}</Link>)}</div></nav>}

        {supporting.length > 0 && <section className="py-16 sm:py-20 lg:py-24"><div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8"><div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-[9px] font-black uppercase tracking-[0.14em] text-primary">Curated edit</p><h2 className="mt-3 font-display text-[clamp(2.7rem,5vw,5.2rem)] font-black leading-[0.9] tracking-[-0.065em]">Start with these.</h2></div><Link href={`/gaming/products?platform=${platform}`} className="group inline-flex items-center gap-2 text-sm font-semibold">View catalog <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></Link></div><div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">{supporting.map((product) => <GamingProductCard key={product.id} product={product} className="[&_h3]:text-white [&_.text-foreground]:text-white [&_.text-muted-foreground]:text-white/45 [&_.border-border]:border-white/10" />)}</div></div></section>}

        <section className="border-t border-white/10 bg-[#0b1523] py-16 sm:py-20 lg:py-24"><div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8"><div className="mb-8"><p className="font-mono text-[9px] font-black uppercase tracking-[0.14em] text-primary">Full platform catalog</p><h2 className="mt-3 font-display text-[clamp(2.7rem,5vw,5rem)] font-black leading-[0.9] tracking-[-0.06em]">Everything for {eyebrow.replace(" Resources", "")}.</h2></div><div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 xl:grid-cols-5">{all.slice(0, 10).map((product) => <GamingProductCard key={product.id} product={product} className="[&_h3]:text-white [&_.text-foreground]:text-white [&_.text-muted-foreground]:text-white/45 [&_.border-border]:border-white/10" />)}</div>{all.length > 10 && <div className="mt-10 text-center"><Link href={`/gaming/products?platform=${platform}`} className="inline-flex h-12 items-center gap-3 border border-white/15 px-5 text-sm font-semibold">See all {all.length} products <ArrowRight size={14} /></Link></div>}</div></section>
      </main>
      <SiteFooter />
    </div>
  )
}

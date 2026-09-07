import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { GamingPreview } from "@/components/gaming/gaming-preview"
import { GamingProductCard } from "@/components/gaming/gaming-product-card"
import { ArrowRight, GameController } from "@/lib/storefront-icons"
import { getFeaturedGamingProducts, getGamingFacets, getGamingProductsByPlatform } from "@/lib/gaming/queries"
import type { GamingArt } from "@/lib/gaming/types"

export const metadata: Metadata = {
  title: "Gaming Resources, FiveM Assets & Minecraft Products | DistroSource",
  description: "Premium digital resources for games, servers and gaming communities — sold directly by DistroSource.",
  alternates: { canonical: "/gaming" },
}

const platforms: { label: string; href: string; blurb: string; count: (fivem: number, minecraft: number, other: number) => number; art: GamingArt }[] = [
  { label: "FiveM", href: "/gaming/fivem", blurb: "Maps, MLOs, UI, gameplay systems and server essentials for modern communities.", count: (fivem) => fivem, art: { scene: "interior", caption: "FIVEM", tone: "showroom", props: ["car", "desk", "sofa", "plant"] } },
  { label: "Minecraft", href: "/gaming/minecraft", blurb: "Worlds, resource packs, server packs, configurations and plugins for Java servers.", count: (_, minecraft) => minecraft, art: { scene: "world", caption: "MINECRAFT", sky: "day", structures: ["castle", "tree", "house", "path", "pine", "water"] } },
  { label: "Game Servers", href: "/gaming/products?platform=other", blurb: "Cross-platform resources, branding and operational packs for online communities.", count: (_, __, other) => other, art: { scene: "pack", caption: "SERVER RESOURCES", items: ["Community assets", "Server resources", "Staff pack", "Launch kit"] } },
]

export default function GamingLandingPage() {
  const featured = getFeaturedGamingProducts(7)
  const facets = getGamingFacets()
  const fivemCount = getGamingProductsByPlatform("fivem").length
  const minecraftCount = getGamingProductsByPlatform("minecraft").length
  const otherCount = facets.platforms.other ?? 0
  const lead = featured[0]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-[#07111f] text-white">
          <div aria-hidden="true" className="absolute -right-40 top-0 size-[42rem] rounded-full bg-primary/14 blur-[130px]" />
          <div className="relative mx-auto max-w-[1600px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
            <div className="grid gap-12 lg:grid-cols-[0.82fr_1.18fr] lg:items-end">
              <div>
                <p className="flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-primary"><GameController size={15} /> DistroSource Gaming</p>
                <h1 className="mt-5 font-display text-[clamp(4rem,9vw,9rem)] font-black leading-[0.82] tracking-[-0.085em]">Build a better world.</h1>
                <p className="mt-6 max-w-xl text-sm leading-7 text-white/50 sm:text-base">Premium resources for FiveM, Minecraft and game servers—selected, packaged and sold directly by DistroSource.</p>
                <div className="mt-7 flex flex-wrap gap-3"><Link href="/gaming/products" className="group inline-flex h-12 items-center gap-3 bg-white px-5 text-sm font-black text-[#07111f]">Browse all products <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></Link><span className="inline-flex h-12 items-center border border-white/15 px-4 font-mono text-[9px] uppercase tracking-[0.1em] text-white/45">Checkout powered by Tebex</span></div>
              </div>
              {lead && <Link href={`/gaming/product/${lead.slug}`} className="group relative block min-h-[380px] overflow-hidden border border-white/10 bg-white/[0.03] sm:min-h-[500px]"><GamingPreview art={lead.art[0]} caption={false} className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-[1.025]" /><div className="absolute inset-0 bg-gradient-to-t from-black via-black/10 to-transparent" /><div className="absolute inset-x-0 bottom-0 p-6 sm:p-8"><p className="font-mono text-[9px] font-black uppercase tracking-[0.12em] text-white/45">Featured drop</p><h2 className="mt-2 max-w-3xl font-display text-3xl font-black leading-[0.94] tracking-[-0.055em] sm:text-5xl">{lead.title}</h2><span className="mt-5 inline-flex size-11 items-center justify-center rounded-full bg-primary text-primary-foreground"><ArrowRight size={14} /></span></div></Link>}
            </div>
          </div>
        </section>

        <section className="bg-[#07111f] pb-16 text-white sm:pb-20">
          <div className="mx-auto grid max-w-[1600px] border-l border-t border-white/10 px-0 sm:grid-cols-3">
            {platforms.map((platform) => {
              const count = platform.count(fivemCount, minecraftCount, otherCount)
              return <Link key={platform.label} href={platform.href} className="group grid min-h-[320px] grid-rows-[1fr_auto] overflow-hidden border-b border-r border-white/10"><div className="relative min-h-44 overflow-hidden"><GamingPreview art={platform.art} caption={false} className="absolute inset-0 h-full w-full opacity-75 transition-[transform,opacity] duration-700 group-hover:scale-[1.03] group-hover:opacity-100" /><div className="absolute inset-0 bg-gradient-to-t from-[#07111f] via-transparent to-transparent" /></div><div className="p-5 sm:p-6"><div className="flex items-start justify-between gap-4"><h3 className="font-display text-3xl font-black tracking-[-0.05em]">{platform.label}</h3><span className="font-mono text-[9px] text-white/35">{count}</span></div><p className="mt-2 text-xs leading-5 text-white/45">{platform.blurb}</p><span className="mt-5 inline-flex items-center gap-2 text-xs font-bold">Explore <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" /></span></div></Link>
            })}
          </div>
        </section>

        {featured.length > 1 && <section className="bg-[#0b1523] py-16 text-white sm:py-20 lg:py-24"><div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8"><div className="mb-8 flex flex-wrap items-end justify-between gap-5"><div><p className="font-mono text-[9px] font-black uppercase tracking-[0.14em] text-primary">Curated now</p><h2 className="mt-3 font-display text-[clamp(2.8rem,5vw,5.5rem)] font-black leading-[0.9] tracking-[-0.065em]">Products worth installing.</h2></div><Link href="/gaming/products" className="group inline-flex items-center gap-2 text-sm font-semibold">Full catalog <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></Link></div><div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">{featured.slice(1).map((product) => <GamingProductCard key={product.id} product={product} className="[&_h3]:text-white [&_.text-foreground]:text-white [&_.text-muted-foreground]:text-white/45 [&_.border-border]:border-white/10" />)}</div></div></section>}
      </main>
      <SiteFooter />
    </div>
  )
}

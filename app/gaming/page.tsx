import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { GamingPreview } from "@/components/gaming/gaming-preview"
import { V4GamingCard } from "@/components/v4/gaming-card"
import { ArrowRight, GameController, ShieldCheck } from "@/lib/storefront-icons"
import { filterGamingProducts, getFeaturedGamingProducts, getGamingFacets, getGamingProductsByPlatform } from "@/lib/gaming/queries"
import { GAMING_CATEGORIES, type GamingArt } from "@/lib/gaming/types"

export const metadata: Metadata = {
  title: "Gaming Resources, FiveM Assets & Minecraft Products | DistroSource",
  description: "Premium digital resources for games, servers and online gaming communities — sold directly by DistroSource.",
  alternates: { canonical: "/gaming" },
}

const platforms: { id: "fivem" | "minecraft" | "other"; label: string; href: string; blurb: string; art: GamingArt }[] = [
  {
    id: "fivem",
    label: "FiveM",
    href: "/gaming/fivem",
    blurb: "Maps, MLOs, interfaces, gameplay systems and server essentials for roleplay communities.",
    art: { scene: "interior", caption: "FIVEM", tone: "showroom", props: ["car", "desk", "sofa", "plant"] },
  },
  {
    id: "minecraft",
    label: "Minecraft",
    href: "/gaming/minecraft",
    blurb: "Worlds, server packs, resource packs and tuned configurations for Minecraft communities.",
    art: { scene: "world", caption: "MINECRAFT", sky: "day", structures: ["castle", "tree", "house", "path", "pine", "water"] },
  },
  {
    id: "other",
    label: "Game Servers",
    href: "/gaming/products?platform=other",
    blurb: "Cross-platform assets, branding and resources for communities beyond one game ecosystem.",
    art: { scene: "pack", caption: "SERVER PACKS", items: ["Community assets", "Server resources", "Brand set", "Launch kit"] },
  },
]

export default function GamingLandingPage() {
  const featured = getFeaturedGamingProducts(8)
  const latest = filterGamingProducts({ sort: "newest" }).slice(0, 8)
  const facets = getGamingFacets()
  const counts = {
    fivem: getGamingProductsByPlatform("fivem").length,
    minecraft: getGamingProductsByPlatform("minecraft").length,
    other: facets.platforms.other ?? 0,
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 bg-[oklch(0.105_0.018_255)] text-white">
        <section className="relative overflow-hidden border-b border-white/10">
          <div aria-hidden="true" className="absolute -left-40 -top-48 size-[42rem] rounded-full bg-primary/20 blur-[120px]" />
          <div aria-hidden="true" className="absolute -right-64 top-24 size-[40rem] rounded-full bg-blue-500/10 blur-[130px]" />
          <div className="relative mx-auto max-w-[1540px] px-4 pb-16 pt-16 sm:px-6 sm:pb-20 sm:pt-20 lg:px-8 lg:pb-24 lg:pt-24">
            <div className="grid items-end gap-10 lg:grid-cols-[1fr_auto]">
              <div className="max-w-6xl">
                <p className="flex items-center gap-2 font-mono text-[10px] font-black uppercase tracking-[0.16em] text-primary"><GameController size={15} /> DistroSource Gaming</p>
                <h1 className="mt-5 font-display text-[clamp(3.7rem,9vw,9rem)] font-black leading-[0.8] tracking-[-0.085em]">
                  Upgrade the
                  <span className="block text-white/28">whole experience.</span>
                </h1>
                <p className="mt-7 max-w-2xl text-sm leading-7 text-white/55 sm:text-base">Digital resources for gaming communities, servers and worlds — FiveM, Minecraft and cross-platform infrastructure inside the same DistroSource store.</p>
              </div>
              <div className="flex flex-col items-start gap-3 lg:items-end">
                <Link href="/gaming/products" className="group inline-flex h-13 items-center gap-4 rounded-full bg-white px-5 text-sm font-bold text-black">Browse all gaming <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></Link>
                <p className="flex items-center gap-2 text-[10px] text-white/40"><ShieldCheck size={13} className="text-primary" /> Gaming checkout powered through Tebex where shown</p>
              </div>
            </div>

            {featured.length > 0 && (
              <div className="mt-14 grid gap-4 lg:grid-cols-[1.45fr_0.55fr]">
                <V4GamingCard product={featured[0]} feature />
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                  {featured.slice(1, 3).map((product) => <V4GamingCard key={product.id} product={product} />)}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="border-b border-white/10 py-20 sm:py-24">
          <div className="mx-auto max-w-[1540px] px-4 sm:px-6 lg:px-8">
            <div className="mb-9 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-primary">Choose the ecosystem</p>
                <h2 className="mt-3 font-display text-[clamp(2.6rem,5vw,5rem)] font-black leading-[0.9] tracking-[-0.06em]">Built for the servers you run.</h2>
              </div>
              <p className="text-sm text-white/40">{facets.total} gaming products</p>
            </div>

            <div className="grid gap-4 lg:grid-cols-3">
              {platforms.map((platform, index) => (
                <Link key={platform.id} href={platform.href} className="group overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.04] transition-[transform,border-color] hover:-translate-y-1 hover:border-white/20">
                  <div className="relative aspect-[16/10] overflow-hidden"><GamingPreview art={platform.art} className="transition-transform duration-700 group-hover:scale-[1.035]" /></div>
                  <div className="p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div><p className="font-mono text-[9px] font-black uppercase tracking-[0.1em] text-white/35">0{index + 1} · {counts[platform.id]} products</p><h3 className="mt-2 font-display text-3xl font-black tracking-[-0.045em]">{platform.label}</h3></div>
                      <span className="flex size-10 items-center justify-center rounded-full border border-white/12 transition-colors group-hover:bg-white group-hover:text-black"><ArrowRight size={14} /></span>
                    </div>
                    <p className="mt-3 text-xs leading-6 text-white/45">{platform.blurb}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="categories" className="py-20 sm:py-24">
          <div className="mx-auto max-w-[1540px] px-4 sm:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[320px_1fr] lg:gap-16">
              <div className="lg:sticky lg:top-24 lg:self-start">
                <p className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-primary">Categories</p>
                <h2 className="mt-4 font-display text-5xl font-black leading-[0.9] tracking-[-0.06em]">Everything your community needs.</h2>
                <Link href="/gaming/products" className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold">All gaming products <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></Link>
              </div>
              <div className="grid gap-px overflow-hidden rounded-[30px] bg-white/10 sm:grid-cols-2 xl:grid-cols-3">
                {GAMING_CATEGORIES.filter((category) => (facets.categories[category.id] ?? 0) > 0).map((category, index) => (
                  <Link key={category.id} href={`/gaming/products?category=${category.id}`} className="group flex min-h-48 flex-col justify-between bg-[oklch(0.125_0.018_255)] p-5 transition-colors hover:bg-white/[0.07] sm:p-6">
                    <div className="flex items-start justify-between"><span className="font-mono text-[9px] font-black text-white/25">{String(index + 1).padStart(2, "0")}</span><span className="font-mono text-[9px] text-white/30">{facets.categories[category.id]}</span></div>
                    <div><h3 className="font-display text-xl font-black tracking-[-0.035em]">{category.label}</h3><p className="mt-2 line-clamp-2 text-xs leading-5 text-white/40">{category.blurb}</p><span className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-primary">Explore <ArrowRight size={12} className="transition-transform group-hover:translate-x-1" /></span></div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {latest.length > 0 && (
          <section className="border-t border-white/10 bg-white/[0.02] py-20 sm:py-24">
            <div className="mx-auto max-w-[1540px] px-4 sm:px-6 lg:px-8">
              <div className="mb-9 flex items-end justify-between gap-4"><div><p className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-primary">Latest releases</p><h2 className="mt-3 font-display text-4xl font-black tracking-[-0.055em] sm:text-5xl">Fresh for your server.</h2></div><Link href="/gaming/products?sort=newest" className="hidden text-sm font-semibold sm:block">View all</Link></div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 lg:grid-cols-4">{latest.slice(0, 8).map((product) => <V4GamingCard key={product.id} product={product} />)}</div>
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}

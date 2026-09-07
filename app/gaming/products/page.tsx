import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { GamingFilters } from "@/components/gaming/gaming-filters"
import { GamingProductCard } from "@/components/gaming/gaming-product-card"
import { ChevronRight, SearchEmpty } from "@/lib/storefront-icons"
import { filterGamingProducts, getGamingFacets, parseGamingSort } from "@/lib/gaming/queries"
import { CATEGORY_LABEL, PLATFORM_LABEL, type GamingCategory, type GamingPlatform } from "@/lib/gaming/types"

export const metadata: Metadata = {
  title: "All Gaming Products | DistroSource Gaming",
  description: "Browse FiveM, Minecraft and game-server resources sold directly by DistroSource.",
  alternates: { canonical: "/gaming/products" },
}

const PLATFORMS = ["fivem", "minecraft", "other"]

export default async function GamingProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  const params = await searchParams
  const platform = PLATFORMS.includes(params.platform ?? "") ? (params.platform as GamingPlatform) : undefined
  const category = params.category as GamingCategory | undefined
  const sort = parseGamingSort(params.sort)
  const products = filterGamingProducts({ platform, category, price: params.price, sort, q: params.q })
  const facets = getGamingFacets({ platform })
  const filtered = Boolean(platform || category || params.price || params.q)
  const title = params.q ? `Results for “${params.q}”` : platform ? `${PLATFORM_LABEL[platform]} products` : "Gaming catalog"
  const description = category ? CATEGORY_LABEL[category] : "Maps, MLOs, systems, interfaces, server packs and resources for the communities you run."

  return (
    <div className="flex min-h-screen flex-col bg-[#07111f] text-white">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-white/10 bg-[#07111f]">
          <div className="mx-auto max-w-[1600px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-white/35"><Link href="/gaming" className="hover:text-white">Gaming</Link><ChevronRight size={11} /><span>Catalog</span></nav>
            <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
              <div><p className="font-mono text-[9px] font-black uppercase tracking-[0.14em] text-primary">DistroSource Gaming</p><h1 className="mt-3 font-display text-[clamp(3.4rem,7vw,7rem)] font-black leading-[0.84] tracking-[-0.075em]">{title}</h1><p className="mt-5 max-w-2xl text-sm leading-7 text-white/45">{description}</p></div>
              <p className="font-mono text-[9px] uppercase tracking-[0.1em] text-white/35">{products.length} {products.length === 1 ? "product" : "products"}</p>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
          <div className="grid gap-8 lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-12">
            <GamingFilters facets={facets} />
            <div className="min-w-0">
              {products.length === 0 ? (
                <div className="mx-auto flex max-w-xl flex-col items-center border-y border-white/10 px-6 py-20 text-center"><span className="flex size-14 items-center justify-center rounded-full bg-white/[0.06] text-white/40"><SearchEmpty size={21} /></span><h2 className="mt-5 font-display text-2xl font-black tracking-[-0.04em]">Nothing matches those filters.</h2><p className="mt-2 max-w-md text-sm leading-6 text-white/40">Try a broader filter or return to the complete Gaming catalog.</p>{filtered && <Link href="/gaming/products" className="mt-6 bg-white px-5 py-2.5 text-sm font-black text-[#07111f]">Clear filters</Link>}</div>
              ) : (
                <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4 xl:gap-x-6 xl:gap-y-10">{products.map((product) => <GamingProductCard key={product.id} product={product} className="[&_h3]:text-white [&_.text-foreground]:text-white [&_.text-muted-foreground]:text-white/45 [&_.border-border]:border-white/10" />)}</div>
              )}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

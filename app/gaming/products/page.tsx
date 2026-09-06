import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { GamingFilters } from "@/components/gaming/gaming-filters"
import { V4GamingCard } from "@/components/v4/gaming-card"
import { ChevronRight, SearchEmpty } from "@/lib/storefront-icons"
import { filterGamingProducts, getGamingFacets, parseGamingSort } from "@/lib/gaming/queries"
import { CATEGORY_LABEL, PLATFORM_LABEL, type GamingCategory, type GamingPlatform } from "@/lib/gaming/types"

export const metadata: Metadata = {
  title: "All Gaming Products | DistroSource Gaming",
  description: "Browse FiveM, Minecraft and game server resources sold through DistroSource Gaming.",
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

  const title = params.q
    ? `Results for “${params.q}”`
    : platform
      ? `${PLATFORM_LABEL[platform]} resources`
      : category
        ? CATEGORY_LABEL[category]
        : "Gaming products"

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 bg-[oklch(0.105_0.018_255)] text-white">
        <section className="border-b border-white/10">
          <div className="mx-auto max-w-[1540px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <nav aria-label="Breadcrumb" className="mb-7 flex items-center gap-1.5 text-[11px] text-white/35">
              <Link href="/" className="hover:text-white">Home</Link><ChevronRight size={11} /><Link href="/gaming" className="hover:text-white">Gaming</Link><ChevronRight size={11} /><span className="text-white">Products</span>
            </nav>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-primary">DistroSource Gaming catalog</p>
            <div className="mt-4 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h1 className="max-w-5xl font-display text-[clamp(3.2rem,7vw,7rem)] font-black leading-[0.84] tracking-[-0.075em]">{title}.</h1>
                <p className="mt-5 max-w-2xl text-sm leading-7 text-white/45">Maps, interfaces, systems, configurations, visual resources and server tools across supported gaming platforms.</p>
              </div>
              <p className="text-sm text-white/35"><strong className="font-display text-lg font-black text-white">{products.length}</strong> {products.length === 1 ? "product" : "products"}</p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1540px] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="mb-6 lg:hidden"><GamingFilters facets={facets} tone="dark" /></div>
          <div className="flex items-start gap-10 xl:gap-14">
            <div className="hidden lg:block"><GamingFilters facets={facets} tone="dark" /></div>
            <div className="min-w-0 flex-1">
              {products.length === 0 ? (
                <div className="flex min-h-[500px] flex-col items-center justify-center rounded-[32px] border border-dashed border-white/12 bg-white/[0.025] px-6 text-center">
                  <span className="flex size-16 items-center justify-center rounded-full bg-white/[0.06] text-white/45"><SearchEmpty size={24} /></span>
                  <h2 className="mt-6 font-display text-3xl font-black tracking-[-0.045em]">Nothing matches yet.</h2>
                  <p className="mt-3 max-w-md text-sm leading-7 text-white/40">Try another category, price band, platform or search phrase.</p>
                  {filtered && <Link href="/gaming/products" className="mt-7 inline-flex h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-black">Clear filters</Link>}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 sm:gap-y-11 lg:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => <V4GamingCard key={product.id} product={product} />)}
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

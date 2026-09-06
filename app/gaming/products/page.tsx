import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { GamingCategoryStrip } from "@/components/gaming/gaming-category-strip"
import { GamingFilters } from "@/components/gaming/gaming-filters"
import { GamingProductCard } from "@/components/gaming/gaming-product-card"
import { Button } from "@/components/ui/button"
import { ChevronRight, SearchEmpty, ICON_SIZE } from "@/lib/storefront-icons"
import { filterGamingProducts, getGamingFacets, parseGamingSort } from "@/lib/gaming/queries"
import { CATEGORY_LABEL, PLATFORM_LABEL, type GamingCategory, type GamingPlatform } from "@/lib/gaming/types"

export const metadata: Metadata = {
  title: "All Gaming Products | DistroSource Gaming",
  description:
    "Browse every DistroSource Gaming product — FiveM maps and MLOs, Minecraft server packs, interfaces, systems, textures and bundles. Sold directly by DistroSource.",
  alternates: { canonical: "/gaming/products" },
  openGraph: {
    title: "All Gaming Products | DistroSource Gaming",
    description: "FiveM, Minecraft and game server resources sold directly by DistroSource.",
    url: "/gaming/products",
    type: "website",
  },
}

const PLATFORMS = ["fivem", "minecraft", "other"]

export default async function GamingProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const platform = PLATFORMS.includes(params.platform ?? "") ? (params.platform as GamingPlatform) : undefined
  const category = params.category as GamingCategory | undefined
  const sort = parseGamingSort(params.sort)

  const products = filterGamingProducts({ platform, category, price: params.price, sort, q: params.q })
  const facets = getGamingFacets({ platform })
  const filtered = Boolean(platform || category || params.price || params.q)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10">
          <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Home</Link>
            <ChevronRight size={12} aria-hidden="true" />
            <Link href="/gaming" className="hover:text-foreground">Gaming</Link>
            <ChevronRight size={12} aria-hidden="true" />
            <span className="font-medium text-foreground">All products</span>
          </nav>

          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div className="max-w-2xl">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">DistroSource Gaming</p>
              <h1 className="mt-2 font-display text-3xl font-bold tracking-tight md:text-4xl">
                {params.q ? `Results for “${params.q}”` : platform ? `${PLATFORM_LABEL[platform]} products` : "Gaming products"}
              </h1>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {category
                  ? CATEGORY_LABEL[category]
                  : "Maps, MLOs, interfaces, systems, textures and bundles — every product sold directly by DistroSource."}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold tabular-nums text-foreground">{products.length}</span>{" "}
              {products.length === 1 ? "product" : "products"}
            </p>
          </div>

          {/* Phone-width shortcut for the filter panel's busiest group. Hidden
              once the sidebar is on screen, so the two never both show. */}
          <GamingCategoryStrip counts={facets.categories} className="mb-6 lg:hidden" />

          <div className="flex flex-col gap-8 lg:flex-row">
            <GamingFilters facets={facets} />

            <div className="min-w-0 flex-1">
              {products.length === 0 ? (
                <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-lg border border-border bg-card px-6 py-16 text-center">
                  <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                    <SearchEmpty size={ICON_SIZE.feature} aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="font-display text-lg font-bold">Nothing matches those filters</h2>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                      Try removing a filter, or browse the full Gaming catalogue.
                    </p>
                  </div>
                  {filtered && (
                    <Button render={<Link href="/gaming/products" />} nativeButton={false} className="font-semibold">
                      Clear filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                  {products.map((product) => (
                    <GamingProductCard key={product.id} product={product} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

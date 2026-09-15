import type { Metadata } from "next"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { GamingBrowse } from "@/components/gaming/gaming-browse"
import { parseGamingQuery } from "@/lib/gaming/queries"
import { PLATFORM_BY_ID } from "@/lib/gaming/catalog/taxonomy"

export const metadata: Metadata = {
  title: "All Gaming products | DistroSource Gaming",
  description: "FiveM interiors, interfaces and vehicles, Minecraft builds, server tooling and community branding — made and sold by DistroSource.",
  alternates: { canonical: "/gaming/products" },
}

export default async function GamingProductsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = parseGamingQuery(await searchParams)
  const platform = query.platform ? PLATFORM_BY_ID[query.platform] : null
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <GamingBrowse
          base={{ path: "/gaming/products", fixed: {} }}
          query={query}
          crumb={platform ? platform.label : "All products"}
          eyebrow="DistroSource Gaming"
          title={query.q ? `Results for “${query.q}”` : platform ? `${platform.label} resources` : "Every Gaming resource"}
          description={platform ? platform.blurb : "Interiors, interfaces, vehicles, builds, server tooling and branding. Every product is made and sold by DistroSource."}
        />
      </main>
      <SiteFooter />
    </div>
  )
}

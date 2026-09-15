import type { Metadata } from "next"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { GamingBrowse } from "@/components/gaming/gaming-browse"
import { parseGamingQuery } from "@/lib/gaming/queries"
import { PLATFORM_BY_ID } from "@/lib/gaming/catalog/taxonomy"

export const metadata: Metadata = {
  title: "FiveM resources | DistroSource Gaming",
  description: "FiveM interiors, interfaces, vehicles and server tooling for ESX, QBCore and Qbox servers. Made and sold by DistroSource.",
  alternates: { canonical: "/gaming/fivem" },
}

export default async function GamingFiveMPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = parseGamingQuery(await searchParams, { platform: "fivem" })
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <GamingBrowse
          base={{ path: "/gaming/fivem", fixed: { platform: "fivem" } }}
          query={query}
          crumb="FiveM"
          eyebrow="FiveM"
          title="FiveM resources"
          description={PLATFORM_BY_ID.fivem.blurb}
        />
      </main>
      <SiteFooter />
    </div>
  )
}

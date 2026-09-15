import type { Metadata } from "next"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { GamingBrowse } from "@/components/gaming/gaming-browse"
import { parseGamingQuery } from "@/lib/gaming/queries"

export const metadata: Metadata = {
  title: "Gaming subscriptions | DistroSource Gaming",
  description:
    "Recurring libraries for FiveM, Minecraft and game communities: vault access, monthly drops, pick-and-keep plans and creator kits, each with exactly what it includes.",
  alternates: { canonical: "/gaming/subscriptions" },
}

export default async function GamingSubscriptionsPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = parseGamingQuery(await searchParams, { kind: "subscription" })
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <GamingBrowse
          base={{ path: "/gaming/subscriptions", fixed: { kind: "subscription" } }}
          query={query}
          crumb="Subscriptions"
          eyebrow="Gaming subscriptions"
          title="Libraries that keep growing"
          description="Each plan is one coherent library — interiors, interfaces, vehicles, builds or brand kits — with the exact contents, cadence and cancellation terms on its page."
        />
      </main>
      <SiteFooter />
    </div>
  )
}

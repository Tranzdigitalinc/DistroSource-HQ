import type { Metadata } from "next"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { GamingBrowse } from "@/components/gaming/gaming-browse"
import { parseGamingQuery } from "@/lib/gaming/queries"
import { PLATFORM_BY_ID } from "@/lib/gaming/catalog/taxonomy"

export const metadata: Metadata = {
  title: "Minecraft resources | DistroSource Gaming",
  description: "Minecraft spawns, lobbies, builds and server setups for Java Edition networks. Made and sold by DistroSource.",
  alternates: { canonical: "/gaming/minecraft" },
}

export default async function GamingMinecraftPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = parseGamingQuery(await searchParams, { platform: "minecraft" })
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <GamingBrowse
          base={{ path: "/gaming/minecraft", fixed: { platform: "minecraft" } }}
          query={query}
          crumb="Minecraft"
          eyebrow="Minecraft"
          title="Minecraft resources"
          description={PLATFORM_BY_ID.minecraft.blurb}
        />
      </main>
      <SiteFooter />
    </div>
  )
}

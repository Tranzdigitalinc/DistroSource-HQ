import type { Metadata } from "next"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { GamingHero } from "@/components/gaming/gaming-hero"
import { GamingRail } from "@/components/gaming/gaming-rail"
import { GamingTrustStrip } from "@/components/gaming/gaming-trust-strip"
import { filterGamingProducts } from "@/lib/gaming/queries"

export const metadata: Metadata = {
  title: "Minecraft Maps, Server Packs & Resources | DistroSource",
  description:
    "Premium Minecraft maps, server packs, resource packs, configurations and interfaces for Java Edition servers. Every product sold directly by DistroSource.",
  alternates: { canonical: "/gaming/minecraft" },
  openGraph: {
    title: "Minecraft Maps, Server Packs & Resources | DistroSource",
    description: "Maps, server packs, resource packs and tuned configurations for Minecraft Java servers.",
    url: "/gaming/minecraft",
    type: "website",
  },
}

export default function MinecraftPage() {
  const all = filterGamingProducts({ platform: "minecraft" })
  const pick = (category: string) => all.filter((p) => p.category === category)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <GamingHero
          eyebrow="Minecraft Resources"
          title="Everything your Minecraft server needs."
          description="Maps, server packs, resource packs and tuned configurations for Java Edition servers."
          primary={{ label: "Browse Minecraft Products", href: "/gaming/products?platform=minecraft" }}
          secondary={{ label: "All Gaming", href: "/gaming" }}
          trustLine="Secure checkout powered by Tebex"
        />

        <GamingRail
          title="Maps"
          subtitle="Spawns, lobbies and adventure worlds, finished to the edges."
          href="/gaming/products?platform=minecraft&category=maps-mlos"
          products={pick("maps-mlos")}
        />
        <GamingRail
          title="Server Packs"
          subtitle="The unglamorous half of running a server, already configured."
          href="/gaming/products?platform=minecraft&category=server-resources"
          products={pick("server-resources")}
          tone="muted"
        />
        <GamingRail
          title="Resource Packs"
          subtitle="Texture sets drawn to a single palette."
          href="/gaming/products?platform=minecraft&category=textures"
          products={pick("textures")}
        />
        <GamingRail
          title="Server Configurations"
          subtitle="Tuned economies and settings with the reasoning documented."
          href="/gaming/products?platform=minecraft&category=configurations"
          products={pick("configurations")}
          tone="muted"
        />
        <GamingRail
          title="Interfaces"
          subtitle="Menus and GUI sets that work with your existing plugins."
          href="/gaming/products?platform=minecraft&category=ui-hud"
          products={pick("ui-hud")}
        />
        <GamingRail
          title="Latest Releases"
          subtitle="Most recently added to the Minecraft catalogue."
          href="/gaming/products?platform=minecraft&sort=newest"
          products={filterGamingProducts({ platform: "minecraft", sort: "newest" })}
          tone="muted"
        />

        <GamingTrustStrip />
      </main>
      <SiteFooter />
    </div>
  )
}

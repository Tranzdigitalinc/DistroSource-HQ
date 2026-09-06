import type { Metadata } from "next"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { GamingHero } from "@/components/gaming/gaming-hero"
import { GamingRail } from "@/components/gaming/gaming-rail"
import { GamingTrustStrip } from "@/components/gaming/gaming-trust-strip"
import { filterGamingProducts } from "@/lib/gaming/queries"

export const metadata: Metadata = {
  title: "FiveM Maps, MLOs, UI & Server Resources | DistroSource",
  description:
    "Premium FiveM maps, MLOs, interfaces, gameplay systems and server resources for modern FiveM communities. Every product sold directly by DistroSource.",
  alternates: { canonical: "/gaming/fivem" },
  openGraph: {
    title: "FiveM Maps, MLOs, UI & Server Resources | DistroSource",
    description: "Premium maps, interfaces, systems and server resources for modern FiveM communities.",
    url: "/gaming/fivem",
    type: "website",
  },
}

export default function FivemPage() {
  const all = filterGamingProducts({ platform: "fivem" })
  const pick = (category: string) => all.filter((p) => p.category === category)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <GamingHero
          eyebrow="FiveM Resources"
          title="Build a better FiveM server."
          description="Premium maps, interfaces, systems and server resources for modern FiveM communities."
          primary={{ label: "Browse FiveM Products", href: "/gaming/products?platform=fivem" }}
          secondary={{ label: "All Gaming", href: "/gaming" }}
          trustLine="Secure checkout powered by Tebex"
        />

        <GamingRail
          title="Featured FiveM Products"
          subtitle="The products we would start a server with."
          href="/gaming/products?platform=fivem"
          products={all.filter((p) => p.featured || p.bestseller)}
        />
        <GamingRail
          title="Maps & MLOs"
          subtitle="Interiors and environments built to one consistent standard."
          href="/gaming/products?platform=fivem&category=maps-mlos"
          products={pick("maps-mlos")}
          tone="muted"
        />
        <GamingRail
          title="Scripts & Systems"
          subtitle="Gameplay systems that persist what players do."
          href="/gaming/products?platform=fivem&category=scripts-systems"
          products={pick("scripts-systems")}
        />
        <GamingRail
          title="UI & HUD"
          subtitle="Interfaces that stay readable at speed."
          href="/gaming/products?platform=fivem&category=ui-hud"
          products={pick("ui-hud")}
          tone="muted"
        />
        <GamingRail
          title="Server Essentials"
          subtitle="Bundled cores for a new server."
          href="/gaming/products?platform=fivem&category=bundles"
          products={pick("bundles")}
        />
        <GamingRail
          title="Latest Releases"
          subtitle="Most recently added to the FiveM catalogue."
          href="/gaming/products?platform=fivem&sort=newest"
          products={filterGamingProducts({ platform: "fivem", sort: "newest" })}
          tone="muted"
        />

        <GamingTrustStrip />
      </main>
      <SiteFooter />
    </div>
  )
}

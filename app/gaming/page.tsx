import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { GamingHero } from "@/components/gaming/gaming-hero"
import { GamingPreview } from "@/components/gaming/gaming-preview"
import { GamingProductCard } from "@/components/gaming/gaming-product-card"
import { GamingTrustStrip } from "@/components/gaming/gaming-trust-strip"
import { RevealGroup, RevealItem } from "@/components/motion/reveal"
import { ArrowRight, ArrowUpRight, ICON_SIZE } from "@/lib/storefront-icons"
import { filterGamingProducts, getFeaturedGamingProducts, getGamingFacets, getGamingProductsByPlatform } from "@/lib/gaming/queries"
import { GAMING_CATEGORIES, type GamingArt, type GamingCategory } from "@/lib/gaming/types"

export const metadata: Metadata = {
  title: "Gaming Resources, FiveM Assets & Minecraft Products | DistroSource",
  description:
    "Premium digital resources for games, servers and online gaming communities — FiveM maps and MLOs, Minecraft server packs, interfaces and configurations, sold directly by DistroSource.",
  alternates: { canonical: "/gaming" },
  openGraph: {
    title: "DistroSource Gaming",
    description: "Premium digital resources for games, servers and online gaming communities.",
    url: "/gaming",
    type: "website",
  },
}

/**
 * Artwork for each category card. These stand for a whole category rather
 * than one product, so they are generic on purpose — the per-product
 * artwork lives on the products themselves.
 */
const CATEGORY_ART: Record<GamingCategory, GamingArt> = {
  "maps-mlos": { scene: "interior", caption: "INTERIORS", tone: "warm", props: ["sofa", "table", "shelf", "plant"] },
  "scripts-systems": { scene: "system", caption: "SERVER LOGIC", stages: ["TRIGGER", "VALIDATE", "PERSIST"], activeStage: 1 },
  "ui-hud": {
    scene: "hud",
    caption: "INTERFACES",
    speed: "72",
    unit: "MPH",
    gauges: [
      { label: "FUEL", fill: 0.7 },
      { label: "ENGINE", fill: 0.45 },
      { label: "CONDITION", fill: 0.6 },
    ],
    chips: ["STATUS", "ALERT", "MODE"],
  },
  vehicles: { scene: "lineup", caption: "VEHICLES", subject: "vehicle", count: 4, accentIndex: 1 },
  clothing: { scene: "lineup", caption: "CLOTHING & EUP", subject: "character", count: 4, accentIndex: 2 },
  characters: { scene: "lineup", caption: "CHARACTERS", subject: "character", count: 5, accentIndex: 1 },
  weapons: { scene: "lineup", caption: "WEAPONS", subject: "weapon", count: 4, accentIndex: 1 },
  animations: { scene: "lineup", caption: "ANIMATIONS", subject: "character", count: 4, accentIndex: 3 },
  audio: {
    scene: "audio",
    caption: "SOUNDS & AUDIO",
    tracks: [
      { label: "SIRENS", fill: 0.8 },
      { label: "ENGINES", fill: 0.62 },
      { label: "AMBIENCE", fill: 0.44 },
      { label: "MUSIC", fill: 0.55 },
    ],
  },
  plugins: { scene: "system", caption: "PLUGINS", stages: ["LOAD", "REGISTER", "SERVE"], activeStage: 1 },
  security: { scene: "system", caption: "ANTICHEAT", stages: ["OBSERVE", "VALIDATE", "SCORE", "ACT"], activeStage: 1 },
  "server-resources": {
    scene: "config",
    caption: "SERVER SETUP",
    rows: [
      { label: "PERMISSIONS", fill: 0.7 },
      { label: "RANKS", fill: 0.5 },
      { label: "WARPS", fill: 0.35 },
      { label: "MODERATION", fill: 0.62 },
    ],
  },
  textures: { scene: "palette", caption: "TEXTURE SETS", kind: "blocks" },
  graphics: { scene: "palette", caption: "BRAND GRAPHICS", kind: "brand" },
  configurations: {
    scene: "config",
    caption: "TUNED CONFIGS",
    rows: [
      { label: "BALANCE", fill: 0.58 },
      { label: "PAYOUTS", fill: 0.44 },
      { label: "SINKS", fill: 0.72 },
      { label: "LIMITS", fill: 0.3 },
    ],
  },
  bundles: {
    scene: "pack",
    caption: "MULTI-PRODUCT",
    items: ["Core resources", "Combined config", "Setup guide", "Update notes"],
  },
}

const PLATFORM_CARDS = [
  {
    id: "fivem",
    label: "FiveM",
    href: "/gaming/fivem",
    blurb: "Maps and MLOs, interfaces, gameplay systems and server essentials for roleplay communities.",
    art: { scene: "interior", caption: "FIVEM", tone: "showroom", props: ["car", "desk", "sofa", "plant"] } satisfies GamingArt,
    emphasis: true,
  },
  {
    id: "minecraft",
    label: "Minecraft",
    href: "/gaming/minecraft",
    blurb: "Spawn and adventure maps, resource packs, server packs and tuned configurations.",
    art: {
      scene: "world",
      caption: "MINECRAFT",
      sky: "day",
      structures: ["castle", "tree", "house", "path", "house", "pine", "water", "tree"],
    } satisfies GamingArt,
    emphasis: true,
  },
  {
    id: "other",
    label: "Game Servers",
    href: "/gaming/products?platform=other",
    blurb: "Community branding and cross-platform starter packs for any server.",
    art: {
      scene: "pack",
      caption: "CROSS-PLATFORM",
      items: ["Community brand set", "Server resources", "Staff handbook", "Launch checklist"],
    } satisfies GamingArt,
    emphasis: false,
  },
]

export default function GamingLandingPage() {
  const featured = getFeaturedGamingProducts(8)
  const facets = getGamingFacets()
  const fivemCount = getGamingProductsByPlatform("fivem").length
  const minecraftCount = getGamingProductsByPlatform("minecraft").length
  const latest = filterGamingProducts({ sort: "newest" }).slice(0, 4)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <GamingHero
          eyebrow="DistroSource Gaming"
          title="Upgrade your gaming experience."
          description="Premium digital resources for games, servers and online gaming communities."
          primary={{ label: "Browse Gaming Products", href: "/gaming/products" }}
          secondary={{ label: "Explore Categories", href: "#categories" }}
          trustLine="Secure checkout powered by Tebex"
        />

        {/* ---- Platforms ---- */}
        <section className="mx-auto max-w-7xl px-6 py-14 sm:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">Explore by Platform</p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">Built for the servers you run</h2>
            </div>
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold tabular-nums text-foreground">{facets.total}</span> Gaming products
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {PLATFORM_CARDS.map((platform) => (
              <Link
                key={platform.id}
                href={platform.href}
                className={`group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-[var(--shadow-e2)] ${
                  platform.emphasis ? "lg:col-span-1" : ""
                }`}
              >
                <div className="relative aspect-[16/9] overflow-hidden">
                  <GamingPreview
                    art={platform.art}
                    className="transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-display text-lg font-bold tracking-tight">{platform.label}</h3>
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                      {platform.id === "fivem" ? fivemCount : platform.id === "minecraft" ? minecraftCount : facets.platforms.other ?? 0} products
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">{platform.blurb}</p>
                  <span className="mt-auto flex items-center gap-1.5 pt-3 text-sm font-semibold text-foreground">
                    Browse {platform.label}
                    <ArrowRight size={ICON_SIZE.sm} className="transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none" aria-hidden="true" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* ---- Categories ---- */}
        <section id="categories" className="border-y border-border bg-secondary/30">
          <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8">
            <div className="mb-8">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">Categories</p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">Every kind of Gaming resource</h2>
            </div>
            <RevealGroup className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" stagger={0.04}>
              {GAMING_CATEGORIES.filter((c) => (facets.categories[c.id] ?? 0) > 0).map((category) => (
                <RevealItem key={category.id} className="h-full">
                  <Link
                    href={`/gaming/products?category=${category.id}`}
                    className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-[var(--shadow-e2)]"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden">
                      <GamingPreview art={CATEGORY_ART[category.id]} />
                    </div>
                    <div className="flex flex-1 flex-col gap-1 p-4">
                      <h3 className="font-display text-sm font-bold tracking-tight text-foreground">{category.label}</h3>
                      <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{category.blurb}</p>
                      <p className="mt-auto pt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                        {facets.categories[category.id]} {facets.categories[category.id] === 1 ? "product" : "products"}
                      </p>
                    </div>
                  </Link>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>

        {/* ---- Featured ---- */}
        <section className="mx-auto max-w-7xl px-6 py-14 sm:px-8">
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
            <div>
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">Featured</p>
              <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">Gaming products</h2>
            </div>
            <Link href="/gaming/products" className="flex items-center gap-1 font-mono text-xs font-semibold uppercase tracking-[0.04em] text-primary hover:underline">
              All Gaming products
              <ArrowUpRight className="size-3.5" />
            </Link>
          </div>
          <RevealGroup className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" stagger={0.04}>
            {featured.map((product) => (
              <RevealItem key={product.id} className="h-full">
                <GamingProductCard product={product} />
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        {/* ---- Latest ---- */}
        <section className="border-t border-border bg-secondary/30">
          <div className="mx-auto max-w-7xl px-6 py-14 sm:px-8">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">Just added</p>
                <h2 className="mt-2 font-display text-2xl font-bold tracking-tight sm:text-3xl">Latest releases</h2>
              </div>
              <Link href="/gaming/products?sort=newest" className="text-sm font-semibold text-foreground underline-offset-4 hover:underline">
                View all
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {latest.map((product) => (
                <GamingProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        <GamingTrustStrip />
      </main>
      <SiteFooter />
    </div>
  )
}

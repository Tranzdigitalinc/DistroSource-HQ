import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { GamingCard } from "@/components/gaming/gaming-card"
import { GamingImage } from "@/components/gaming/gaming-image"
import { Button } from "@/components/ui/button"
import { filterGamingProducts, getFeaturedGamingProducts, getGamingPlatformsInUse } from "@/lib/gaming/queries"
import { SUBSCRIPTION_MODELS } from "@/lib/gaming/catalog/taxonomy"
import type { GamingSubscriptionModel } from "@/lib/gaming/catalog/types"
import { ArrowRight, Library, Refresh, Search, ShieldCheck } from "@/lib/storefront-icons"

export const metadata: Metadata = {
  title: "DistroSource Gaming — FiveM, Minecraft and server resources",
  description:
    "FiveM interiors, interfaces and vehicles, Minecraft builds, server tooling and community branding. Made and sold by DistroSource, with clear subscription terms.",
  alternates: { canonical: "/gaming" },
}

export default function GamingHomePage() {
  const featured = getFeaturedGamingProducts(4)
  const platforms = getGamingPlatformsInUse()
  const subscriptions = filterGamingProducts({ kind: "subscription", sort: "featured" })
  const modelsInUse = (Object.keys(SUBSCRIPTION_MODELS) as GamingSubscriptionModel[]).filter((m) => subscriptions.some((p) => p.models.includes(m)))

  const areas = [
    ...platforms.map((p) => ({
      href: p.id === "fivem" ? "/gaming/fivem" : p.id === "minecraft" ? "/gaming/minecraft" : `/gaming/products?platform=${p.id}`,
      label: p.label,
      blurb: p.blurb,
      count: p.count,
      image: filterGamingProducts({ platform: p.id })[0]?.cardImage,
    })),
    ...(subscriptions.length
      ? [
          {
            href: "/gaming/subscriptions",
            label: "Subscriptions",
            blurb: "Growing libraries with exact contents, cadence and cancellation terms.",
            count: subscriptions.length,
            image: subscriptions[1]?.cardImage ?? subscriptions[0]?.cardImage,
          },
        ]
      : []),
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* ---------------- hero ---------------- */}
        <section className="relative overflow-hidden bg-navy-deep text-navy-foreground">
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.07]"
            style={{ backgroundImage: "linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)", backgroundSize: "56px 56px" }}
            aria-hidden="true"
          />
          <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-10 px-4 py-14 sm:px-6 md:py-20 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
            <div className="max-w-xl">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">DistroSource Gaming</p>
              <h1 className="mt-4 font-display text-4xl font-bold leading-[1.05] tracking-tight text-balance md:text-6xl">
                Resources for servers that take it seriously.
              </h1>
              <p className="mt-5 text-base leading-relaxed text-navy-foreground/75 text-pretty md:text-lg">
                FiveM interiors, interfaces and vehicles. Minecraft builds. Server tooling and community branding. Made and sold by DistroSource.
              </p>
              <form action="/gaming/products" method="get" role="search" className="relative mt-7 max-w-md">
                <label htmlFor="gaming-hero-search" className="sr-only">
                  Search Gaming
                </label>
                <Search size={17} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-foreground/50" aria-hidden="true" />
                <input
                  id="gaming-hero-search"
                  name="q"
                  type="search"
                  placeholder="Search MLOs, HUDs, vehicles, spawns…"
                  className="h-12 w-full rounded-xl border border-white/15 bg-white/[0.06] pl-10 pr-4 text-sm text-navy-foreground outline-none transition-colors placeholder:text-navy-foreground/45 hover:border-white/30 focus-visible:ring-2 focus-visible:ring-primary"
                />
              </form>
              <div className="mt-5 flex flex-wrap gap-3">
                <Button render={<Link href="/gaming/products" />} nativeButton={false} size="lg" className="font-semibold">
                  Browse everything
                  <ArrowRight size={16} aria-hidden="true" />
                </Button>
                <Button
                  render={<Link href="/gaming/subscriptions" />}
                  nativeButton={false}
                  size="lg"
                  variant="outline"
                  className="border-white/20 bg-transparent font-semibold text-navy-foreground hover:bg-white/10 hover:text-navy-foreground"
                >
                  See subscriptions
                </Button>
              </div>
            </div>

            {featured.length >= 4 && (
              <ul className="grid grid-cols-2 gap-3" aria-label="Featured resources">
                {featured.map((p, i) => (
                  <li key={p.id} className={i % 2 === 1 ? "translate-y-6" : ""}>
                    <Link href={`/gaming/product/${p.slug}`} className="group relative block overflow-hidden rounded-xl ring-1 ring-white/10">
                      <GamingImage image={p.cardImage} sizes="(min-width: 1024px) 26vw, 46vw" priority className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-[1.04] motion-reduce:transition-none" />
                      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pb-2.5 pt-8 text-sm font-semibold text-white">{p.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* ---------------- areas ---------------- */}
        <section aria-labelledby="areas-title" className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <div className="mb-7 flex items-end justify-between gap-4">
            <h2 id="areas-title" className="font-display text-2xl font-bold tracking-tight md:text-3xl">
              Start with your platform
            </h2>
            <Link href="/gaming/products" className="text-sm font-semibold text-primary hover:underline">
              All resources
            </Link>
          </div>
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {areas.map((a) => (
              <li key={a.href}>
                <Link href={a.href} className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl bg-navy p-5 text-white ring-1 ring-border sm:aspect-[3/4]">
                  {a.image && (
                    <GamingImage
                      image={a.image}
                      sizes="(min-width: 1024px) 24vw, (min-width: 640px) 46vw, 92vw"
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.05] motion-reduce:transition-none"
                    />
                  )}
                  <span className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5" aria-hidden="true" />
                  <span className="relative">
                    <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-white/70">
                      {a.count} {a.count === 1 ? "resource" : "resources"}
                    </span>
                    <span className="mt-1 flex items-center gap-2 font-display text-2xl font-bold tracking-tight">
                      {a.label}
                      <ArrowRight size={18} className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" aria-hidden="true" />
                    </span>
                    <span className="mt-1.5 block text-sm leading-relaxed text-white/75">{a.blurb}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* ---------------- subscriptions ---------------- */}
        {subscriptions.length > 0 && (
          <section aria-labelledby="subs-title" className="border-y border-border bg-surface-soft">
            <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
              <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
                <div className="max-w-2xl">
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">Subscriptions</p>
                  <h2 id="subs-title" className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
                    One plan, one coherent library
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Every plan lists exactly what it covers, how often it grows and what happens if you cancel.
                  </p>
                </div>
                <Link href="/gaming/subscriptions" className="text-sm font-semibold text-primary hover:underline">
                  All subscriptions
                </Link>
              </div>
              <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {subscriptions.slice(0, 6).map((p) => (
                  <li key={p.id} className="flex">
                    <GamingCard product={p} className="w-full" />
                  </li>
                ))}
              </ul>

              {modelsInUse.length > 0 && (
                <dl className="mt-10 grid grid-cols-1 gap-x-8 gap-y-5 border-t border-border pt-8 sm:grid-cols-2 lg:grid-cols-4">
                  {modelsInUse.map((m) => (
                    <div key={m}>
                      <dt className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-foreground">{SUBSCRIPTION_MODELS[m].badge}</dt>
                      <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">{SUBSCRIPTION_MODELS[m].explain}</dd>
                    </div>
                  ))}
                </dl>
              )}
            </div>
          </section>
        )}

        {/* ---------------- how it works ---------------- */}
        <section aria-labelledby="how-title" className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
          <h2 id="how-title" className="sr-only">
            How DistroSource Gaming works
          </h2>
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: "Made by DistroSource", body: "Every Gaming resource is first-party. No third-party sellers, no resold files." },
              { icon: Library, title: "One Gaming Library", body: "Purchases and plan access live in your DistroSource account, ready to download." },
              { icon: Refresh, title: "Terms you can read", body: "Each plan states its cadence, license and exactly what happens when you cancel." },
            ].map(({ icon: Icon, title, body }) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-foreground">
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div>
                  <h3 className="font-display text-base font-bold">{title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

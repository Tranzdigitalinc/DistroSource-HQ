import Link from "next/link"
import { ArrowRight, Building2, FileText, Library, Lock, ShieldCheck, Zap, ICON_SIZE } from "@/lib/storefront-icons"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { Button } from "@/components/ui/button"
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal"
import { getStorefrontStats } from "@/lib/queries/catalog"

export const metadata = {
  title: "About — DistroSource",
  description:
    "DistroSource is a digital-products department store — templates, fonts, presentation kits, Notion systems, 3D assets, and more, delivered instantly with clear licensing.",
}

// Every claim below is something the storefront actually does today. Anything
// aspirational ("verified source", "real sample file") was removed: a
// payment-compliance reviewer checks these against the site, not our intent.
const principles = [
  {
    icon: Zap,
    title: "Instant delivery",
    description: "Paid products unlock in your library the moment Polar confirms the payment. No shipping, no waiting.",
  },
  {
    icon: FileText,
    title: "Clear licensing",
    description: "Personal, Commercial and Agency tiers are spelled out on every product page before you buy.",
  },
  {
    icon: Library,
    title: "Yours to re-download",
    description: "Purchases stay in My Library. Lose a file, change machines — download it again.",
  },
  {
    icon: ShieldCheck,
    title: "Honest presentation",
    description: "Preview images are labelled as concept previews, ratings appear only when real reviews exist, and counts are exact.",
  },
]

const standards = [
  {
    icon: FileText,
    title: "Rights-reviewed listings",
    description: "Products go live only with a recorded rights status — original, licensed for distribution, or supplier-verified.",
  },
  {
    icon: Lock,
    title: "Account-gated downloads",
    description: "Files are served through signed, account-checked download links over an encrypted connection.",
  },
  {
    icon: ShieldCheck,
    title: "Payments by Polar",
    description: "Checkout and card handling run through Polar as merchant of record. DistroSource never stores card details.",
  },
]

export default async function AboutPage() {
  const stats = await getStorefrontStats()

  // Exact counts, straight from the catalog — no "+" inflation.
  const statCards = [
    { label: "Products", value: stats.productCount.toLocaleString() },
    { label: "Categories", value: stats.categoryCount.toLocaleString() },
    ...(stats.reviewCount > 0
      ? [
          { label: "Customer reviews", value: stats.reviewCount.toLocaleString() },
          { label: "Average rating", value: stats.avgRating.toFixed(1) },
        ]
      : []),
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-hero">
          <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 md:py-20">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">About DistroSource</p>
            <h1 className="mt-3 font-display text-4xl font-bold leading-[1.05] tracking-tight text-hero-foreground text-balance sm:text-5xl">
              Everything digital. One source.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
              A department store for digital products — templates, fonts, presentation kits, Notion systems, 3D
              assets and more — delivered to your library in seconds.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <RevealGroup className={`grid grid-cols-2 gap-4 ${statCards.length >= 4 ? "sm:grid-cols-4" : "sm:max-w-md"}`} stagger={0.05}>
            {statCards.map((stat) => (
              <RevealItem key={stat.label}>
                <div className="rounded-lg border border-border bg-card p-5">
                  <p className="font-display text-3xl font-bold tabular-nums text-foreground">{stat.value}</p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">{stat.label}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        <section className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <Reveal>
            <h2 className="font-display text-2xl font-bold tracking-tight">Why DistroSource exists</h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              Professional digital products are scattered across marketplaces with inconsistent licensing and
              delivery. DistroSource brings them into one storefront where every listing shows its licence, its
              formats and its price up front, and every purchase is delivered instantly to a library you can return to.
            </p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              The catalog currently holds {stats.productCount.toLocaleString()} products across{" "}
              {stats.categoryCount.toLocaleString()} categories. Each has a written description, concept previews,
              and licence tiers reviewed before publication.
            </p>
          </Reveal>
        </section>

        <section className="border-y border-border bg-secondary/40 py-14">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="font-display text-2xl font-bold tracking-tight">What you can count on</h2>
            <RevealGroup className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.05}>
              {principles.map((p) => (
                <RevealItem key={p.title}>
                  <div className="h-full rounded-lg border border-border bg-card p-5">
                    <span className="flex size-10 items-center justify-center rounded-md bg-secondary text-foreground">
                      <p.icon size={ICON_SIZE.feature} aria-hidden="true" />
                    </span>
                    <h3 className="mt-4 font-display text-sm font-bold">{p.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.description}</p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="font-display text-2xl font-bold tracking-tight">Our standards</h2>
          <p className="mt-2 text-sm text-muted-foreground">How the storefront is run — not marketing, just the mechanics.</p>
          <RevealGroup className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3" stagger={0.05}>
            {standards.map((item) => (
              <RevealItem key={item.title}>
                <div className="h-full rounded-lg border border-border bg-card p-5">
                  <span className="flex size-10 items-center justify-center rounded-md bg-secondary text-foreground">
                    <item.icon size={ICON_SIZE.feature} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-sm font-bold text-foreground">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        <section className="mx-auto max-w-3xl px-4 pb-16 sm:px-6">
          <div className="rounded-lg border border-border bg-card p-8 text-center">
            <span className="mx-auto flex size-10 items-center justify-center rounded-md bg-secondary text-foreground">
              <Building2 size={ICON_SIZE.feature} aria-hidden="true" />
            </span>
            <h2 className="mt-4 font-display text-2xl font-bold tracking-tight">Buying for a team?</h2>
            <p className="mt-2 text-sm text-muted-foreground">Multi-seat and agency licensing for businesses, with invoicing on request.</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <Button size="lg" className="h-11 px-6 font-semibold" nativeButton={false} render={<Link href="/team-licensing" />}>
                Team licensing
                <ArrowRight size={ICON_SIZE.base} aria-hidden="true" />
              </Button>
              <Button size="lg" variant="outline" className="h-11 px-6 font-semibold" nativeButton={false} render={<Link href="/contact" />}>
                Contact us
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

import Link from "next/link"
import { Sparkles, ShieldCheck, Zap, HeartHandshake, LayoutTemplate, Building2 } from "lucide-react"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { Button } from "@/components/ui/button"
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal"
import { getMarketplaceStats } from "@/lib/queries/catalog"

export const metadata = {
  title: "About Us — DistroSource",
  description:
    "DistroSource is a digital-products department store — templates, fonts, presentation kits, Notion systems, 3D assets, and more, delivered instantly with clear licensing.",
}

const values = [
  {
    icon: Zap,
    title: "Instant by design",
    description:
      "Every product on DistroSource unlocks the moment payment is confirmed — no shipping, no waiting, straight into your library.",
  },
  {
    icon: ShieldCheck,
    title: "Clear licensing",
    description:
      "Personal, commercial, extended, and agency license tiers are spelled out up front so you always know what you can do with a purchase.",
  },
  {
    icon: LayoutTemplate,
    title: "Curated, not crowded",
    description:
      "We publish products only once they have real preview files and real sample downloads — no placeholder listings, ever.",
  },
  {
    icon: HeartHandshake,
    title: "Support that responds",
    description:
      "Our support team reviews every ticket personally — from download issues to license questions — with fast, human follow-up.",
  },
]

const timeline = [
  {
    year: "2022",
    title: "DistroSource is founded",
    description: "Started as a small catalog of website templates and font pairings for independent designers.",
  },
  {
    year: "2023",
    title: "Categories expand",
    description: "Added presentation kits, Notion systems, UI kits, and 3D assets to serve a wider range of creators.",
  },
  {
    year: "2024",
    title: "Licensing tiers introduced",
    description: "Launched personal, commercial, extended, and agency licensing so teams of any size can buy with confidence.",
  },
  {
    year: "2025",
    title: "Team licensing for business",
    description: "Launched a dedicated program for agencies and studios purchasing at volume across the catalog.",
  },
]

export default async function AboutPage() {
  const stats = await getMarketplaceStats()

  const statCards = [
    { label: "Products in catalog", value: `${stats.productCount.toLocaleString()}+` },
    { label: "Categories", value: `${stats.categoryCount}+` },
    { label: "Customer reviews", value: `${stats.reviewCount.toLocaleString()}+` },
    { label: "Average customer rating", value: stats.avgRating.toFixed(1) },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden border-b border-border bg-hero">
          <div className="relative mx-auto max-w-4xl px-6 py-20 text-center sm:px-8">
            <span className="mx-auto flex w-fit items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-xs font-medium text-accent">
              <Sparkles className="size-3.5" />
              About DistroSource
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight text-hero-foreground text-balance sm:text-5xl">
              Everything digital. One source.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty">
              DistroSource is a department store for digital products — templates, fonts, presentation kits, Notion
              systems, 3D assets, and more — unlocked into your library in seconds.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-14 sm:px-8">
          <RevealGroup className="grid grid-cols-2 gap-4 sm:grid-cols-4" stagger={0.06}>
            {statCards.map((stat) => (
              <RevealItem key={stat.label}>
                <div className="rounded-xl border border-border bg-card p-5 text-center">
                  <p className="font-display text-2xl font-bold text-primary sm:text-3xl">{stat.value}</p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">{stat.label}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-6 sm:px-8">
          <Reveal>
            <h2 className="font-display text-2xl font-bold tracking-tight">Our mission</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Buying a digital asset shouldn&apos;t be complicated. Whether you&apos;re shipping a client site,
              putting together a pitch deck, or building out a Notion workspace, DistroSource exists to make that
              purchase instant, transparent, and trustworthy — with clear licensing, real preview files, and a
              support team that actually answers.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Every product in our catalog of {stats.productCount.toLocaleString()}+ items ships with real preview
              images and a real sample file before it ever goes live — so what you see is exactly what you get.
            </p>
          </Reveal>
        </section>

        <section className="bg-secondary/40 py-16">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <div className="mb-10 text-center">
              <h2 className="font-display text-2xl font-bold tracking-tight">What we stand for</h2>
            </div>
            <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.06}>
              {values.map((value) => (
                <RevealItem key={value.title}>
                  <div className="h-full rounded-xl border border-border bg-card p-5">
                    <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <value.icon className="size-5" />
                    </span>
                    <h3 className="mt-4 text-sm font-semibold">{value.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{value.description}</p>
                  </div>
                </RevealItem>
              ))}
            </RevealGroup>
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-6 py-16 sm:px-8">
          <div className="mb-10 text-center">
            <h2 className="font-display text-2xl font-bold tracking-tight">Our story so far</h2>
          </div>
          <Reveal className="flex flex-col gap-6 border-l border-border pl-6">
            {timeline.map((item) => (
              <div key={item.year} className="relative">
                <span className="absolute -left-[31px] top-1 flex size-3 items-center justify-center rounded-full bg-primary ring-4 ring-background" />
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">{item.year}</p>
                <h3 className="mt-1 text-sm font-semibold text-foreground">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </Reveal>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-16 text-center sm:px-8">
          <span className="mx-auto flex w-fit items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
            <Building2 className="size-3.5" />
            Business & teams
          </span>
          <h2 className="mt-4 font-display text-2xl font-bold tracking-tight">Want to work with us?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            From agency licensing to volume purchases, we&apos;d love to hear from you.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" className="h-11 px-6 font-semibold" nativeButton={false} render={<Link href="/contact" />}>
              Contact us
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-11 px-6 font-semibold"
              nativeButton={false}
              render={<Link href="/team-licensing" />}
            >
              Team licensing for business
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

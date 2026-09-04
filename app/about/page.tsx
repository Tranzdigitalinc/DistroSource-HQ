import Link from "next/link"
import { Sparkles, ShieldCheck, Zap, HeartHandshake, LayoutTemplate, Building2, FileCheck, Lock, LifeBuoy } from "lucide-react"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { Button } from "@/components/ui/button"
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal"
import { getStorefrontStats } from "@/lib/queries/catalog"

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

const standards = [
  {
    icon: FileCheck,
    title: "Rights-checked catalog",
    description:
      "Every listing is reviewed for distribution rights before it goes live. Nothing is published as owned inventory without a verified source.",
  },
  {
    icon: Lock,
    title: "Secure digital delivery",
    description:
      "Files are served through account-gated downloads over an encrypted connection, so purchases stay tied to your account and your library.",
  },
  {
    icon: LifeBuoy,
    title: "Support that answers",
    description:
      "Every ticket — download issues, license questions, account access — is reviewed personally by our support team.",
  },
]

export default async function AboutPage() {
  const stats = await getStorefrontStats()

  const statCards = [
    { label: "Products in catalog", value: `${stats.productCount.toLocaleString()}+` },
    { label: "Categories", value: `${stats.categoryCount}+` },
    ...(stats.reviewCount > 0
      ? [
          { label: "Customer reviews", value: `${stats.reviewCount.toLocaleString()}+` },
          { label: "Average customer rating", value: stats.avgRating.toFixed(1) },
        ]
      : []),
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
          <RevealGroup
            className={`grid grid-cols-2 gap-4 ${statCards.length >= 4 ? "sm:grid-cols-4" : "sm:grid-cols-2"}`}
            stagger={0.06}
          >
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
            <h2 className="font-display text-2xl font-bold tracking-tight">Why DistroSource exists</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              DistroSource was created to make professional digital products easier to discover, purchase, and
              manage from one place. Whether you&apos;re shipping a client site, putting together a pitch deck, or
              building out a Notion workspace, we want that purchase to be instant, transparent, and trustworthy —
              with clear licensing, real preview files, and a support team that actually answers.
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
            <h2 className="font-display text-2xl font-bold tracking-tight">Our standards</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              What every product on DistroSource is held to before it reaches the catalog.
            </p>
          </div>
          <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3" stagger={0.06}>
            {standards.map((item) => (
              <RevealItem key={item.title}>
                <div className="h-full rounded-xl border border-border bg-card p-5">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{item.description}</p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
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

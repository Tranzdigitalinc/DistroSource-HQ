import Link from "next/link"
import { Globe2, ShieldCheck, Zap, HeartHandshake, Gamepad2, Building2 } from "lucide-react"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { Button } from "@/components/ui/button"
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal"
import { getMarketplaceStats } from "@/lib/queries/catalog"

export const metadata = {
  title: "About Us — RedeemCove",
  description:
    "RedeemCove is a digital marketplace for gift cards, game top-ups, mobile recharges, and software licenses, delivered instantly worldwide.",
}

const values = [
  {
    icon: Zap,
    title: "Instant by design",
    description:
      "Every product on RedeemCove is delivered digitally the moment payment is confirmed — no shipping, no waiting.",
  },
  {
    icon: ShieldCheck,
    title: "Verified inventory",
    description:
      "We source every code directly from authorized distributors and fulfillment partners, and verify it before it's listed for sale.",
  },
  {
    icon: Globe2,
    title: "Built for a global audience",
    description:
      "Regional pricing, local currencies, and country-specific catalogs make it easy to shop no matter where you are.",
  },
  {
    icon: HeartHandshake,
    title: "Support that responds",
    description:
      "Our support team reviews every ticket personally — from delivery delays to refund requests — with fast, human follow-up.",
  },
]

const timeline = [
  {
    year: "2021",
    title: "RedeemCove is founded",
    description: "Started as a small catalog of gaming top-ups for a handful of regions.",
  },
  {
    year: "2022",
    title: "Streaming & software added",
    description: "Expanded into streaming subscriptions, software licenses, and mobile recharges.",
  },
  {
    year: "2023",
    title: "Global fulfillment partnerships",
    description: "Partnered with international distribution networks to support instant delivery worldwide.",
  },
  {
    year: "2024",
    title: "Bulk gifting for business",
    description: "Launched a dedicated program for HR, marketing, and rewards teams ordering at volume.",
  },
]

export default async function AboutPage() {
  const stats = await getMarketplaceStats()

  const statCards = [
    { label: "Brands available", value: `${stats.brandCount}+` },
    { label: "Products in catalog", value: `${stats.productCount.toLocaleString()}+` },
    { label: "Countries served", value: `${stats.countryCount}+` },
    { label: "Average customer rating", value: stats.avgRating.toFixed(1) },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-hero">
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "radial-gradient(circle at 15% 30%, oklch(0.72 0.14 220 / 0.45), transparent 45%), radial-gradient(circle at 85% 80%, oklch(0.6 0.15 240 / 0.35), transparent 45%)",
            }}
          />
          <div className="relative mx-auto max-w-4xl px-6 py-20 text-center sm:px-8">
            <span className="mx-auto flex w-fit items-center gap-1.5 rounded-full bg-hero-foreground/10 px-3 py-1 text-xs font-medium text-hero-foreground/90 ring-1 ring-inset ring-hero-foreground/20">
              <Gamepad2 className="size-3.5 text-hero-accent" />
              About RedeemCove
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight text-hero-foreground text-balance sm:text-5xl">
              The instant marketplace for digital value
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-hero-foreground/75 text-pretty">
              RedeemCove connects customers with gift cards, game top-ups, mobile recharges, and software licenses —
              delivered to your account in seconds, wherever you are.
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
              Buying digital value shouldn&apos;t be complicated. Whether you&apos;re topping up a game, gifting a
              streaming subscription, or recharging a family member&apos;s phone abroad, RedeemCove exists to make
              that purchase instant, transparent, and trustworthy — with real-time pricing, verified codes, and a
              support team that actually answers.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              We work directly with authorized distributors and regional fulfillment partners to keep our catalog
              current across {stats.countryCount}+ countries, so the products you see reflect real, redeemable
              inventory — not stale listings.
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
            From bulk gifting programs to brand partnerships, we&apos;d love to hear from you.
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
              render={<Link href="/bulk-gifting" />}
            >
              Bulk gifting for business
            </Button>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

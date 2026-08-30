import Link from "next/link"
import { Building2, Gift, Percent, ShieldCheck, Sparkles, Users } from "lucide-react"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { Button } from "@/components/ui/button"
import { getMarketplaceStats } from "@/lib/queries/catalog"

export const metadata = {
  title: "Bulk Gifting for Teams & Businesses | RedeemCove",
  description:
    "Reward employees, delight customers, and run incentive programs with volume gift card orders, tiered discounts, and instant digital delivery.",
}

const perks = [
  {
    icon: Percent,
    title: "Volume-based pricing",
    description: "Unlock deeper discounts automatically as your order quantity grows — no negotiation required.",
  },
  {
    icon: Sparkles,
    title: "Instant digital delivery",
    description: "Codes are generated and delivered by email the moment your order is confirmed, no shipping delays.",
  },
  {
    icon: ShieldCheck,
    title: "Verified & authorized codes",
    description: "Every code is sourced directly from authorized distributors and backed by our buyer protection.",
  },
  {
    icon: Building2,
    title: "Consolidated invoicing",
    description: "One invoice for your whole order, itemized by brand and denomination for easy expense reporting.",
  },
]

const useCases = [
  { icon: Users, title: "Employee rewards", description: "Recognition programs, holiday bonuses, and milestones." },
  { icon: Gift, title: "Customer incentives", description: "Referral rewards, loyalty perks, and giveaway prizes." },
  { icon: Sparkles, title: "Event & conference swag", description: "Attendee gifts and sponsor giveaway bundles." },
]

export default async function BulkGiftingPage() {
  const stats = await getMarketplaceStats()

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
              <Building2 className="size-3.5 text-hero-accent" />
              For teams, HR, and marketing departments
            </span>
            <h1 className="mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight text-hero-foreground text-balance sm:text-5xl">
              Bulk gift cards for rewards, incentives, and giveaways
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-hero-foreground/75 text-pretty">
              Order {stats.brandCount}+ brands at volume pricing, delivered instantly to your team or straight to
              recipients — no manual fulfillment required.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button
                size="lg"
                nativeButton={false}
                className="h-12 bg-hero-foreground px-6 font-semibold text-hero hover:bg-hero-foreground/90"
                render={<a href="mailto:business@redeemcove.com?subject=Bulk%20gifting%20inquiry" />}
              >
                Contact sales
              </Button>
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                className="h-12 border-hero-foreground/25 bg-transparent px-6 font-semibold text-hero-foreground hover:bg-hero-foreground/10"
                render={<Link href="/products" />}
              >
                Browse the catalog
              </Button>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16 sm:px-8">
          <div className="mb-10 text-center">
            <h2 className="font-display text-2xl font-bold tracking-tight">Built for volume orders</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Everything you need to run a rewards program without the operational overhead
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {perks.map((perk) => (
              <div key={perk.title} className="rounded-xl border border-border bg-card p-5">
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <perk.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-sm font-semibold">{perk.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{perk.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-secondary/40 py-16">
          <div className="mx-auto max-w-6xl px-6 sm:px-8">
            <div className="mb-10 text-center">
              <h2 className="font-display text-2xl font-bold tracking-tight">Popular use cases</h2>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {useCases.map((useCase) => (
                <div
                  key={useCase.title}
                  className="rounded-xl border border-border bg-card p-6 text-center transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
                >
                  <span className="mx-auto flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <useCase.icon className="size-6" />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold">{useCase.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{useCase.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-16 text-center sm:px-8">
          <h2 className="font-display text-2xl font-bold tracking-tight">Ready to place a bulk order?</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Tell us the brands, quantities, and denominations you need — our team responds within one business day.
          </p>
          <Button
            size="lg"
            className="mt-6 h-12 px-6 font-semibold"
            nativeButton={false}
            render={<a href="mailto:business@redeemcove.com?subject=Bulk%20gifting%20inquiry" />}
          >
            Email business@redeemcove.com
          </Button>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

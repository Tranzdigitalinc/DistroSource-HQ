import type { Metadata } from "next"
import Link from "next/link"
import { SiteFooter } from "@/components/footer/site-footer"
import { SubscriptionCard } from "@/components/gaming/subscription-card"
import { SiteHeader } from "@/components/header/site-header"
import { GAMING_SUBSCRIPTION_PLANS } from "@/lib/gaming/subscriptions/catalog"

export const metadata: Metadata = {
  title: "Gaming Subscriptions | DistroSource",
  description: "Compare 100 clearly scoped FiveM, Minecraft, server operations, branding, credits and Pick & Keep subscription plans.",
  alternates: { canonical: "/gaming/subscriptions" },
}

const platforms = ["All", "FiveM", "Minecraft", "Game Servers"] as const
const families = ["All", ...new Set(GAMING_SUBSCRIPTION_PLANS.map((plan) => plan.family))]

export default async function GamingSubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const params = await searchParams
  const q = params.q?.trim().toLowerCase() ?? ""
  const filtered = GAMING_SUBSCRIPTION_PLANS.filter(
    (plan) =>
      (!params.platform || params.platform === "All" || plan.platform === params.platform) &&
      (!params.family || params.family === "All" || plan.family === params.family) &&
      (!q || `${plan.name} ${plan.summary} ${plan.categories.join(" ")}`.toLowerCase().includes(q)),
  )

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-secondary/30">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 md:py-20">
            <p className="font-mono text-xs font-semibold uppercase tracking-[0.2em] text-primary">Recurring Gaming</p>
            <h1 className="mt-3 max-w-4xl font-display text-4xl font-bold tracking-tight sm:text-5xl">
              Know exactly what renews—and what you keep.
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground">
              Every plan defines its benefit quantity, billing cadence, eligible products, exclusions, rollover policy,
              cancellation behavior and license boundaries. All listings remain previews until their real deliverables and
              eligibility rules are published.
            </p>
            <div className="mt-7 flex flex-wrap gap-3 text-sm">
              <span className="rounded-full border border-border bg-card px-3 py-1.5">100 differentiated plans</span>
              <span className="rounded-full border border-border bg-card px-3 py-1.5">500 deterministic previews</span>
              <span className="rounded-full border border-border bg-card px-3 py-1.5">Monthly + annual billing</span>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-5 py-10 sm:px-8">
          <form
            className="grid gap-3 rounded-xl border border-border bg-card p-4 sm:grid-cols-[1fr_180px_220px_auto]"
            action="/gaming/subscriptions"
          >
            <label className="sr-only" htmlFor="subscription-search">Search subscriptions</label>
            <input
              id="subscription-search"
              name="q"
              defaultValue={params.q}
              placeholder="Search plans and included categories"
              className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-primary"
            />
            <label className="sr-only" htmlFor="subscription-platform">Platform</label>
            <select
              id="subscription-platform"
              name="platform"
              defaultValue={params.platform ?? "All"}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            >
              {platforms.map((platform) => <option key={platform}>{platform}</option>)}
            </select>
            <label className="sr-only" htmlFor="subscription-family">Plan family</label>
            <select
              id="subscription-family"
              name="family"
              defaultValue={params.family ?? "All"}
              className="h-10 rounded-md border border-border bg-background px-3 text-sm"
            >
              {families.map((family) => <option key={family}>{family}</option>)}
            </select>
            <button className="h-10 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground">Filter</button>
          </form>

          <div className="mt-7 flex items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground"><strong className="text-foreground">{filtered.length}</strong> plans</p>
            {(params.q || params.platform || params.family) && (
              <Link href="/gaming/subscriptions" className="text-sm font-semibold text-primary hover:underline">Clear filters</Link>
            )}
          </div>
          <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((plan) => <SubscriptionCard key={plan.slug} plan={plan} />)}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

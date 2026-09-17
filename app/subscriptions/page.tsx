import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { PageHeader } from "@/components/page-header"
import { SubscriptionClubs, type ClubGroup, type ClubPlanView } from "@/components/membership/subscription-clubs"
import { listActiveMemberships, listSubscriptionPlans } from "@/lib/membership"
import { getCategories } from "@/lib/queries/catalog"
import { areSubscriptionClubsEnabled } from "@/lib/env"
import { getOptionalUserId, getSession } from "@/lib/session"

export const metadata: Metadata = {
  title: "Subscriptions — DistroSource",
  description:
    "Pick-and-keep subscriptions: claim templates, fonts, audio, presets, 3D kits and business documents every month and keep everything you claim.",
}

const FAQ = [
  {
    q: "What does “keep what you claim” mean?",
    a: "A claim adds the product to your library permanently under the personal licence — it stays yours after you cancel. Commercial and agency rights run while your subscription is active.",
  },
  {
    q: "Can I subscribe to more than one?",
    a: "Yes. Clubs are separate subscriptions, so you can hold a couple of narrow ones, or a bundle, or All-Access. You can only hold one subscription per plan.",
  },
  {
    q: "Do unused claims roll over?",
    a: "No. Claims reset at the start of each billing period, so use them while they're there.",
  },
  {
    q: "What is the value cap?",
    a: "Each plan covers products up to a stated price. If you want the priciest items in a department, choose a plan whose cap covers them, or buy that product outright.",
  },
]

/** Drops are clubs too, but they release weekly and are priced for impulse. */
const isDrop = (slug: string) => slug.endsWith("-drop")

export default async function SubscriptionsPage() {
  if (!areSubscriptionClubsEnabled()) notFound()

  const [plans, categories, userId, session] = await Promise.all([
    listSubscriptionPlans(),
    getCategories(),
    getOptionalUserId(),
    getSession(),
  ])
  const active = await listActiveMemberships(userId)
  const categoryName = new Map(categories.map((c) => [c.slug, c.name]))

  const toView = (p: Awaited<ReturnType<typeof listSubscriptionPlans>>[number]): ClubPlanView => ({
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    imageUrl: p.imageUrl,
    monthlyPriceUsd: Number.parseFloat(p.monthlyPriceUsd),
    annualPriceUsd: Number.parseFloat(p.annualPriceUsd),
    monthlyCredits: p.monthlyCredits,
    creditValueCapUsd: p.creditValueCapUsd ? Number.parseFloat(p.creditValueCapUsd) : null,
    discountPercent: p.discountPercent,
    perks: p.perks ?? [],
    scopeNames: (p.scopeCategorySlugs ?? []).map((slug) => categoryName.get(slug) ?? slug),
  })

  const groups: ClubGroup[] = [
    {
      id: "clubs",
      title: "Department clubs",
      blurb: "One department, one or two claims a month. The cheapest way to keep a single kind of work supplied.",
      plans: plans.filter((p) => p.kind === "club" && !isDrop(p.slug)).map(toView),
    },
    {
      id: "drops",
      title: "Drops",
      blurb: "Small, frequent releases — new work every week, claim one pack a month.",
      plans: plans.filter((p) => p.kind === "club" && isDrop(p.slug)).map(toView),
    },
    {
      id: "bundles",
      title: "Bundles",
      blurb: "Several departments at once, shaped around how people actually work.",
      plans: plans.filter((p) => p.kind === "bundle").map(toView),
    },
    {
      id: "all-access",
      title: "All-Access",
      blurb: "Everything in the store, no value cap, eight claims a month.",
      plans: plans.filter((p) => p.kind === "all-access").map(toView),
    },
  ].filter((g) => g.plans.length > 0)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-x pb-20 pt-10 md:pt-14">
          <PageHeader
            eyebrow="Subscriptions"
            title="Claim what you need, keep it forever"
            description="Pick a department or take the lot. Every plan grants claims each month, and everything you claim stays in your library — even after you cancel."
            className="mb-10 text-center"
          />

          {groups.length > 0 ? (
            <SubscriptionClubs
              groups={groups}
              isSignedIn={Boolean(session?.user)}
              defaultEmail={session?.user?.email ?? ""}
              activeSlugs={active.map((row) => row.plan.slug)}
            />
          ) : (
            <p className="text-center text-sm text-muted-foreground">Subscriptions are being set up. Please check back shortly.</p>
          )}

          <section aria-labelledby="subs-faq" className="mx-auto mt-20 max-w-3xl">
            <h2 id="subs-faq" className="text-center font-display text-2xl font-bold tracking-tight text-foreground">
              Questions
            </h2>
            <dl className="mt-8 flex flex-col gap-3">
              {FAQ.map((item) => (
                <div key={item.q} className="rounded-2xl border border-border bg-card p-5">
                  <dt className="font-display text-base font-semibold text-foreground">{item.q}</dt>
                  <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.a}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { notFound } from "next/navigation"
import { SiteFooter } from "@/components/footer/site-footer"
import { SiteHeader } from "@/components/header/site-header"
import { GAMING_SUBSCRIPTION_PLANS, getGamingSubscriptionPlan } from "@/lib/gaming/subscriptions/catalog"

export function generateStaticParams() {
  return GAMING_SUBSCRIPTION_PLANS.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const plan = getGamingSubscriptionPlan(slug)
  if (!plan) return {}
  return {
    title: `${plan.name} | DistroSource Gaming`,
    description: plan.summary,
    alternates: { canonical: `/gaming/subscriptions/${slug}` },
  }
}

function DetailList({ items, negative = false }: { items: string[]; negative?: boolean }) {
  return (
    <ul className="space-y-2">
      {items.map((item) => (
        <li key={item} className="flex gap-2 text-sm leading-relaxed text-muted-foreground">
          <span aria-hidden className={negative ? "text-destructive" : "text-success"}>{negative ? "—" : "✓"}</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  )
}

export default async function GamingSubscriptionPage({ params }: { params: Promise<{ slug: string }> }) {
  const plan = getGamingSubscriptionPlan((await params).slug)
  if (!plan) notFound()
  const images = [plan.cover, ...plan.gallery]

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-5 py-7 sm:px-8">
          <nav className="mb-5 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/gaming">Gaming</Link> / <Link href="/gaming/subscriptions">Subscriptions</Link> /{" "}
            <span className="text-foreground">{plan.name}</span>
          </nav>

          <div className="grid items-start gap-9 lg:grid-cols-[minmax(0,3fr)_minmax(340px,2fr)]">
            <div className="space-y-4">
              <div className="relative aspect-[8/5] overflow-hidden rounded-xl border border-border bg-secondary">
                <Image src={images[0]} alt={`${plan.name} cover`} fill priority sizes="(max-width: 1024px) 100vw, 60vw" className="object-cover" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                {images.slice(1).map((image, index) => (
                  <div key={image} className="relative aspect-[8/5] overflow-hidden rounded-lg border border-border bg-secondary">
                    <Image src={image} alt={`${plan.name} gallery preview ${index + 1}`} fill sizes="(max-width: 640px) 50vw, 30vw" className="object-cover" />
                  </div>
                ))}
              </div>
            </div>

            <aside className="space-y-5 lg:sticky lg:top-24">
              <div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded bg-secondary px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide">{plan.platform}</span>
                  <span className="rounded bg-secondary px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide">{plan.family}</span>
                  <span className="rounded bg-warning/15 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-warning">Preview—not purchasable</span>
                </div>
                <h1 className="mt-4 font-display text-3xl font-bold tracking-tight">{plan.name}</h1>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{plan.summary}</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="grid grid-cols-2 gap-3">
                  <div><p className="text-xs uppercase tracking-wide text-muted-foreground">Monthly</p><p className="mt-1 text-3xl font-bold">${plan.monthlyPriceUsd}</p></div>
                  <div><p className="text-xs uppercase tracking-wide text-muted-foreground">Annual</p><p className="mt-1 text-3xl font-bold">${plan.annualPriceUsd}</p></div>
                </div>
                <button type="button" disabled className="mt-5 w-full cursor-not-allowed rounded-md bg-muted px-4 py-3 text-sm font-semibold text-muted-foreground">Coming after deliverables pass review</button>
                <p className="mt-3 text-xs leading-relaxed text-muted-foreground">No payment can be taken from this preview listing. Activation requires a verified recurring payment webhook after launch.</p>
              </div>
            </aside>
          </div>

          <div className="mt-14 grid gap-10 border-t border-border pt-10 lg:grid-cols-[2fr_1fr]">
            <div className="space-y-12">
              <section>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">What You Get</p>
                <h2 className="mt-2 font-display text-2xl font-bold">Exact plan entitlements</h2>
                <div className="mt-5"><DetailList items={plan.whatYouGet} /></div>
              </section>
              <section>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">How It Works</p>
                <ol className="mt-5 space-y-4">
                  {plan.howItWorks.map((step, index) => (
                    <li key={step} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-xs font-bold text-foreground">{index + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </section>
              <section>
                <p className="font-mono text-xs font-semibold uppercase tracking-[0.16em] text-primary">After Cancellation</p>
                <h2 className="mt-2 font-display text-2xl font-bold">Access behavior</h2>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{plan.cancellationRule}</p>
              </section>
              <section className="grid gap-8 sm:grid-cols-2">
                <div><h2 className="font-display text-xl font-bold">Eligible</h2><div className="mt-4"><DetailList items={plan.eligible} /></div></div>
                <div><h2 className="font-display text-xl font-bold">Not included</h2><div className="mt-4"><DetailList items={plan.excluded} negative /></div></div>
              </section>
            </div>
            <aside className="space-y-6">
              {[
                ["Billing cadence", plan.cadence], ["Renewal", plan.renewal], ["Access", plan.accessRule],
                ["Rollover", plan.rolloverRule], ["Updates", plan.updates], ["License", plan.license],
                ["Commercial use", plan.commercialUse], ["Usage limits", plan.usageLimits],
              ].map(([title, copy]) => (
                <div key={title} className="rounded-lg border border-border bg-card p-4">
                  <h3 className="text-sm font-bold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy}</p>
                </div>
              ))}
            </aside>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

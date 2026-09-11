import type { Metadata } from "next"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { PageHeader } from "@/components/page-header"
import { Reveal } from "@/components/motion/reveal"
import { MembershipPricing, type PlanView } from "@/components/membership/membership-pricing"
import { listActiveMembershipPlans, getMembershipView } from "@/lib/membership"
import { getOptionalUserId, getSession } from "@/lib/session"
import { Gift, Tag, Sparkles, ICON_SIZE } from "@/lib/storefront-icons"

export const metadata: Metadata = {
  title: "Membership — DistroSource",
  description:
    "Join DistroSource membership for a store-wide discount on every purchase, monthly download credits, and members-only perks. Billed monthly or annually, cancel anytime.",
}

const FAQ = [
  {
    q: "How does billing work?",
    a: "Memberships are billed securely through Fungies, our merchant of record. Your card is stored by Fungies and charged automatically each cycle — we never see or store your card details.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your account in one click. Your membership stays active — with all its benefits — until the end of the period you've already paid for.",
  },
  {
    q: "What are download credits?",
    a: "Each cycle your plan grants a number of credits. One credit claims one eligible product (up to your plan's per-credit value), added straight to your library. Unused credits reset each cycle; Elite is unlimited.",
  },
  {
    q: "Does the discount stack with coupons?",
    a: "Your membership discount is a guaranteed floor: at checkout you automatically get whichever is larger — your member rate or an active coupon — never both added together.",
  },
  {
    q: "What if I'm checking out as a guest?",
    a: "You can start a membership with just your email. Create an account with that same email afterwards and your membership and benefits attach to it automatically.",
  },
]

const HIGHLIGHTS = [
  { icon: Tag, title: "Save on everything", body: "Your member discount applies automatically to every product, every time — no code needed." },
  { icon: Gift, title: "Monthly download credits", body: "Claim eligible products for free each cycle with credits that top up automatically." },
  { icon: Sparkles, title: "Members-only perks", body: "Priority support, early access to new releases, and exclusive member-only drops." },
]

export default async function MembershipPage() {
  const [rows, userId, session] = await Promise.all([listActiveMembershipPlans(), getOptionalUserId(), getSession()])
  const view = await getMembershipView(userId)

  const plans: PlanView[] = rows.map((p) => ({
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    monthlyPriceUsd: Number.parseFloat(p.monthlyPriceUsd),
    annualPriceUsd: Number.parseFloat(p.annualPriceUsd),
    discountPercent: p.discountPercent,
    monthlyCredits: p.monthlyCredits,
    creditValueCapUsd: p.creditValueCapUsd ? Number.parseFloat(p.creditValueCapUsd) : null,
    perks: p.perks ?? [],
    isPopular: p.isPopular,
  }))

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-x pb-20 pt-10 md:pt-14">
          <PageHeader
            eyebrow="Membership"
            title="Get more from every download"
            description="One membership, everything cheaper. A store-wide discount on every purchase, free download credits each month, and perks that pay for themselves."
            className="mb-10 text-center"
          />

          {plans.length > 0 ? (
            <MembershipPricing
              plans={plans}
              isSignedIn={Boolean(session?.user)}
              defaultEmail={session?.user?.email ?? ""}
              currentPlanSlug={view?.isActive ? view.plan.slug : null}
              isActiveMember={Boolean(view?.isActive)}
            />
          ) : (
            <p className="text-center text-sm text-muted-foreground">Membership plans are being set up. Please check back shortly.</p>
          )}

          <section aria-label="Membership benefits" className="mt-20 grid grid-cols-1 gap-5 md:grid-cols-3">
            {HIGHLIGHTS.map(({ icon: Icon, title, body }, i) => (
              <Reveal key={title} delay={i * 0.08} className="rounded-2xl border border-border bg-card p-6">
                <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon size={ICON_SIZE.base} weight="duotone" aria-hidden="true" />
                </span>
                <h3 className="mt-4 font-display text-base font-bold text-foreground">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{body}</p>
              </Reveal>
            ))}
          </section>

          <section aria-labelledby="faq-heading" className="mx-auto mt-20 max-w-3xl">
            <h2 id="faq-heading" className="text-center font-display text-2xl font-bold tracking-tight text-foreground">
              Membership FAQ
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

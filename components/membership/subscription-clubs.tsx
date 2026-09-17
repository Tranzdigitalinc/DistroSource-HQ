"use client"

/**
 * The subscription clubs grid: scoped "pick & keep" plans grouped by kind.
 * Checkout is the membership flow exactly — a Fungies recurring offer created
 * server-side, paid in the overlay, activated only by the verified webhook.
 */

import { useCallback, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { toast } from "sonner"
import { motion } from "motion/react"
import { ArrowRight, Check, ShieldCheck, ICON_SIZE } from "@/lib/storefront-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PriceDisplay } from "@/components/price-display"
import { FungiesCheckout, type FungiesBillingData, type FungiesConfirmResult } from "@/components/checkout/fungies-checkout"
import { startMembershipCheckout, confirmMembershipCheckout } from "@/lib/actions/subscriptions"
import { cn } from "@/lib/utils"

export interface ClubPlanView {
  slug: string
  name: string
  tagline: string | null
  imageUrl: string | null
  monthlyPriceUsd: number
  annualPriceUsd: number
  monthlyCredits: number | null
  creditValueCapUsd: number | null
  discountPercent: number
  perks: string[]
  /** Department names this plan's claims may come from; empty = whole store. */
  scopeNames: string[]
}

export interface ClubGroup {
  id: string
  title: string
  blurb: string
  plans: ClubPlanView[]
}

type Interval = "month" | "year"

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface StartedCheckout {
  reference: string
  checkoutUrl: string
  fallbackUrl: string
  billingData: FungiesBillingData
  planName: string
}

export function SubscriptionClubs({
  groups,
  isSignedIn,
  defaultEmail,
  activeSlugs,
}: {
  groups: ClubGroup[]
  isSignedIn: boolean
  defaultEmail: string
  activeSlugs: string[]
}) {
  const router = useRouter()
  const [interval, setInterval] = useState<Interval>("month")
  const [email, setEmail] = useState(defaultEmail)
  const [pendingSlug, setPendingSlug] = useState<string | null>(null)
  const [checkout, setCheckout] = useState<StartedCheckout | null>(null)
  const [isPending, startTransition] = useTransition()

  const confirm = useCallback(async (ref: string): Promise<FungiesConfirmResult> => {
    const r = await confirmMembershipCheckout(ref)
    if (r.status === "active") return { status: "paid", orderNumber: r.reference }
    if (r.status === "error") return { status: "error", error: r.error }
    return { status: "pending" }
  }, [])

  const handleSubscribe = useCallback(
    (plan: ClubPlanView) => {
      const trimmedEmail = email.trim()
      if (!isSignedIn && !EMAIL.test(trimmedEmail)) {
        toast.error("Enter your email to start your subscription.")
        return
      }
      setPendingSlug(plan.slug)
      startTransition(async () => {
        const result = await startMembershipCheckout({ planSlug: plan.slug, interval, email: trimmedEmail })
        setPendingSlug(null)
        if ("error" in result) {
          toast.error(result.error)
          return
        }
        setCheckout({ ...result, planName: plan.name })
      })
    },
    [email, interval, isSignedIn],
  )

  if (checkout) {
    return (
      <div className="mx-auto max-w-md">
        <FungiesCheckout
          orderNumber={checkout.reference}
          checkoutUrl={checkout.checkoutUrl}
          fallbackUrl={checkout.fallbackUrl}
          billingData={checkout.billingData}
          confirm={confirm}
          context="membership"
          onPaid={() => router.push("/account/membership")}
          onCancel={() => setCheckout(null)}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-10">
      {activeSlugs.length > 0 && (
        <div className="mx-auto flex flex-wrap items-center justify-center gap-3 rounded-full border border-primary/30 bg-primary/10 px-5 py-2.5 text-sm">
          <ShieldCheck size={ICON_SIZE.sm} className="text-primary" aria-hidden="true" />
          <span className="font-medium text-foreground">
            You have {activeSlugs.length} active subscription{activeSlugs.length === 1 ? "" : "s"}.
          </span>
          <Link href="/account/membership" className="font-semibold text-primary underline-offset-4 hover:underline">
            Manage
          </Link>
        </div>
      )}

      <div className="mx-auto inline-flex items-center gap-1 rounded-full border border-border bg-card p-1" role="group" aria-label="Billing interval">
        {(["month", "year"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => setInterval(value)}
            aria-pressed={interval === value}
            className={cn(
              "rounded-full px-5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              interval === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {value === "month" ? "Monthly" : "Annual"}
            {value === "year" && (
              <span
                className={cn(
                  "ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide",
                  interval === "year" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-success/15 text-success",
                )}
              >
                2 months free
              </span>
            )}
          </button>
        ))}
      </div>

      {!isSignedIn && (
        <div className="mx-auto w-full max-w-sm">
          <label htmlFor="club-email" className="mb-1.5 block text-center text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
            Your email for billing &amp; access
          </label>
          <Input
            id="club-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@studio.com"
            className="h-11 rounded-xl text-center"
          />
        </div>
      )}

      {groups.map((group) => (
        <section key={group.id} aria-labelledby={`group-${group.id}`} className="flex flex-col gap-5">
          <div>
            <h2 id={`group-${group.id}`} className="font-display text-xl font-bold tracking-tight text-foreground">
              {group.title}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">{group.blurb}</p>
          </div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {group.plans.map((plan, i) => (
              <ClubCard
                key={plan.slug}
                plan={plan}
                interval={interval}
                index={i}
                isCurrent={activeSlugs.includes(plan.slug)}
                loading={isPending && pendingSlug === plan.slug}
                onSubscribe={() => handleSubscribe(plan)}
              />
            ))}
          </div>
        </section>
      ))}

      <p className="text-center text-xs text-muted-foreground">
        Billed securely by Fungies. Everything you claim stays yours after you cancel, under the personal licence; commercial
        and agency rights run while the subscription is active.
      </p>
    </div>
  )
}

function ClubCard({
  plan,
  interval,
  index,
  isCurrent,
  loading,
  onSubscribe,
}: {
  plan: ClubPlanView
  interval: Interval
  index: number
  isCurrent: boolean
  loading: boolean
  onSubscribe: () => void
}) {
  const price = interval === "year" ? plan.annualPriceUsd : plan.monthlyPriceUsd
  const claims = plan.monthlyCredits
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: Math.min(index, 5) * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col overflow-hidden rounded-3xl border border-border bg-card"
    >
      {plan.imageUrl && (
        <div className="relative aspect-video w-full">
          <Image
            src={plan.imageUrl}
            alt={`${plan.name} cover`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
      )}
      <div className="flex flex-1 flex-col p-6">
      <h3 className="font-display text-lg font-bold text-foreground">{plan.name}</h3>
      {plan.tagline && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{plan.tagline}</p>}

      <div className="mt-4 flex items-end gap-1.5">
        <span className="font-display text-3xl font-bold tabular-nums tracking-tight text-foreground">
          <PriceDisplay usdAmount={price} />
        </span>
        <span className="pb-1 text-sm text-muted-foreground">/{interval === "year" ? "yr" : "mo"}</span>
      </div>

      <dl className="mt-4 flex flex-col gap-1.5 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Claims each month</dt>
          <dd className="font-semibold text-foreground">{claims === null ? "Unlimited" : claims}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Value per claim</dt>
          <dd className="font-semibold text-foreground">
            {plan.creditValueCapUsd === null ? "Any price" : <>up to <PriceDisplay usdAmount={plan.creditValueCapUsd} /></>}
          </dd>
        </div>
      </dl>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {(plan.scopeNames.length ? plan.scopeNames : ["Every department"]).map((name) => (
          <span key={name} className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-foreground">
            {name}
          </span>
        ))}
      </div>

      <Button
        onClick={onSubscribe}
        disabled={isCurrent || loading}
        aria-busy={loading}
        variant="outline"
        className="mt-5 h-11 w-full rounded-full bg-transparent font-semibold"
      >
        {isCurrent ? "Your current plan" : loading ? "Opening checkout…" : "Subscribe"}
        {!isCurrent && !loading && <ArrowRight size={ICON_SIZE.base} aria-hidden="true" />}
      </Button>

      <ul className="mt-5 flex flex-col gap-2 border-t border-border pt-4">
        {plan.perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2 text-sm">
            <Check size={ICON_SIZE.sm} weight="bold" className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
            <span className="text-muted-foreground">{perk}</span>
          </li>
        ))}
      </ul>
      </div>
    </motion.div>
  )
}

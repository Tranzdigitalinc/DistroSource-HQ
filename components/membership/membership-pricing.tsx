"use client"

import { useCallback, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { AnimatePresence, motion } from "motion/react"
import { ArrowRight, Check, Flame, Sparkles, Zap, ShieldCheck, ICON_SIZE } from "@/lib/storefront-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PriceDisplay } from "@/components/price-display"
import {
  FungiesCheckout,
  type FungiesBillingData,
  type FungiesConfirmResult,
} from "@/components/checkout/fungies-checkout"
import { startMembershipCheckout, confirmMembershipCheckout } from "@/lib/actions/subscriptions"
import { cn } from "@/lib/utils"

export interface PlanView {
  slug: string
  name: string
  tagline: string | null
  description: string | null
  monthlyPriceUsd: number
  annualPriceUsd: number
  discountPercent: number
  monthlyCredits: number | null
  creditValueCapUsd: number | null
  perks: string[]
  isPopular: boolean
}

type Interval = "month" | "year"

const PLAN_ICON: Record<string, typeof Zap> = { starter: Zap, pro: Sparkles, elite: Flame }
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface StartedCheckout {
  reference: string
  checkoutUrl: string
  fallbackUrl: string
  billingData: FungiesBillingData
  planName: string
}

export function MembershipPricing({
  plans,
  isSignedIn,
  defaultEmail,
  currentPlanSlug,
  isActiveMember,
}: {
  plans: PlanView[]
  isSignedIn: boolean
  defaultEmail: string
  currentPlanSlug: string | null
  isActiveMember: boolean
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

  const onPaid = useCallback(() => {
    router.push("/membership/success")
  }, [router])

  const handleSubscribe = useCallback(
    (plan: PlanView) => {
      const trimmedEmail = email.trim()
      if (!isSignedIn && !EMAIL.test(trimmedEmail)) {
        toast.error("Enter your email to start your membership.")
        return
      }
      setPendingSlug(plan.slug)
      startTransition(async () => {
        const result = await startMembershipCheckout({
          planSlug: plan.slug,
          interval,
          email: trimmedEmail,
        })
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
          onPaid={onPaid}
          onCancel={() => setCheckout(null)}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-8">
      {isActiveMember && (
        <div className="mx-auto flex flex-wrap items-center justify-center gap-3 rounded-full border border-primary/30 bg-primary/10 px-5 py-2.5 text-sm">
          <ShieldCheck size={ICON_SIZE.sm} className="text-primary" aria-hidden="true" />
          <span className="font-medium text-foreground">You&apos;re an active member.</span>
          <Link href="/account/membership" className="font-semibold text-primary underline-offset-4 hover:underline">
            Manage membership
          </Link>
        </div>
      )}

      <IntervalToggle interval={interval} onChange={setInterval} />

      {!isSignedIn && (
        <div className="mx-auto w-full max-w-sm">
          <label htmlFor="member-email" className="mb-1.5 block text-center text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
            Your email for billing &amp; access
          </label>
          <Input
            id="member-email"
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

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:items-stretch">
        {plans.map((plan, i) => (
          <PlanCard
            key={plan.slug}
            plan={plan}
            interval={interval}
            index={i}
            isCurrent={isActiveMember && currentPlanSlug === plan.slug}
            disabled={isActiveMember}
            loading={isPending && pendingSlug === plan.slug}
            onSubscribe={() => handleSubscribe(plan)}
          />
        ))}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Billed securely by Fungies. Cancel anytime — you keep your benefits until the period ends.
      </p>
    </div>
  )
}

function IntervalToggle({ interval, onChange }: { interval: Interval; onChange: (i: Interval) => void }) {
  return (
    <div className="mx-auto inline-flex items-center gap-1 rounded-full border border-border bg-card p-1" role="group" aria-label="Billing interval">
      {(["month", "year"] as const).map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          aria-pressed={interval === value}
          className={cn(
            "relative rounded-full px-5 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            interval === value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {value === "month" ? "Monthly" : "Annual"}
          {value === "year" && (
            <span className={cn("ml-2 rounded-full px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide", interval === "year" ? "bg-primary-foreground/20 text-primary-foreground" : "bg-success/15 text-success")}>
              2 months free
            </span>
          )}
        </button>
      ))}
    </div>
  )
}

function PlanCard({
  plan,
  interval,
  index,
  isCurrent,
  disabled,
  loading,
  onSubscribe,
}: {
  plan: PlanView
  interval: Interval
  index: number
  isCurrent: boolean
  disabled: boolean
  loading: boolean
  onSubscribe: () => void
}) {
  const Icon = PLAN_ICON[plan.slug] ?? Zap
  const price = interval === "year" ? plan.annualPriceUsd : plan.monthlyPriceUsd
  const perMonth = interval === "year" ? plan.annualPriceUsd / 12 : plan.monthlyPriceUsd

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className={cn(
        "relative flex flex-col rounded-3xl border bg-card p-6",
        plan.isPopular ? "border-primary shadow-[0_20px_60px_-24px_var(--primary)] lg:-mt-3 lg:mb-3" : "border-border",
      )}
    >
      {plan.isPopular && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[11px] font-bold uppercase tracking-[0.08em] text-primary-foreground">
          Most popular
        </span>
      )}

      <div className="flex items-center gap-2.5">
        <span className={cn("flex size-9 items-center justify-center rounded-xl", plan.isPopular ? "bg-primary/15 text-primary" : "bg-secondary text-foreground")}>
          <Icon size={ICON_SIZE.base} weight="duotone" aria-hidden="true" />
        </span>
        <div>
          <h3 className="font-display text-lg font-bold text-foreground">{plan.name}</h3>
          {plan.tagline && <p className="text-xs text-muted-foreground">{plan.tagline}</p>}
        </div>
      </div>

      <div className="mt-5 flex items-end gap-1.5">
        <span className="font-display text-4xl font-bold tabular-nums tracking-tight text-foreground">
          <PriceDisplay usdAmount={price} />
        </span>
        <span className="pb-1.5 text-sm text-muted-foreground">/{interval === "year" ? "yr" : "mo"}</span>
      </div>
      <p className="mt-1 h-4 text-xs text-muted-foreground">
        {interval === "year" ? (
          <>
            <PriceDisplay usdAmount={Math.round(perMonth * 100) / 100} />
            {" / month, billed yearly"}
          </>
        ) : (
          "Billed monthly"
        )}
      </p>

      <Button
        onClick={onSubscribe}
        disabled={disabled || loading}
        aria-busy={loading}
        variant={plan.isPopular ? "default" : "outline"}
        className={cn("mt-5 h-11 w-full rounded-full font-semibold", !plan.isPopular && "bg-transparent")}
      >
        {isCurrent ? "Your current plan" : loading ? "Opening checkout…" : disabled ? "Included" : "Start membership"}
        {!disabled && !loading && <ArrowRight size={ICON_SIZE.base} aria-hidden="true" />}
      </Button>

      <ul className="mt-6 flex flex-col gap-2.5 border-t border-border pt-5">
        {plan.perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2.5 text-sm">
            <Check size={ICON_SIZE.sm} weight="bold" className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
            <span className="text-muted-foreground">{perk}</span>
          </li>
        ))}
      </ul>
    </motion.div>
  )
}

"use client"

import { useCallback, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FungiesCheckout, type FungiesBillingData, type FungiesConfirmResult } from "@/components/checkout/fungies-checkout"
import { TebexCheckout } from "@/components/checkout/tebex-checkout"
import { createGamingTebexCheckout } from "@/lib/actions/tebex-checkout"
import { confirmGamingCheckout, startGamingCheckout } from "@/lib/actions/gaming-subscriptions"
import { useSession } from "@/lib/auth-client"
import { annualSaving, formatGamingPrice } from "@/lib/gaming/catalog/pricing"
import type { GamingAvailability, GamingPricing } from "@/lib/gaming/catalog/types"
import { CheckCircle, Clock, Library, Refresh, ShieldCheck } from "@/lib/storefront-icons"
import { cn } from "@/lib/utils"

interface GamingPurchasePanelProps {
  slug: string
  pricing: GamingPricing
  availability: GamingAvailability
  /** First cadence line, e.g. "Two new interiors published every month". */
  cadence?: string
  /** First cancellation line. */
  afterCancel?: string
}

type Interval = "month" | "year"

interface StartedCheckout {
  reference: string
  checkoutUrl: string
  fallbackUrl: string
  billingData: FungiesBillingData
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * Price, billing interval and the purchase action.
 *
 * Subscribing needs only an email: the Fungies checkout opens over the page,
 * the price is resolved on the server from the catalogue, and the
 * subscription activates once Fungies' signed webhook confirms the payment.
 * A guest creates an account afterwards, on /gaming/subscribed. A product
 * that is not `on-sale` never offers checkout.
 */
export function GamingPurchasePanel({ slug, pricing, availability, cadence, afterCancel }: GamingPurchasePanelProps) {
  const router = useRouter()
  const { data: session, isPending: sessionPending } = useSession()
  const [interval, setInterval] = useState<Interval>("month")
  const [email, setEmail] = useState("")
  const [checkout, setCheckout] = useState<StartedCheckout | null>(null)
  const [tebexCheckout, setTebexCheckout] = useState<{ ident: string; reference: string } | null>(null)
  const [starting, startTransition] = useTransition()
  const saving = annualSaving(pricing)
  const recurring = pricing.kind === "subscription"
  const onSale = availability === "on-sale" && recurring
  const yearly = recurring && interval === "year" && saving
  const isGuest = !sessionPending && !session?.user

  const confirm = useCallback(async (ref: string): Promise<FungiesConfirmResult> => {
    const r = await confirmGamingCheckout(ref)
    if (r.status === "active") return { status: "paid", orderNumber: r.reference }
    if (r.status === "error") return { status: "error", error: r.error }
    return { status: "pending" }
  }, [])

  const onPaid = useCallback(
    (reference: string) => {
      router.push(`/gaming/subscribed?ref=${encodeURIComponent(reference)}`)
    },
    [router],
  )

  function handleTebexPurchase() {
    const trimmed = email.trim()
    if (isGuest && !EMAIL.test(trimmed)) {
      toast.error("Enter your email to purchase.")
      return
    }
    startTransition(async () => {
      const result = await createGamingTebexCheckout({ slug, billingEmail: isGuest ? trimmed : undefined })
      if ("error" in result) {
        toast.error(result.error)
        return
      }
      setTebexCheckout(result)
    })
  }

  function handleSubscribe(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = email.trim()
    if (isGuest && !EMAIL.test(trimmed)) {
      toast.error("Enter your email to subscribe.")
      return
    }
    startTransition(async () => {
      const result = await startGamingCheckout({ slug, interval: yearly ? "year" : "month", email: isGuest ? trimmed : undefined })
      if ("error" in result) {
        toast.error(result.error)
        return
      }
      setCheckout(result)
    })
  }

  if (tebexCheckout) {
    return <TebexCheckout ident={tebexCheckout.ident} onCancel={() => setTebexCheckout(null)} />
  }

  if (checkout) {
    return (
      <FungiesCheckout
        orderNumber={checkout.reference}
        checkoutUrl={checkout.checkoutUrl}
        fallbackUrl={checkout.fallbackUrl}
        billingData={checkout.billingData}
        confirm={confirm}
        context="subscription"
        onPaid={onPaid}
        onCancel={() => setCheckout(null)}
      />
    )
  }

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-[0_24px_60px_-40px_oklch(0.2_0.03_258/0.5)]">
      <div className="flex flex-col gap-4 px-5 pb-5 pt-5">
        {recurring && saving && (
          <div role="radiogroup" aria-label="Billing interval" className="grid grid-cols-2 gap-1 rounded-lg bg-secondary p-1">
            {(["month", "year"] as const).map((value) => (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={interval === value}
                onClick={() => setInterval(value)}
                className={cn(
                  "flex items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-semibold transition-colors",
                  interval === value ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {value === "month" ? "Monthly" : "Annual"}
                {value === "year" && (
                  <span className="rounded bg-success/15 px-1.5 py-0.5 font-mono text-[10px] font-bold text-success">−{saving.percent}%</span>
                )}
              </button>
            ))}
          </div>
        )}

        <div>
          <p className="flex items-baseline gap-1.5">
            <span className="font-display text-4xl font-bold tabular-nums tracking-tight text-foreground">
              {formatGamingPrice(pricing.kind === "one-time" ? pricing.price : yearly ? saving.annual : pricing.monthly)}
            </span>
            <span className="text-sm font-medium text-muted-foreground">
              {pricing.kind === "one-time" ? "one-time" : yearly ? "/ year" : "/ month"}
            </span>
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {pricing.kind === "one-time"
              ? "Pay once. Yours to keep."
              : yearly
                ? `${formatGamingPrice(saving.perMonth)} a month, billed yearly. You save ${formatGamingPrice(saving.amount)} against 12 monthly payments.`
                : saving
                  ? `Billed monthly. Or ${formatGamingPrice(saving.annual)} a year and save ${saving.percent}%.`
                  : "Billed monthly."}
          </p>
        </div>

        {onSale ? (
          <>
          <form onSubmit={handleSubscribe} className="flex flex-col gap-2" noValidate>
            {isGuest && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="gaming-email" className="text-xs font-medium text-muted-foreground">
                  Email for billing and access
                </label>
                <Input
                  id="gaming-email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="h-11"
                />
              </div>
            )}
            <Button type="submit" size="lg" className="w-full font-semibold" disabled={starting} aria-busy={starting}>
              {starting ? "Opening checkout…" : "Subscribe"}
            </Button>
            <p className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
              <ShieldCheck size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
              {isGuest
                ? "Pay securely with Fungies, the merchant of record. No account needed to pay; you'll create one after, to manage your subscription."
                : "Billed securely by Fungies, the merchant of record. Cancel anytime from your account."}
            </p>
          </form>
          <Button type="button" variant="outline" size="lg" className="mt-2 w-full font-semibold" onClick={handleTebexPurchase} disabled={starting} aria-busy={starting}>
            {starting ? "Opening checkout…" : "Buy once with Tebex"}
          </Button>
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <Button size="lg" className="w-full font-semibold" disabled aria-describedby="gaming-launch-note">
              {recurring ? "Subscribe" : "Buy now"} — launching soon
            </Button>
            <p id="gaming-launch-note" className="flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
              <Clock size={13} className="mt-0.5 shrink-0" aria-hidden="true" />
              Checkout opens when this library launches. Nothing is charged today.
            </p>
          </div>
        )}
      </div>

      <ul className="flex flex-col gap-2 border-t border-border bg-secondary/40 px-5 py-4 text-xs leading-relaxed text-muted-foreground">
        <li className="flex items-start gap-2">
          <Library size={14} className="mt-px shrink-0 text-foreground" aria-hidden="true" />
          Delivered to your DistroSource Gaming Library
        </li>
        {cadence && (
          <li className="flex items-start gap-2">
            <Refresh size={14} className="mt-px shrink-0 text-foreground" aria-hidden="true" />
            {cadence}
          </li>
        )}
        {afterCancel && (
          <li className="flex items-start gap-2">
            <CheckCircle size={14} className="mt-px shrink-0 text-foreground" aria-hidden="true" />
            {afterCancel}
          </li>
        )}
      </ul>
    </div>
  )
}

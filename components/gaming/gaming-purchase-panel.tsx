"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { annualSaving, formatGamingPrice } from "@/lib/gaming/catalog/pricing"
import type { GamingAvailability, GamingPricing } from "@/lib/gaming/catalog/types"
import { CheckCircle, Clock, Library, Refresh } from "@/lib/storefront-icons"
import { cn } from "@/lib/utils"

interface GamingPurchasePanelProps {
  pricing: GamingPricing
  availability: GamingAvailability
  /** First cadence line, e.g. "Two new interiors published every month". */
  cadence?: string
  /** First cancellation line. */
  afterCancel?: string
}

type Interval = "month" | "year"

/**
 * Price, billing interval and the purchase action.
 *
 * The annual saving is computed from the two prices. A product that is not
 * `on-sale` never offers checkout: the button is disabled and says so, and
 * nothing is charged.
 */
export function GamingPurchasePanel({ pricing, availability, cadence, afterCancel }: GamingPurchasePanelProps) {
  const [interval, setInterval] = useState<Interval>("month")
  const saving = annualSaving(pricing)
  const onSale = availability === "on-sale"
  const recurring = pricing.kind === "subscription"
  const yearly = recurring && interval === "year" && saving

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
          <Button size="lg" className="w-full font-semibold">
            {recurring ? "Subscribe" : "Buy now"}
          </Button>
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

"use client"

import type { ReactNode } from "react"
import { PriceDisplay } from "@/components/price-display"
import { Lock, Spinner, ICON_SIZE } from "@/lib/storefront-icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface OrderSummaryProps {
  subtotal: number
  discount: number
  discountPercent: number
  total: number
  itemCount?: number
  /** Rendered inside the summary card, above the totals. */
  children?: ReactNode
  onSubmit?: () => void
  submitLabel?: string
  isSubmitting?: boolean
  /** Hides the CTA once the Polar iframe has taken over payment. */
  hideAction?: boolean
  formId?: string
  className?: string
}

/**
 * The one authoritative totals block at checkout. Tax is a line but never a
 * number: when paying by card, Polar is the merchant of record and
 * calculates it at its own checkout from the buyer's billing details.
 * TamPay is a payment gateway, not a merchant of record, so its orders are
 * not taxed here either — this summary stays provider-agnostic on purpose.
 */
export function OrderSummary({
  subtotal,
  discount,
  discountPercent,
  total,
  itemCount,
  children,
  onSubmit,
  submitLabel = "Continue to secure payment",
  isSubmitting = false,
  hideAction = false,
  formId,
  className,
}: OrderSummaryProps) {
  return (
    <aside aria-labelledby="order-summary-heading" className={cn("rounded-lg border border-border bg-card", className)}>
      <div className="flex items-baseline justify-between border-b border-border px-5 py-4">
        <h2 id="order-summary-heading" className="font-display text-base font-bold text-foreground">Order summary</h2>
        {itemCount !== undefined && (
          <span className="text-xs text-muted-foreground">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
        )}
      </div>

      {children && <div className="border-b border-border px-5 py-4">{children}</div>}

      <dl className="flex flex-col gap-2.5 px-5 py-4">
        <div className="flex items-baseline justify-between text-sm">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="tabular-nums text-foreground"><PriceDisplay usdAmount={subtotal} /></dd>
        </div>
        {discount > 0 && (
          <div className="flex items-baseline justify-between text-sm text-success">
            <dt>Discount{discountPercent > 0 ? ` (${discountPercent}%)` : ""}</dt>
            <dd className="tabular-nums">−<PriceDisplay usdAmount={discount} /></dd>
          </div>
        )}
        <div className="flex items-baseline justify-between text-sm">
          <dt className="text-muted-foreground">Tax</dt>
          <dd className="text-xs text-muted-foreground">Calculated at payment</dd>
        </div>
        <div className="mt-1 flex items-baseline justify-between border-t border-border pt-3">
          <dt className="font-display text-base font-bold text-foreground">Total</dt>
          <dd className="flex items-baseline gap-1.5">
            <PriceDisplay usdAmount={total} className="font-display text-2xl font-bold tabular-nums tracking-tight text-foreground" />
            <span className="font-mono text-[11px] font-medium uppercase text-muted-foreground">USD</span>
          </dd>
        </div>
      </dl>

      {!hideAction && (
        <div className="flex flex-col gap-3 border-t border-border px-5 py-4">
          <Button
            type={formId ? "submit" : "button"}
            form={formId}
            size="lg"
            onClick={onSubmit}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="h-12 w-full font-semibold"
          >
            <span className="relative flex items-center justify-center">
              <span className={cn("flex items-center gap-2 transition-opacity", isSubmitting && "opacity-0")}>
                <Lock size={ICON_SIZE.sm} aria-hidden="true" />
                {submitLabel}
              </span>
              {isSubmitting && (
                <span className="absolute inset-0 flex items-center justify-center gap-2" aria-hidden="true">
                  <Spinner size={ICON_SIZE.base} className="animate-spin motion-reduce:animate-none" />
                  Preparing secure checkout…
                </span>
              )}
            </span>
          </Button>
          <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
            Payments are processed securely via Polar or TamPay, depending on the method you choose.
          </p>
        </div>
      )}
    </aside>
  )
}

"use client"

import type { ReactNode } from "react"
import NumberFlow from "@number-flow/react"
import { PriceDisplay } from "@/components/price-display"
import { Lock, Spinner, ShieldCheck, Download, ICON_SIZE } from "@/lib/storefront-icons"
import { cn } from "@/lib/utils"

interface OrderSummaryProps {
  subtotal: number
  discount: number
  discountPercent: number
  /** Overrides the "Discount" line label, e.g. "Pro discount" for members. */
  discountLabel?: string
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

const CARD_ICONS = [
  { src: "/payment-icons/visa.svg", alt: "Visa" },
  { src: "/payment-icons/mastercard.svg", alt: "Mastercard" },
  { src: "/payment-icons/american-express.svg", alt: "American Express" },
  { src: "/payment-icons/apple-pay.svg", alt: "Apple Pay" },
  { src: "/payment-icons/google-pay.svg", alt: "Google Pay" },
]

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
  discountLabel = "Discount",
  total,
  itemCount,
  children,
  onSubmit,
  submitLabel = "Pay securely",
  isSubmitting = false,
  hideAction = false,
  formId,
  className,
}: OrderSummaryProps) {
  return (
    <aside aria-labelledby="order-summary-heading" className={cn("overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-e1)]", className)}>
      <div className="flex items-baseline justify-between border-b border-border px-5 py-4">
        <h2 id="order-summary-heading" className="font-display text-base font-bold text-foreground">Order summary</h2>
        {itemCount !== undefined && (
          <span className="font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
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
            <dt>{discountLabel}{discountPercent > 0 ? ` (${discountPercent}%)` : ""}</dt>
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
            <NumberFlow value={total} format={{ style: "currency", currency: "USD" }} className="font-display text-3xl font-bold tabular-nums tracking-tight text-foreground" />
            <span className="font-mono text-[11px] font-medium uppercase text-muted-foreground">USD</span>
          </dd>
        </div>
      </dl>

      {!hideAction && (
        <div className="flex flex-col gap-3 border-t border-border px-5 py-4">
          <button
            type={formId ? "submit" : "button"}
            form={formId}
            onClick={onSubmit}
            disabled={isSubmitting}
            aria-busy={isSubmitting}
            className="group relative flex h-13 w-full items-center justify-center rounded-full bg-primary text-[15px] font-semibold text-primary-foreground shadow-[0_10px_30px_-10px_var(--primary)] transition-[transform,box-shadow] hover:shadow-[0_14px_36px_-10px_var(--primary)] active:scale-[0.98] disabled:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className={cn("flex items-center gap-2 transition-opacity", isSubmitting && "opacity-0")}>
              <Lock size={ICON_SIZE.sm} weight="bold" aria-hidden="true" />
              {submitLabel}
            </span>
            {isSubmitting && (
              <span className="absolute inset-0 flex items-center justify-center gap-2" aria-hidden="true">
                <Spinner size={ICON_SIZE.base} className="animate-spin motion-reduce:animate-none" />
                Opening secure payment…
              </span>
            )}
          </button>

          <ul className="flex items-center justify-center gap-1.5" aria-label="Accepted payment methods">
            {CARD_ICONS.map((c) => (
              <li key={c.alt} className="flex h-6 items-center rounded-md border border-border bg-background px-1">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={c.src} alt={c.alt} className="h-3.5 w-auto" loading="lazy" />
              </li>
            ))}
          </ul>

          <ul className="grid grid-cols-3 gap-2 border-t border-border pt-3 font-mono text-[10px] uppercase tracking-[0.06em] text-muted-foreground">
            <li className="flex items-center gap-1.5"><Lock size={12} weight="duotone" className="shrink-0 text-primary" aria-hidden="true" />Encrypted</li>
            <li className="flex items-center gap-1.5"><Download size={12} weight="duotone" className="shrink-0 text-primary" aria-hidden="true" />Instant files</li>
            <li className="flex items-center gap-1.5"><ShieldCheck size={12} weight="duotone" className="shrink-0 text-primary" aria-hidden="true" />Licence stated</li>
          </ul>
        </div>
      )}
    </aside>
  )
}

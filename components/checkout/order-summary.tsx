"use client"

import type { ReactNode } from "react"
import { PriceDisplay } from "@/components/price-display"
import { Lock, Spinner } from "@/lib/storefront-icons"
import { cn } from "@/lib/utils"

interface OrderSummaryProps {
  subtotal: number
  discount: number
  discountPercent: number
  total: number
  itemCount?: number
  children?: ReactNode
  onSubmit?: () => void
  submitLabel?: string
  isSubmitting?: boolean
  hideAction?: boolean
  formId?: string
  className?: string
}

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
    <aside aria-labelledby="order-summary-heading" className={cn("overflow-hidden rounded-[30px] border border-border bg-card shadow-[0_24px_80px_-42px_rgba(0,0,0,0.22)]", className)}>
      <div className="p-5 sm:p-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground">Final review</p>
            <h2 id="order-summary-heading" className="mt-2 font-display text-2xl font-black tracking-[-0.04em]">Order total</h2>
          </div>
          {itemCount !== undefined && <span className="text-xs text-muted-foreground">{itemCount} {itemCount === 1 ? "item" : "items"}</span>}
        </div>

        {children && <div className="mt-5 border-t border-border pt-5">{children}</div>}

        <dl className="mt-7 space-y-3 text-sm">
          <div className="flex items-baseline justify-between gap-4"><dt className="text-muted-foreground">Subtotal</dt><dd className="font-semibold tabular-nums"><PriceDisplay usdAmount={subtotal} /></dd></div>
          {discount > 0 && <div className="flex items-baseline justify-between gap-4 text-success"><dt>Discount{discountPercent > 0 ? ` · ${discountPercent}%` : ""}</dt><dd className="font-semibold tabular-nums">−<PriceDisplay usdAmount={discount} /></dd></div>}
          <div className="flex items-baseline justify-between gap-4"><dt className="text-muted-foreground">Tax</dt><dd className="text-[11px] text-muted-foreground">Calculated at payment</dd></div>
        </dl>

        <div className="mt-6 border-t border-border pt-5">
          <p className="font-mono text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground">Total</p>
          <div className="mt-1 flex items-end gap-2">
            <PriceDisplay usdAmount={total} className="font-display text-5xl font-black tabular-nums tracking-[-0.065em] text-foreground" />
            <span className="pb-1 font-mono text-[9px] font-bold uppercase text-muted-foreground">USD</span>
          </div>
        </div>

        {!hideAction && (
          <div className="mt-6">
            <button
              type={formId ? "submit" : "button"}
              form={formId}
              onClick={onSubmit}
              disabled={isSubmitting}
              aria-busy={isSubmitting}
              className="group flex h-14 w-full items-center justify-between rounded-full bg-foreground px-5 text-sm font-bold text-background transition-[transform,opacity] active:scale-[0.985] disabled:opacity-55"
            >
              <span className="flex items-center gap-2">
                {isSubmitting ? <Spinner size={15} className="animate-spin" /> : <Lock size={14} />}
                {isSubmitting ? "Preparing secure payment…" : submitLabel}
              </span>
              <span className="size-2 rounded-full bg-primary" />
            </button>
            <p className="mt-3 text-center text-[10px] leading-5 text-muted-foreground">The checkout shows the payment provider and any provider-specific details before you complete payment.</p>
          </div>
        )}
      </div>
    </aside>
  )
}

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

export function OrderSummary({ subtotal, discount, discountPercent, total, itemCount, children, onSubmit, submitLabel = "Continue to secure payment", isSubmitting = false, hideAction = false, formId, className }: OrderSummaryProps) {
  return (
    <aside aria-labelledby="order-summary-heading" className={cn("border border-border bg-background shadow-[0_24px_70px_-45px_rgba(17,24,39,.35)]", className)}>
      <div className="border-b border-border p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4"><p className="font-mono text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground">Order summary</p>{itemCount !== undefined && <span className="text-xs text-muted-foreground">{itemCount} {itemCount === 1 ? "item" : "items"}</span>}</div>
        <h2 id="order-summary-heading" className="mt-4 font-display text-4xl font-black tracking-[-0.055em]">Your total.</h2>
      </div>

      {children && <div className="border-b border-border p-5 sm:p-6">{children}</div>}

      <dl className="space-y-3 border-b border-border p-5 text-sm sm:p-6">
        <div className="flex justify-between"><dt className="text-muted-foreground">Subtotal</dt><dd><PriceDisplay usdAmount={subtotal} /></dd></div>
        {discount > 0 && <div className="flex justify-between text-success"><dt>Discount{discountPercent > 0 ? ` (${discountPercent}%)` : ""}</dt><dd>−<PriceDisplay usdAmount={discount} /></dd></div>}
        <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Tax</dt><dd className="text-right text-xs text-muted-foreground">Calculated at payment</dd></div>
      </dl>

      <div className="p-5 sm:p-6">
        <div className="flex items-end justify-between gap-4"><div><p className="font-mono text-[8px] font-black uppercase tracking-[0.12em] text-muted-foreground">Total</p><PriceDisplay usdAmount={total} className="mt-1 block font-display text-5xl font-black leading-none tracking-[-0.065em]" /></div><span className="font-mono text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground">USD</span></div>
        {!hideAction && <button type={formId ? "submit" : "button"} form={formId} onClick={onSubmit} disabled={isSubmitting} aria-busy={isSubmitting} className="mt-6 flex h-14 w-full items-center justify-center gap-2 bg-[#111827] text-sm font-black text-white transition-transform active:scale-[0.99] disabled:opacity-50 dark:bg-white dark:text-[#111827]">{isSubmitting ? <><Spinner size={15} className="animate-spin" /> Preparing secure checkout…</> : <><Lock size={14} /> {submitLabel}</>}</button>}
        <p className="mt-3 text-center text-[11px] leading-5 text-muted-foreground">Your payment is handled securely by the selected checkout provider.</p>
      </div>
    </aside>
  )
}

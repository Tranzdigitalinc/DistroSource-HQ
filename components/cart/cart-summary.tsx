"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AnimatePresence, motion } from "motion/react"
import { ArrowRight, Check, Loader2, Lock, X } from "@/lib/storefront-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PriceDisplay } from "@/components/price-display"
import { applyCouponPreview } from "@/lib/actions/checkout"

export function CartSummary({ subtotal, itemCount }: { subtotal: number; itemCount: number }) {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [discountPercent, setDiscountPercent] = useState(0)
  const [appliedCode, setAppliedCode] = useState<string | null>(null)
  const [promoOpen, setPromoOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isNavigating, startNavigate] = useTransition()
  const discount = Math.round(subtotal * (discountPercent / 100) * 100) / 100
  const total = Math.max(0, subtotal - discount)

  function handleApply() {
    if (!code.trim() || isPending) return
    startTransition(async () => {
      const result = await applyCouponPreview(code.trim(), subtotal)
      if (result.valid) {
        setDiscountPercent(result.discountPercent)
        setAppliedCode(code.trim().toUpperCase())
        setCode("")
        toast.success(`${result.discountPercent}% discount applied`)
      } else {
        setDiscountPercent(0)
        setAppliedCode(null)
        toast.error(result.message)
      }
    })
  }

  function handleCheckout() {
    startNavigate(() => {
      const params = appliedCode ? `?coupon=${encodeURIComponent(appliedCode)}` : ""
      router.push(`/checkout${params}`)
    })
  }

  const cta = (
    <Button
      size="lg"
      className="h-12 w-full rounded-xl bg-foreground font-bold text-background hover:bg-primary hover:text-primary-foreground"
      onClick={handleCheckout}
      disabled={subtotal <= 0 || isNavigating}
      aria-busy={isNavigating}
    >
      {isNavigating ? <Loader2 size={16} className="animate-spin" aria-hidden="true" /> : <Lock size={14} aria-hidden="true" />}
      Secure checkout
      {!isNavigating && <ArrowRight size={16} aria-hidden="true" />}
    </Button>
  )

  return (
    <>
      <section aria-labelledby="order-summary-heading" className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_20px_70px_-44px_color-mix(in_oklch,var(--foreground)_28%,transparent)]">
        <div className="px-5 pb-3 pt-5 sm:px-6">
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Order summary</p>
          <div className="mt-2 flex items-end justify-between gap-4">
            <h2 id="order-summary-heading" className="font-display text-xl font-black tracking-tight">Review total</h2>
            <span className="text-xs text-muted-foreground">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
          </div>
        </div>

        <dl className="mx-5 border-y border-border/70 py-4 text-sm sm:mx-6">
          <div className="flex justify-between gap-4 py-1.5">
            <dt className="text-muted-foreground">Subtotal</dt>
            <dd className="font-medium tabular-nums"><PriceDisplay usdAmount={subtotal} /></dd>
          </div>
          <AnimatePresence initial={false}>
            {discountPercent > 0 && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex justify-between gap-4 py-1.5 text-success">
                <dt>Discount ({discountPercent}%)</dt>
                <dd className="font-medium tabular-nums">−<PriceDisplay usdAmount={discount} /></dd>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex justify-between gap-4 py-1.5">
            <dt className="text-muted-foreground">Tax</dt>
            <dd className="text-right text-xs text-muted-foreground">Calculated during payment</dd>
          </div>
        </dl>

        <div className="px-5 py-5 sm:px-6">
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Total</p>
          <p className="mt-1 font-display text-4xl font-black tabular-nums tracking-[-0.045em] text-foreground"><PriceDisplay usdAmount={total} /></p>

          <div className="mt-5">
            <AnimatePresence mode="wait" initial={false}>
              {appliedCode ? (
                <motion.div key="applied" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-between gap-2 rounded-xl border border-success/25 bg-success/8 px-3 py-2.5">
                  <span className="flex items-center gap-2 text-xs font-semibold text-success"><Check size={13} /><span className="font-mono">{appliedCode}</span> applied</span>
                  <button type="button" onClick={() => { setDiscountPercent(0); setAppliedCode(null) }} aria-label="Remove promo code" className="flex size-7 items-center justify-center rounded-full text-success/80 hover:bg-success/10"><X size={13} /></button>
                </motion.div>
              ) : promoOpen ? (
                <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-2">
                  <label htmlFor="promo" className="sr-only">Promo code</label>
                  <Input id="promo" value={code} onChange={(event) => setCode(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.nativeEvent.isComposing) { event.preventDefault(); handleApply() } }} placeholder="Promo code" className="h-10 rounded-xl font-mono uppercase" disabled={isPending} autoFocus />
                  <Button type="button" variant="outline" onClick={handleApply} disabled={isPending || !code.trim()} className="h-10 rounded-xl px-4">{isPending ? <Loader2 size={14} className="animate-spin" /> : "Apply"}</Button>
                </motion.div>
              ) : (
                <motion.button key="toggle" type="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPromoOpen(true)} className="text-xs font-semibold text-muted-foreground hover:text-foreground">Add a promo code</motion.button>
              )}
            </AnimatePresence>
          </div>

          <div className="mt-5">{cta}</div>
          <p className="mt-3 text-center text-[11px] leading-5 text-muted-foreground">Digital products are delivered after confirmed payment. Payment options are shown at checkout.</p>
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 shadow-[var(--shadow-e3)] backdrop-blur supports-[backdrop-filter]:bg-background/90 lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-4">
          <div className="min-w-0">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">Total</p>
            <p className="font-display text-lg font-black tabular-nums leading-tight"><PriceDisplay usdAmount={total} /></p>
          </div>
          <div className="flex-1">{cta}</div>
        </div>
      </div>
    </>
  )
}

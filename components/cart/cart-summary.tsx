"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AnimatePresence, motion } from "motion/react"
import { ArrowRight, Check, Close, Loader2, Lock } from "@/lib/storefront-icons"
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
    <button
      type="button"
      onClick={handleCheckout}
      disabled={subtotal <= 0 || isNavigating}
      aria-busy={isNavigating}
      className="group flex h-14 w-full items-center justify-between rounded-full bg-foreground px-5 text-sm font-bold text-background transition-[transform,opacity] active:scale-[0.985] disabled:opacity-55"
    >
      <span className="flex items-center gap-2">
        {isNavigating ? <Loader2 size={15} className="animate-spin" /> : <Lock size={14} />}
        {isNavigating ? "Opening checkout…" : "Secure checkout"}
      </span>
      <span className="flex size-9 items-center justify-center rounded-full bg-background text-foreground transition-transform group-hover:translate-x-1">
        <ArrowRight size={14} />
      </span>
    </button>
  )

  return (
    <>
      <section aria-labelledby="order-summary-heading" className="overflow-hidden rounded-[30px] border border-border bg-card shadow-[0_24px_80px_-42px_rgba(0,0,0,0.22)]">
        <div className="p-5 sm:p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="font-mono text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground">Order review</p>
              <h2 id="order-summary-heading" className="mt-2 font-display text-2xl font-black tracking-[-0.04em]">Summary</h2>
            </div>
            <span className="text-xs text-muted-foreground">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
          </div>

          <dl className="mt-7 space-y-3 text-sm">
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-semibold tabular-nums"><PriceDisplay usdAmount={subtotal} /></dd>
            </div>
            <AnimatePresence initial={false}>
              {discountPercent > 0 && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex items-baseline justify-between gap-4 text-success">
                  <dt>Discount · {discountPercent}%</dt>
                  <dd className="font-semibold tabular-nums">−<PriceDisplay usdAmount={discount} /></dd>
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex items-baseline justify-between gap-4">
              <dt className="text-muted-foreground">Tax</dt>
              <dd className="text-[11px] text-muted-foreground">Calculated at payment</dd>
            </div>
          </dl>

          <div className="mt-6 border-t border-border pt-5">
            <div className="flex items-end justify-between gap-4">
              <span className="font-display text-lg font-black">Total</span>
              <span className="font-display text-4xl font-black tracking-[-0.055em]"><PriceDisplay usdAmount={total} /></span>
            </div>
          </div>

          <div className="mt-6">{cta}</div>
          <p className="mt-3 text-center text-[10px] leading-5 text-muted-foreground">Digital delivery begins after payment is confirmed.</p>
        </div>

        <div className="border-t border-border bg-secondary/30 px-5 py-4 sm:px-6">
          <AnimatePresence mode="wait" initial={false}>
            {appliedCode ? (
              <motion.div key="applied" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-xs font-semibold text-success"><Check size={13} /> <span className="font-mono">{appliedCode}</span> applied</span>
                <button type="button" onClick={() => { setDiscountPercent(0); setAppliedCode(null) }} aria-label="Remove promo code" className="flex size-8 items-center justify-center rounded-full hover:bg-secondary"><Close size={13} /></button>
              </motion.div>
            ) : promoOpen ? (
              <motion.div key="input" initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex gap-2">
                <label htmlFor="promo" className="sr-only">Promo code</label>
                <input
                  id="promo"
                  value={code}
                  onChange={(event) => setCode(event.target.value)}
                  onKeyDown={(event) => { if (event.key === "Enter" && !event.nativeEvent.isComposing) { event.preventDefault(); handleApply() } }}
                  placeholder="Promo code"
                  disabled={isPending}
                  autoFocus
                  className="h-10 min-w-0 flex-1 rounded-full border border-border bg-background px-4 font-mono text-xs uppercase outline-none focus:border-foreground"
                />
                <button type="button" onClick={handleApply} disabled={isPending || !code.trim()} className="h-10 shrink-0 rounded-full bg-foreground px-4 text-xs font-semibold text-background disabled:opacity-50">
                  {isPending ? <Loader2 size={13} className="animate-spin" /> : "Apply"}
                </button>
              </motion.div>
            ) : (
              <motion.button key="toggle" type="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPromoOpen(true)} className="text-xs font-semibold text-muted-foreground hover:text-foreground">
                Add a promo code
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </section>

      <Link href="/products" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground">
        ← Keep shopping
      </Link>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-4">
          <div className="min-w-0 shrink-0">
            <p className="font-mono text-[8px] font-black uppercase tracking-[0.1em] text-muted-foreground">Total</p>
            <p className="font-display text-xl font-black tracking-tight"><PriceDisplay usdAmount={total} /></p>
          </div>
          <div className="flex-1">{cta}</div>
        </div>
      </div>
    </>
  )
}

"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AnimatePresence, motion } from "motion/react"
import { ArrowRight, Check, Loader2, Lock, X, ICON_SIZE } from "@/lib/storefront-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PriceDisplay } from "@/components/price-display"
import { applyCouponPreview } from "@/lib/actions/checkout"

/**
 * Cart totals. Discounts previewed here are re-validated server-side at
 * checkout; tax is not estimated because Polar (merchant of record)
 * calculates it from the customer's billing details during payment.
 */
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

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.nativeEvent.isComposing) {
      e.preventDefault()
      handleApply()
    }
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
      className="h-12 w-full font-semibold"
      onClick={handleCheckout}
      disabled={subtotal <= 0 || isNavigating}
      aria-busy={isNavigating}
    >
      {isNavigating ? (
        <Loader2 size={ICON_SIZE.base} className="animate-spin" aria-hidden="true" />
      ) : (
        <Lock size={ICON_SIZE.sm} aria-hidden="true" />
      )}
      Proceed to secure checkout
      {!isNavigating && <ArrowRight size={ICON_SIZE.base} aria-hidden="true" />}
    </Button>
  )

  return (
    <>
      <section aria-labelledby="order-summary-heading" className="rounded-lg border border-border bg-card">
        <h2 id="order-summary-heading" className="border-b border-border px-5 py-4 font-display text-base font-bold">
          Order summary
        </h2>

        <dl className="flex flex-col gap-2.5 px-5 py-4 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">
              Subtotal <span className="text-xs">({itemCount} {itemCount === 1 ? "item" : "items"})</span>
            </dt>
            <dd className="tabular-nums"><PriceDisplay usdAmount={subtotal} /></dd>
          </div>
          <AnimatePresence initial={false}>
            {discountPercent > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="flex justify-between text-success"
              >
                <dt>Discount ({discountPercent}%)</dt>
                <dd className="tabular-nums">−<PriceDisplay usdAmount={discount} /></dd>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Tax</dt>
            <dd className="text-xs text-muted-foreground">Calculated at secure checkout</dd>
          </div>
          <div className="mt-1 flex items-baseline justify-between border-t border-border pt-3">
            <dt className="font-display text-base font-bold">Total</dt>
            <dd className="font-display text-2xl font-bold tabular-nums tracking-tight">
              <PriceDisplay usdAmount={total} />
            </dd>
          </div>
        </dl>

        <div className="border-t border-border px-5 py-3">
          <AnimatePresence mode="wait" initial={false}>
            {appliedCode ? (
              <motion.div
                key="applied"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between gap-2 rounded-md border border-success/30 bg-success/10 px-3 py-2"
              >
                <span className="flex items-center gap-2 text-sm font-medium text-success">
                  <Check size={ICON_SIZE.sm} aria-hidden="true" />
                  <span className="font-mono">{appliedCode}</span> applied
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setDiscountPercent(0)
                    setAppliedCode(null)
                  }}
                  aria-label="Remove promo code"
                  className="flex size-7 items-center justify-center rounded-md text-success/80 transition-colors hover:bg-success/15 hover:text-success"
                >
                  <X size={14} aria-hidden="true" />
                </button>
              </motion.div>
            ) : promoOpen ? (
              <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-2">
                <label htmlFor="promo" className="sr-only">Promo code</label>
                <Input
                  id="promo"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Promo code"
                  className="h-9 font-mono uppercase"
                  disabled={isPending}
                  autoFocus
                />
                <Button type="button" variant="outline" onClick={handleApply} disabled={isPending || !code.trim()} className="h-9 shrink-0">
                  {isPending ? <Loader2 size={ICON_SIZE.sm} className="animate-spin" aria-hidden="true" /> : "Apply"}
                </Button>
              </motion.div>
            ) : (
              <motion.button
                key="toggle"
                type="button"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setPromoOpen(true)}
                className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Have a promo code?
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-3 border-t border-border px-5 py-5">
          {cta}
          <p className="text-center text-xs text-muted-foreground">Instant digital delivery after confirmed payment.</p>
          <p className="text-center text-[11px] leading-relaxed text-muted-foreground">
            Payments and applicable taxes are handled by Polar, our Merchant of Record.
          </p>
        </div>
      </section>

      <Link href="/products" className="mt-4 block text-center text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline lg:text-left">
        ← Continue shopping
      </Link>

      {/* Mobile: total + CTA pinned to the bottom so checkout is one thumb away. */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 shadow-[var(--shadow-e3)] backdrop-blur supports-[backdrop-filter]:bg-background/90 lg:hidden">
        <div className="mx-auto flex max-w-lg items-center gap-4">
          <div className="min-w-0">
            <p className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground">Total</p>
            <p className="font-display text-lg font-bold tabular-nums leading-tight"><PriceDisplay usdAmount={total} /></p>
          </div>
          <div className="flex-1">{cta}</div>
        </div>
      </div>
    </>
  )
}

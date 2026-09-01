"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AnimatePresence, motion } from "motion/react"
import { Check, ChevronRight, Loader2, ShieldCheck, Tag, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PriceDisplay } from "@/components/price-display"
import { applyCouponPreview } from "@/lib/actions/checkout"

export function CartSummary({ subtotal, itemCount }: { subtotal: number; itemCount: number }) {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [discountPercent, setDiscountPercent] = useState(0)
  const [appliedCode, setAppliedCode] = useState<string | null>(null)
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
        toast.success(`Coupon applied: ${result.discountPercent}% off`)
      } else {
        setDiscountPercent(0)
        setAppliedCode(null)
        toast.error(result.message)
      }
    })
  }

  function handleRemoveCoupon() {
    setDiscountPercent(0)
    setAppliedCode(null)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !e.nativeEvent.isComposing && e.keyCode !== 229) {
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

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-display text-lg font-bold">Order summary</h2>
          <p className="mt-1 text-xs text-muted-foreground">Digital delivery, no hidden fees</p>
        </div>
        <ShieldCheck className="size-5 text-success" aria-hidden="true" />
      </div>

      <div className="flex flex-col gap-2">
        <label
          htmlFor="coupon"
          className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        >
          <Tag className="size-3" />
          Coupon code
        </label>
        <AnimatePresence mode="wait" initial={false}>
          {appliedCode ? (
            <motion.div
              key="applied"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex items-center justify-between gap-2 rounded-lg border border-success/30 bg-success/10 px-3 py-2.5"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-success">
                <Check className="size-4 shrink-0" />
                {appliedCode} applied — {discountPercent}% off
              </span>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                aria-label="Remove coupon"
                className="flex size-7 shrink-0 items-center justify-center rounded-full text-success/80 transition-colors hover:bg-success/15 hover:text-success"
              >
                <X className="size-3.5" />
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="input"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="flex gap-2"
            >
              <Input
                id="coupon"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g. WELCOME10"
                className="h-10 uppercase"
                disabled={isPending}
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleApply}
                disabled={isPending || !code.trim()}
                className="h-10 shrink-0"
              >
                {isPending ? <Loader2 className="size-4 animate-spin" /> : "Apply"}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-2.5 border-t border-border pt-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">
            Subtotal ({itemCount} {itemCount === 1 ? "item" : "items"})
          </span>
          <PriceDisplay usdAmount={subtotal} />
        </div>
        <AnimatePresence initial={false}>
          {discountPercent > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex justify-between text-success"
            >
              <span>Discount ({discountPercent}%)</span>
              <span>
                -<PriceDisplay usdAmount={discount} />
              </span>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="flex justify-between border-t border-border pt-3 font-display text-base font-bold">
          <span>Total</span>
          <PriceDisplay usdAmount={total} />
        </div>
      </div>

      <Button
        size="lg"
        className="h-11 font-semibold"
        onClick={handleCheckout}
        disabled={subtotal <= 0 || isNavigating}
      >
        {isNavigating ? <Loader2 className="size-4 animate-spin" /> : <>Proceed to checkout <ChevronRight className="size-4" /></>}
      </Button>

      <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
        <ShieldCheck className="size-3.5" />
        Secured checkout — your details are protected
      </p>
    </div>
  )
}

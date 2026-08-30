"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { PriceDisplay } from "@/components/price-display"
import { applyCouponPreview } from "@/lib/actions/checkout"

export function CartSummary({ subtotal }: { subtotal: number }) {
  const router = useRouter()
  const [code, setCode] = useState("")
  const [discountPercent, setDiscountPercent] = useState(0)
  const [appliedCode, setAppliedCode] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const discount = Math.round(subtotal * (discountPercent / 100) * 100) / 100
  const total = Math.max(0, subtotal - discount)

  function handleApply() {
    if (!code.trim()) return
    startTransition(async () => {
      const result = await applyCouponPreview(code.trim(), subtotal)
      if (result.valid) {
        setDiscountPercent(result.discountPercent)
        setAppliedCode(code.trim().toUpperCase())
        toast.success(`Coupon applied: ${result.discountPercent}% off`)
      } else {
        setDiscountPercent(0)
        setAppliedCode(null)
        toast.error(result.message)
      }
    })
  }

  function handleCheckout() {
    const params = appliedCode ? `?coupon=${encodeURIComponent(appliedCode)}` : ""
    router.push(`/checkout${params}`)
  }

  return (
    <div className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6">
      <h2 className="font-display text-lg font-bold">Order summary</h2>

      <div className="flex flex-col gap-2">
        <label htmlFor="coupon" className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Coupon code
        </label>
        <div className="flex gap-2">
          <Input
            id="coupon"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="e.g. WELCOME10"
            className="uppercase"
          />
          <Button type="button" variant="outline" onClick={handleApply} disabled={isPending}>
            Apply
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-4 text-sm">
        <div className="flex justify-between">
          <span className="text-muted-foreground">Subtotal</span>
          <PriceDisplay usdAmount={subtotal} />
        </div>
        {discountPercent > 0 && (
          <div className="flex justify-between text-success">
            <span>Discount ({discountPercent}%)</span>
            <span>
              -<PriceDisplay usdAmount={discount} />
            </span>
          </div>
        )}
        <div className="flex justify-between border-t border-border pt-2 font-display text-base font-bold">
          <span>Total</span>
          <PriceDisplay usdAmount={total} />
        </div>
      </div>

      <Button size="lg" className="h-11 font-semibold" onClick={handleCheckout} disabled={subtotal <= 0}>
        Proceed to checkout
      </Button>
    </div>
  )
}

"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AnimatePresence, motion } from "motion/react"
import { ArrowRight, Check, Loader2, Lock, X } from "@/lib/storefront-icons"
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
    <button type="button" onClick={handleCheckout} disabled={subtotal <= 0 || isNavigating} className="group flex h-14 w-full items-center justify-between bg-[#111827] px-5 text-sm font-black text-white transition-transform active:scale-[0.99] disabled:opacity-50 dark:bg-white dark:text-[#111827]">
      <span className="flex items-center gap-2">{isNavigating ? <Loader2 size={15} className="animate-spin" /> : <Lock size={14} />} Secure checkout</span>
      {!isNavigating && <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />}
    </button>
  )

  return (
    <>
      <section className="border border-border bg-background shadow-[0_24px_70px_-45px_rgba(17,24,39,.35)]">
        <div className="border-b border-border p-5 sm:p-6">
          <p className="font-mono text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground">Order summary</p>
          <div className="mt-4 flex items-end justify-between gap-4">
            <div><p className="text-xs text-muted-foreground">Estimated total</p><p className="mt-1 font-display text-5xl font-black leading-none tracking-[-0.06em]"><PriceDisplay usdAmount={total} /></p></div>
            <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">USD</span>
          </div>
        </div>

        <dl className="space-y-3 border-b border-border p-5 text-sm sm:p-6">
          <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Subtotal <span className="text-xs">({itemCount} {itemCount === 1 ? "item" : "items"})</span></dt><dd><PriceDisplay usdAmount={subtotal} /></dd></div>
          <AnimatePresence initial={false}>{discountPercent > 0 && <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="flex justify-between text-success"><dt>Discount ({discountPercent}%)</dt><dd>−<PriceDisplay usdAmount={discount} /></dd></motion.div>}</AnimatePresence>
          <div className="flex justify-between gap-4"><dt className="text-muted-foreground">Tax</dt><dd className="text-right text-xs text-muted-foreground">Calculated at secure checkout</dd></div>
        </dl>

        <div className="border-b border-border p-5 sm:p-6">
          <AnimatePresence mode="wait" initial={false}>
            {appliedCode ? (
              <motion.div key="applied" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-between border border-success/25 bg-success/10 px-3 py-2.5 text-sm text-success"><span className="flex items-center gap-2"><Check size={14} /><span className="font-mono">{appliedCode}</span> applied</span><button type="button" onClick={() => { setDiscountPercent(0); setAppliedCode(null) }} className="flex size-7 items-center justify-center" aria-label="Remove promo code"><X size={13} /></button></motion.div>
            ) : promoOpen ? (
              <motion.div key="input" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex border-b border-border"><input value={code} onChange={(event) => setCode(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); handleApply() } }} placeholder="Promo code" className="h-11 min-w-0 flex-1 bg-transparent px-0 font-mono text-xs uppercase outline-none" autoFocus /><button type="button" onClick={handleApply} disabled={isPending || !code.trim()} className="px-3 text-xs font-black disabled:opacity-50">{isPending ? <Loader2 size={14} className="animate-spin" /> : "Apply"}</button></motion.div>
            ) : (
              <motion.button key="toggle" type="button" initial={{ opacity: 0 }} animate={{ opacity: 1 }} onClick={() => setPromoOpen(true)} className="text-xs font-semibold text-muted-foreground hover:text-foreground">Have a promo code?</motion.button>
            )}
          </AnimatePresence>
        </div>

        <div className="p-5 sm:p-6">{cta}<p className="mt-3 text-center text-[11px] leading-5 text-muted-foreground">Digital delivery after confirmed payment. Card payments are processed securely through the available provider.</p></div>
      </section>

      <Link href="/products" className="mt-4 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground">← Continue shopping</Link>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 shadow-[0_-14px_40px_-24px_rgba(0,0,0,.3)] backdrop-blur lg:hidden"><div className="mx-auto flex max-w-xl items-center gap-4"><div className="min-w-0"><p className="font-mono text-[8px] font-black uppercase tracking-[0.1em] text-muted-foreground">Total</p><p className="font-display text-xl font-black"><PriceDisplay usdAmount={total} /></p></div><div className="flex-1">{cta}</div></div></div>
    </>
  )
}

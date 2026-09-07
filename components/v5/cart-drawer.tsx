"use client"

import Image from "next/image"
import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { useCallback, useEffect, useState, useTransition } from "react"
import { mutate } from "swr"
import { getCartItems, removeCartItem } from "@/lib/actions/cart"
import { PriceDisplay } from "@/components/price-display"
import { ArrowRight, Close, Loader2, ShoppingCart, Trash } from "@/lib/storefront-icons"
import { useCartCount } from "@/lib/use-cart"

type Rows = Awaited<ReturnType<typeof getCartItems>>

export function V5CartDrawer() {
  const { count } = useCartCount()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Rows>([])
  const [loading, setLoading] = useState(false)
  const [pending, startTransition] = useTransition()

  const load = useCallback(async () => {
    setLoading(true)
    try { setItems(await getCartItems()) } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    if (!open) return
    void load()
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = previous }
  }, [open, load])

  const subtotal = items.reduce((sum, item) => sum + Number.parseFloat(item.license.price) * item.cartItem.quantity, 0)

  function remove(id: number) {
    startTransition(async () => {
      await removeCartItem(id)
      await mutate("/api/cart/summary")
      await load()
    })
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label={count > 0 ? `Open cart, ${count} items` : "Open cart"} className="relative flex size-10 items-center justify-center text-foreground transition-colors hover:bg-secondary">
        <ShoppingCart size={19} />
        <AnimatePresence>{count > 0 && <motion.span key={count} initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} transition={{ type: "spring", stiffness: 520, damping: 30 }} className="absolute -right-0.5 -top-0.5 flex min-w-[17px] items-center justify-center bg-primary px-1 font-mono text-[8px] font-black leading-[17px] text-primary-foreground">{count > 9 ? "9+" : count}</motion.span>}</AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[120]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" aria-label="Close cart" onClick={() => setOpen(false)} className="absolute inset-0 bg-[#111827]/35 backdrop-blur-[2px]" />
            <motion.aside role="dialog" aria-modal="true" aria-label="Shopping cart" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.42, ease: [0.16, 1, 0.3, 1] }} className="absolute right-0 top-0 flex h-full w-full max-w-[460px] flex-col bg-background shadow-[-35px_0_100px_-45px_rgba(0,0,0,.4)]">
              <div className="flex h-[76px] items-center justify-between border-b border-border px-5 sm:px-6"><div><p className="font-display text-xl font-black tracking-[-0.04em]">Your cart</p><p className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.1em] text-muted-foreground">{count} {count === 1 ? "item" : "items"}</p></div><button type="button" onClick={() => setOpen(false)} className="flex size-10 items-center justify-center border border-border" aria-label="Close"><Close size={16} /></button></div>

              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6">
                {loading ? <div className="flex min-h-64 items-center justify-center"><Loader2 size={18} className="animate-spin text-muted-foreground" /></div> : items.length === 0 ? (
                  <div className="flex min-h-[60vh] flex-col items-center justify-center text-center"><span className="flex size-14 items-center justify-center rounded-full bg-secondary"><ShoppingCart size={20} /></span><h2 className="mt-5 font-display text-2xl font-black tracking-[-0.04em]">Nothing here yet.</h2><p className="mt-2 max-w-xs text-sm leading-6 text-muted-foreground">Browse the catalog and build your digital toolkit.</p><Link href="/products" onClick={() => setOpen(false)} className="mt-6 inline-flex h-11 items-center gap-2 bg-foreground px-5 text-sm font-bold text-background">Explore products <ArrowRight size={14} /></Link></div>
                ) : (
                  <ul>{items.map((item) => <li key={item.cartItem.id} className="grid grid-cols-[92px_1fr_auto] gap-4 border-b border-border py-5 first:pt-0"><Link href={`/products/${item.product.slug}`} onClick={() => setOpen(false)} className="relative aspect-square overflow-hidden bg-secondary">{item.imageUrl && <Image src={item.imageUrl} alt="" fill sizes="92px" className="object-cover" />}</Link><div className="min-w-0 py-1"><p className="truncate font-mono text-[8px] font-black uppercase tracking-[0.1em] text-muted-foreground">{item.categoryName ?? "Digital product"}</p><Link href={`/products/${item.product.slug}`} onClick={() => setOpen(false)} className="mt-1 line-clamp-2 font-display text-sm font-black leading-snug hover:text-primary">{item.product.name}</Link><p className="mt-2 text-[11px] text-muted-foreground">{item.license.licenseType.replaceAll("_", " ")} · Qty {item.cartItem.quantity}</p><p className="mt-1 font-display text-sm font-black"><PriceDisplay usdAmount={Number.parseFloat(item.license.price) * item.cartItem.quantity} /></p></div><button type="button" disabled={pending} onClick={() => remove(item.cartItem.id)} className="mt-1 flex size-8 items-center justify-center text-muted-foreground hover:text-destructive" aria-label={`Remove ${item.product.name}`}><Trash size={14} /></button></li>)}</ul>
                )}
              </div>

              {items.length > 0 && !loading && <div className="border-t border-border p-5 pb-[max(20px,env(safe-area-inset-bottom))] sm:p-6"><div className="mb-4 flex items-end justify-between"><span className="text-sm text-muted-foreground">Subtotal</span><span className="font-display text-3xl font-black tracking-[-0.05em]"><PriceDisplay usdAmount={subtotal} /></span></div><Link href="/checkout" onClick={() => setOpen(false)} className="group flex h-14 items-center justify-between bg-[#111827] px-5 text-sm font-black text-white dark:bg-white dark:text-[#111827]">Secure checkout <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" /></Link><Link href="/cart" onClick={() => setOpen(false)} className="mt-3 block text-center text-xs font-semibold text-muted-foreground hover:text-foreground">Review full cart</Link></div>}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

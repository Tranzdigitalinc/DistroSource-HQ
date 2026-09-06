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

const EASE = [0.16, 1, 0.3, 1] as const

type CartRows = Awaited<ReturnType<typeof getCartItems>>

export function V4CartDrawer() {
  const { count } = useCartCount()
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<CartRows>([])
  const [loading, setLoading] = useState(false)
  const [isPending, startTransition] = useTransition()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setItems(await getCartItems())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!open) return
    void load()
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [open, load])

  const subtotal = items.reduce(
    (sum, item) => sum + Number.parseFloat(item.license.price) * item.cartItem.quantity,
    0,
  )

  function remove(id: number) {
    startTransition(async () => {
      await removeCartItem(id)
      await mutate("/api/cart/summary")
      await load()
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={count > 0 ? `Open cart, ${count} items` : "Open cart"}
        className="group relative flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground hover:text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ShoppingCart size={19} aria-hidden="true" />
        <AnimatePresence>
          {count > 0 && (
            <motion.span
              key={count}
              initial={{ scale: 0.45, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.45, opacity: 0 }}
              transition={{ type: "spring", stiffness: 520, damping: 28 }}
              className="absolute -right-1 -top-1 flex min-w-[18px] items-center justify-center rounded-full bg-primary px-1 font-mono text-[9px] font-black leading-[18px] text-primary-foreground ring-2 ring-background"
            >
              {count > 9 ? "9+" : count}
            </motion.span>
          )}
        </AnimatePresence>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[100]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <button
              type="button"
              aria-label="Close cart"
              onClick={() => setOpen(false)}
              className="absolute inset-0 bg-foreground/22 backdrop-blur-[2px]"
            />

            <motion.aside
              role="dialog"
              aria-modal="true"
              aria-label="Shopping cart"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.42, ease: EASE }}
              className="absolute right-0 top-0 flex h-full w-full max-w-[430px] flex-col bg-background shadow-[-24px_0_80px_rgba(0,0,0,0.14)]"
            >
              <div className="flex h-20 shrink-0 items-center justify-between border-b border-border px-6">
                <div>
                  <p className="font-display text-xl font-black tracking-[-0.03em]">Your cart</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{count} {count === 1 ? "item" : "items"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex size-10 items-center justify-center rounded-full border border-border transition-colors hover:bg-secondary"
                  aria-label="Close cart"
                >
                  <Close size={18} aria-hidden="true" />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
                {loading ? (
                  <div className="flex h-full min-h-64 items-center justify-center text-muted-foreground">
                    <Loader2 className="size-5 animate-spin" aria-hidden="true" />
                  </div>
                ) : items.length === 0 ? (
                  <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
                    <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                      <ShoppingCart size={22} aria-hidden="true" />
                    </span>
                    <h2 className="mt-5 font-display text-2xl font-black tracking-tight">Nothing here yet.</h2>
                    <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                      Explore the catalog and build your digital toolkit.
                    </p>
                    <Link
                      href="/products"
                      onClick={() => setOpen(false)}
                      className="mt-6 inline-flex h-11 items-center gap-2 rounded-full bg-foreground px-5 text-sm font-semibold text-background transition-transform active:scale-[0.97]"
                    >
                      Explore products
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                ) : (
                  <ul className="space-y-5">
                    {items.map((item) => (
                      <li key={item.cartItem.id} className="group grid grid-cols-[88px_1fr_auto] gap-4 border-b border-border pb-5">
                        <Link href={`/products/${item.product.slug}`} onClick={() => setOpen(false)} className="relative aspect-square overflow-hidden rounded-2xl bg-secondary">
                          {item.imageUrl ? (
                            <Image src={item.imageUrl} alt="" fill sizes="88px" className="object-cover transition-transform duration-500 group-hover:scale-105" />
                          ) : null}
                        </Link>
                        <div className="min-w-0 py-1">
                          <p className="truncate text-[11px] font-medium text-muted-foreground">{item.categoryName ?? "Digital product"}</p>
                          <Link href={`/products/${item.product.slug}`} onClick={() => setOpen(false)} className="mt-1 line-clamp-2 font-display text-sm font-bold leading-snug hover:text-primary">
                            {item.product.name}
                          </Link>
                          <p className="mt-2 text-xs text-muted-foreground">{item.license.licenseType.replaceAll("_", " ")} · Qty {item.cartItem.quantity}</p>
                          <p className="mt-1 font-display text-sm font-black"><PriceDisplay usdAmount={Number.parseFloat(item.license.price) * item.cartItem.quantity} /></p>
                        </div>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => remove(item.cartItem.id)}
                          aria-label={`Remove ${item.product.name}`}
                          className="mt-1 flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
                        >
                          <Trash size={15} aria-hidden="true" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {items.length > 0 && !loading && (
                <div className="shrink-0 border-t border-border bg-background px-6 pb-[max(24px,env(safe-area-inset-bottom))] pt-5">
                  <div className="mb-4 flex items-baseline justify-between">
                    <span className="text-sm text-muted-foreground">Subtotal</span>
                    <span className="font-display text-2xl font-black tracking-tight"><PriceDisplay usdAmount={subtotal} /></span>
                  </div>
                  <Link
                    href="/checkout"
                    onClick={() => setOpen(false)}
                    className="group flex h-14 w-full items-center justify-between rounded-full bg-foreground px-6 text-sm font-bold text-background transition-transform active:scale-[0.985]"
                  >
                    Secure checkout
                    <span className="flex size-8 items-center justify-center rounded-full bg-background text-foreground transition-transform group-hover:translate-x-1">
                      <ArrowRight size={15} />
                    </span>
                  </Link>
                  <Link href="/cart" onClick={() => setOpen(false)} className="mt-3 block text-center text-xs font-medium text-muted-foreground hover:text-foreground">
                    Review full cart
                  </Link>
                </div>
              )}
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

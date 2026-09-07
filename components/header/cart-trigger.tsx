"use client"

import { AnimatePresence, motion } from "motion/react"
import { ShoppingBag, ICON_SIZE } from "@/lib/storefront-icons"
import { useCartCount } from "@/lib/use-cart"
import { useCartDrawer } from "@/components/cart/cart-drawer-provider"
import { CartBurst } from "@/components/motion/cart-burst"

export function CartTrigger() {
  const { count } = useCartCount()
  const { openCart } = useCartDrawer()

  return (
    <button
      id="cart-anchor"
      type="button"
      onClick={openCart}
      aria-label={count > 0 ? `Open cart, ${count} ${count === 1 ? "item" : "items"}` : "Open cart"}
      className="group relative ml-1 flex h-10 items-center gap-2 rounded-full bg-foreground pl-3 pr-3.5 text-sm font-semibold text-background transition-[background-color,transform] hover:bg-primary hover:text-primary-foreground active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      <CartBurst />
      <ShoppingBag size={ICON_SIZE.base} weight="bold" className="icon-wiggle" aria-hidden="true" />
      <span className="hidden sm:inline">Cart</span>
      <AnimatePresence mode="popLayout" initial={false}>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 26 }}
            aria-hidden="true"
            className="flex min-w-[1.25rem] items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] font-bold leading-5 text-primary-foreground group-hover:bg-primary-foreground group-hover:text-primary"
          >
            {count > 9 ? "9+" : count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

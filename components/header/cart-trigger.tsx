"use client"

import { AnimatePresence, motion } from "motion/react"
import { ShoppingBag, ICON_SIZE } from "@/lib/storefront-icons"
import { useCartCount } from "@/lib/use-cart"
import { useCartDrawer } from "@/components/cart/cart-drawer-provider"

export function CartTrigger() {
  const { count } = useCartCount()
  const { openCart } = useCartDrawer()

  return (
    <button
      type="button"
      onClick={openCart}
      aria-label={count > 0 ? `Open cart, ${count} ${count === 1 ? "item" : "items"}` : "Open cart"}
      className="relative flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <ShoppingBag size={ICON_SIZE.nav} aria-hidden="true" />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 26 }}
            aria-hidden="true"
            className="absolute -right-0.5 -top-0.5 flex min-w-[1.125rem] items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] font-bold leading-[1.125rem] text-primary-foreground ring-2 ring-background"
          >
            {count > 9 ? "9+" : count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  )
}

"use client"

import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { ShoppingCart, ICON_SIZE } from "@/lib/storefront-icons"
import { useCartCount } from "@/lib/use-cart"

export function CartTrigger() {
  const { count } = useCartCount()

  return (
    <Link
      href="/cart"
      aria-label={count > 0 ? `Cart, ${count} ${count === 1 ? "item" : "items"}` : "Cart"}
      className="relative flex h-10 items-center gap-2 rounded-md px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <span className="relative">
        <ShoppingCart size={ICON_SIZE.nav} aria-hidden="true" />
        <AnimatePresence>
          {count > 0 && (
            <motion.span
              key={count}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
              transition={{ duration: 0.18 }}
              aria-hidden="true"
              className="absolute -right-2 -top-2 flex min-w-[1.125rem] items-center justify-center rounded-full bg-primary px-1 font-mono text-[10px] font-bold leading-[1.125rem] text-primary-foreground ring-2 ring-background"
            >
              {count > 9 ? "9+" : count}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
      <span className="hidden xl:inline">Cart</span>
    </Link>
  )
}

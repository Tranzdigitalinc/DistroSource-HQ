"use client"

import { useState } from "react"
import { AnimatePresence } from "motion/react"
import { CartLineItem, type CartLineItemProps } from "@/components/cart/cart-line-item"

export type CartLineItemData = Omit<CartLineItemProps, "onRemoved">

export function CartItemsList({ items }: { items: CartLineItemData[] }) {
  // Local copy exists only so removals can animate out before the server
  // re-renders. Whenever the server sends fresh rows (licence change,
  // router.refresh), they win — done as derived state from the previous
  // prop rather than in an effect, so there is no extra render pass.
  const [localItems, setLocalItems] = useState(items)
  const [prevItems, setPrevItems] = useState(items)
  if (items !== prevItems) {
    setPrevItems(items)
    setLocalItems(items)
  }

  function handleRemoved(cartItemId: number) {
    setLocalItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId))
  }

  return (
    <ul className="flex flex-col" aria-label="Cart items">
      <AnimatePresence initial={false}>
        {localItems.map((item) => (
          <CartLineItem key={item.cartItemId} {...item} onRemoved={handleRemoved} />
        ))}
      </AnimatePresence>
    </ul>
  )
}

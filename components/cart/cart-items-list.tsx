"use client"

import { useState } from "react"
import { AnimatePresence } from "motion/react"
import { CartLineItem } from "@/components/cart/cart-line-item"

export interface CartLineItemData {
  cartItemId: number
  productSlug: string
  productName: string
  licenseType: string
  imageUrl: string | null
  unitPriceUsd: string
  quantity: number
}

export function CartItemsList({ items }: { items: CartLineItemData[] }) {
  const [localItems, setLocalItems] = useState(items)

  function handleRemoved(cartItemId: number) {
    setLocalItems((prev) => prev.filter((item) => item.cartItemId !== cartItemId))
  }

  return (
    <AnimatePresence initial={false}>
      {localItems.map((item) => (
        <CartLineItem key={item.cartItemId} {...item} onRemoved={handleRemoved} />
      ))}
    </AnimatePresence>
  )
}

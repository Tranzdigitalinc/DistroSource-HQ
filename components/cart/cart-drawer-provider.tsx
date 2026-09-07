"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { mutate } from "swr"

/** SWR key for the drawer's line items; any cart mutation should revalidate it. */
export const CART_ITEMS_KEY = "cart-items"

interface CartDrawerContextValue {
  open: boolean
  openCart: () => void
  closeCart: () => void
  setOpen: (open: boolean) => void
}

const CartDrawerContext = createContext<CartDrawerContextValue | null>(null)

/** Opens the drawer from anywhere (including code outside React, e.g. after a server action). */
export function openCartDrawer() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent("ds:cart-open"))
}

/** Revalidates both the drawer's item list and the header badge count. */
export async function refreshCart() {
  await Promise.all([mutate(CART_ITEMS_KEY), mutate("/api/cart/summary")])
}

export function CartDrawerProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onOpen = () => setOpen(true)
    window.addEventListener("ds:cart-open", onOpen)
    return () => window.removeEventListener("ds:cart-open", onOpen)
  }, [])

  const openCart = useCallback(() => setOpen(true), [])
  const closeCart = useCallback(() => setOpen(false), [])
  const value = useMemo(() => ({ open, openCart, closeCart, setOpen }), [open, openCart, closeCart])

  return <CartDrawerContext.Provider value={value}>{children}</CartDrawerContext.Provider>
}

export function useCartDrawer() {
  const ctx = useContext(CartDrawerContext)
  if (!ctx) throw new Error("useCartDrawer must be used inside CartDrawerProvider")
  return ctx
}

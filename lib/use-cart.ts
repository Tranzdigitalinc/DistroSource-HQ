"use client"

import useSWR from "swr"

export interface CartSummaryItem {
  cartItemId: number
  productSlug: string
  productName: string
  licenseType: string
  unitPriceUsd: string
  quantity: number
  imageUrl: string | null
}

export interface CartSummary {
  count: number
  subtotal: number
  items: CartSummaryItem[]
}

const SUMMARY_KEY = "/api/cart/summary"

async function fetcher(url: string): Promise<CartSummary> {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to load cart")
  return res.json()
}

/**
 * One SWR key backs the header badge and the cart drawer, so adding an item
 * updates both at once and neither can show a stale count.
 */
export function useCartSummary() {
  const { data, isLoading, mutate } = useSWR<CartSummary>(SUMMARY_KEY, fetcher, { revalidateOnFocus: false })
  return {
    count: data?.count ?? 0,
    subtotal: data?.subtotal ?? 0,
    items: data?.items ?? [],
    isLoading: isLoading && !data,
    refresh: mutate,
  }
}

export function useCartCount() {
  const { count, refresh } = useCartSummary()
  return { count, refresh }
}

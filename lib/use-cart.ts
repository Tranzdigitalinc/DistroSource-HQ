"use client"

import useSWR from "swr"

async function fetcher(url: string) {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed to load cart")
  return res.json()
}

export function useCartCount() {
  const { data, mutate } = useSWR<{ count: number }>("/api/cart/summary", fetcher, {
    revalidateOnFocus: false,
  })
  return { count: data?.count ?? 0, refresh: mutate }
}

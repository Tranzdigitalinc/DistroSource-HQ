"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * While an order is awaiting the Polar `order.paid` webhook, re-render the
 * server page on an interval so the confirmed state appears without a
 * manual refresh. This only *reads* status — it never grants access.
 */
export function OrderStatusPoller({ intervalMs = 4000, maxAttempts = 30 }: { intervalMs?: number; maxAttempts?: number }) {
  const router = useRouter()
  useEffect(() => {
    let attempts = 0
    const id = window.setInterval(() => {
      attempts += 1
      if (attempts > maxAttempts) {
        window.clearInterval(id)
        return
      }
      if (document.visibilityState === "visible") router.refresh()
    }, intervalMs)
    return () => window.clearInterval(id)
  }, [router, intervalMs, maxAttempts])
  return null
}

"use client"

import { useEffect, useRef } from "react"
import { PolarEmbedCheckout } from "@polar-sh/checkout/embed"

interface PolarInlineCheckoutProps {
  checkoutUrl: string
  onSuccess: (successUrl: string) => void
  /**
   * Called when the checkout overlay closes without a completed payment —
   * either the buyer dismissed it, or it never managed to open in the first
   * place. The caller should return the buyer to the review step so they
   * are never left staring at a blank page.
   */
  onClose: (reason: "dismissed" | "failed") => void
}

/**
 * Opens Polar's official embedded checkout overlay (`@polar-sh/checkout`)
 * directly on top of the current page — the buyer never navigates to
 * polar.sh or a new tab. This uses Polar's own SDK rather than a hand-rolled
 * iframe so the postMessage handshake, Apple Pay/Google Pay eligibility, and
 * loading state all stay in sync with what Polar actually ships.
 *
 * IMPORTANT: this overlay only renders if the current origin is on the
 * "Embedding" allow-list in the Polar dashboard (Settings → Preferences →
 * Embedding). Without that, Polar refuses to load inside the iframe and
 * `create()` never resolves.
 *
 * This component has no visual output of its own — Polar's SDK appends the
 * overlay iframe straight to `document.body`.
 */
export function PolarInlineCheckout({ checkoutUrl, onSuccess, onClose }: PolarInlineCheckoutProps) {
  // Tracks whether the checkout already succeeded or was actively closed by
  // the buyer, so cleanup (e.g. unmounting after a route change) doesn't
  // also report a spurious "dismissed" close.
  const settledRef = useRef(false)

  useEffect(() => {
    settledRef.current = false
    let cancelled = false
    let instance: Awaited<ReturnType<typeof PolarEmbedCheckout.create>> | null = null

    const theme = document.documentElement.classList.contains("dark") ? "dark" : "light"

    PolarEmbedCheckout.create(checkoutUrl, { theme })
      .then((checkout) => {
        if (cancelled) {
          checkout.close()
          return
        }
        instance = checkout

        checkout.addEventListener("success", (event) => {
          settledRef.current = true
          // We navigate ourselves (client-side, via the router) instead of
          // letting Polar's SDK do a full-page redirect.
          event.preventDefault()
          onSuccess(event.detail.successURL)
        })

        checkout.addEventListener("close", () => {
          if (settledRef.current) return
          settledRef.current = true
          onClose("dismissed")
        })
      })
      .catch((error) => {
        console.error("[v0] Failed to open Polar checkout overlay:", error)
        if (cancelled || settledRef.current) return
        settledRef.current = true
        onClose("failed")
      })

    return () => {
      cancelled = true
      // Only force-close an overlay that's still open for an abandoned
      // payment — never one that already succeeded or was dismissed, since
      // Polar's own `close()` already removed itself in those cases.
      if (instance && !settledRef.current) instance.close()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onSuccess/onClose are recreated every render by the caller; only checkoutUrl should re-trigger this.
  }, [checkoutUrl])

  return null
}

export type { PolarInlineCheckoutProps }

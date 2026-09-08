"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { confirmFungiesPayment } from "@/lib/actions/checkout"
import { Button } from "@/components/ui/button"
import { CopyOrderNumber } from "@/components/order/copy-order-number"
import { Clock, ShieldCheck, Spinner, ICON_SIZE } from "@/lib/storefront-icons"

export interface FungiesBillingData {
  email?: string
  firstName?: string
  lastName?: string
}

interface FungiesCheckoutProps {
  orderNumber: string
  /** Checkout-element URL. Overlay mode requires an element, not an offer link. */
  checkoutUrl: string
  billingData?: FungiesBillingData
  onPaid: (orderNumber: string) => void
  onCancel: () => void
}

const POLL_INTERVAL_MS = 3000
const MAX_ATTEMPTS = 300 // ~15 minutes
const OPEN_FAILED = "We couldn't open the payment window. Please try a different payment method."

/**
 * Fungies checkout as an overlay on this page — no second tab.
 *
 * The SDK renders Fungies' checkout element in a full-screen iframe over the
 * app and emits DOM events when the buyer finishes or dismisses it. Those
 * events are UX signals only: money is confirmed by the signed
 * `payment_success` webhook, so this keeps polling our own order row and
 * only advances once the order is actually completed.
 *
 * Requires the site's domain to be listed under Authorized Domains in the
 * Fungies dashboard — the checkout sets `frame-ancestors` from that list, and
 * an unlisted domain renders an empty frame with no JavaScript error.
 */
export function FungiesCheckout({ orderNumber, checkoutUrl, billingData, onPaid, onCancel }: FungiesCheckoutProps) {
  const [error, setError] = useState<string | null>(null)
  const [phase, setPhase] = useState<"open" | "dismissed" | "confirming">("open")
  const settledRef = useRef(false)
  const sdkRef = useRef<typeof import("@fungies/fungies-js").Fungies | null>(null)

  /** Opens the overlay. Reports success rather than setting state itself. */
  const openOverlay = useCallback(async (): Promise<boolean> => {
    try {
      // Imported lazily: the SDK touches `window` at module scope, so it must
      // never be pulled into the server render.
      const mod = await import("@fungies/fungies-js")
      sdkRef.current = mod.Fungies
      mod.Fungies.Initialize({ enableDataAttributes: false })
      mod.Fungies.Checkout.open({
        checkoutUrl,
        settings: { mode: "overlay" },
        ...(billingData ? { billingData } : {}),
      })
      return true
    } catch (err) {
      console.error("[v0] Fungies overlay failed to open:", err)
      return false
    }
  }, [checkoutUrl, billingData])

  const reopen = useCallback(() => {
    setPhase("open")
    void openOverlay().then((ok) => {
      if (!ok) setError(OPEN_FAILED)
    })
  }, [openOverlay])

  // Open on mount, and wire the SDK's DOM events.
  useEffect(() => {
    let cancelled = false

    const onComplete = () => {
      if (cancelled) return
      // The buyer paid. The webhook still has to land before files unlock,
      // so show a confirming state rather than claiming success outright.
      setPhase("confirming")
    }
    const onClose = () => {
      if (cancelled || settledRef.current) return
      setPhase((current) => (current === "confirming" ? current : "dismissed"))
    }

    document.addEventListener("fungies:checkout:complete", onComplete)
    document.addEventListener("fungies:checkout:close", onClose)
    void openOverlay().then((ok) => {
      if (!cancelled && !ok) setError(OPEN_FAILED)
    })

    return () => {
      cancelled = true
      document.removeEventListener("fungies:checkout:complete", onComplete)
      document.removeEventListener("fungies:checkout:close", onClose)
      try {
        sdkRef.current?.Checkout.close()
      } catch {
        // Already closed, or the SDK never loaded. Nothing to clean up.
      }
    }
  }, [openOverlay])

  // Poll our own order row. Fulfilment is owned by the webhook.
  useEffect(() => {
    settledRef.current = false
    let cancelled = false
    let attempts = 0
    let timeoutId: number

    async function poll() {
      if (cancelled || settledRef.current) return
      attempts += 1
      try {
        const result = await confirmFungiesPayment(orderNumber)
        if (cancelled || settledRef.current) return
        if (result.status === "paid") {
          settledRef.current = true
          try {
            sdkRef.current?.Checkout.close()
          } catch {
            // Overlay may already be gone.
          }
          onPaid(result.orderNumber)
          return
        }
        if (result.status === "error") {
          settledRef.current = true
          setError(result.error)
          return
        }
      } catch (err) {
        // A transient network hiccup talking to our own server action — keep
        // trying rather than giving up on the buyer's payment.
        console.error("[v0] Fungies poll failed:", err)
      }
      if (attempts < MAX_ATTEMPTS && !cancelled && !settledRef.current) {
        timeoutId = window.setTimeout(poll, POLL_INTERVAL_MS)
      }
    }

    timeoutId = window.setTimeout(poll, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
    }
  }, [orderNumber, onPaid])

  const heading = error ? "Payment couldn't continue" : phase === "confirming" ? "Confirming your payment…" : phase === "dismissed" ? "Payment window closed" : "Complete your payment"
  const body =
    error ??
    (phase === "confirming"
      ? "Payment received. We're waiting for the final confirmation, then your files unlock automatically."
      : phase === "dismissed"
        ? "You closed the payment window before finishing. Nothing has been charged — you can pick up where you left off."
        : "The payment window is open over this page. Your files unlock here the moment the payment is confirmed.")

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-10 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-foreground">
        <Clock size={ICON_SIZE.feature} className="animate-pulse motion-reduce:animate-none" aria-hidden="true" />
      </span>
      <div>
        <h2 className="font-display text-lg font-bold text-foreground">{heading}</h2>
        <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">{body}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Order reference <CopyOrderNumber orderNumber={orderNumber} />
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {!error && phase !== "confirming" && (
          <Button type="button" onClick={reopen} className="rounded-full font-semibold">
            {phase === "dismissed" ? "Resume payment" : "Reopen payment window"}
          </Button>
        )}
        <Button type="button" variant="outline" className="rounded-full bg-transparent font-semibold" onClick={onCancel}>
          Choose a different method
        </Button>
      </div>
      {!error && (
        <>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Spinner size={ICON_SIZE.sm} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
            Checking payment status…
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck size={ICON_SIZE.sm} className="text-primary" aria-hidden="true" />
            Fungies is the merchant of record and handles tax on this order.
          </p>
        </>
      )}
    </div>
  )
}

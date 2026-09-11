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

/** Result of a status poll — the same shape for one-time orders and
 * memberships, so the overlay can drive either. */
export type FungiesConfirmResult =
  | { status: "paid"; orderNumber: string }
  | { status: "pending" }
  | { status: "error"; error: string }

interface FungiesCheckoutProps {
  /** Polling key — an order number, or a subscription reference for memberships. */
  orderNumber: string
  /** Checkout-element URL. Overlay mode requires an element, not an offer link. */
  checkoutUrl: string
  /** Hosted link for the same offer, used if the overlay frame is refused. */
  fallbackUrl: string
  billingData?: FungiesBillingData
  /** Polls our own server for settlement. Defaults to the one-time order check. */
  confirm?: (ref: string) => Promise<FungiesConfirmResult>
  /** Switches the copy between a product order and a membership. */
  context?: "order" | "membership"
  onPaid: (orderNumber: string) => void
  onCancel: () => void
}

const POLL_INTERVAL_MS = 3000
const MAX_ATTEMPTS = 300 // ~15 minutes
const OPEN_FAILED = "We couldn't open the payment window. Please try a different payment method."
const STALL_HINT_MS = 9000

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
export function FungiesCheckout({ orderNumber, checkoutUrl, fallbackUrl, billingData, confirm = confirmFungiesPayment, context = "order", onPaid, onCancel }: FungiesCheckoutProps) {
  const noun = context === "membership" ? "membership" : "order"
  const [error, setError] = useState<string | null>(null)
  const [phase, setPhase] = useState<"open" | "dismissed" | "confirming" | "timedOut">("open")
  // A frame refused by the provider (domain not authorized) renders blank and
  // fires no event, so there is nothing to catch. If the overlay has been
  // open this long without the buyer touching it, offer the hosted tab.
  const [showFallback, setShowFallback] = useState(false)
  const settledRef = useRef(false)
  const sdkRef = useRef<typeof import("@fungies/fungies-js").Fungies | null>(null)
  // Bumped by "Check again" after a timeout to re-arm the polling effect —
  // it otherwise only depends on orderNumber/onPaid, so a phase change alone
  // wouldn't restart it.
  const [pollGeneration, setPollGeneration] = useState(0)

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
    // These listeners must be registered synchronously on mount, before the
    // lazy SDK import above resolves, so we can't reference the imported
    // DOM_CHECKOUT_EVENTS constants here — that would force the SDK to load
    // eagerly at module scope, which is exactly what the lazy import avoids.
    // Literal event names are the documented pattern for this case (it's
    // the same approach the SDK docs' own vanilla-JS/CDN example uses).
    const completeEvent = "fungies:checkout:complete"
    const closeEvent = "fungies:checkout:close"

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

    const stallTimer = window.setTimeout(() => {
      if (!cancelled) setShowFallback(true)
    }, STALL_HINT_MS)

    document.addEventListener(completeEvent, onComplete)
    document.addEventListener(closeEvent, onClose)
    void openOverlay().then((ok) => {
      if (!cancelled && !ok) setError(OPEN_FAILED)
    })

    return () => {
      cancelled = true
      window.clearTimeout(stallTimer)
      document.removeEventListener(completeEvent, onComplete)
      document.removeEventListener(closeEvent, onClose)
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
      // Backgrounded tabs skip the request entirely rather than burning it on
      // an attempt — the visibilitychange listener below fires an immediate
      // poll the moment the buyer comes back, so nothing is lost.
      if (document.visibilityState === "hidden") {
        timeoutId = window.setTimeout(poll, POLL_INTERVAL_MS)
        return
      }
      attempts += 1
      try {
        const result = await confirm(orderNumber)
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
      if (cancelled || settledRef.current) return
      if (attempts < MAX_ATTEMPTS) {
        timeoutId = window.setTimeout(poll, POLL_INTERVAL_MS)
      } else {
        // ~15 minutes with no resolution. The webhook may still land later —
        // this only stops the silent spinner, it never marks the order
        // failed. "Check again" below re-arms polling for another window.
        setPhase("timedOut")
      }
    }

    const onVisible = () => {
      if (document.visibilityState === "visible" && !cancelled && !settledRef.current) {
        window.clearTimeout(timeoutId)
        void poll()
      }
    }
    document.addEventListener("visibilitychange", onVisible)

    timeoutId = window.setTimeout(poll, POLL_INTERVAL_MS)
    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
      document.removeEventListener("visibilitychange", onVisible)
    }
  }, [orderNumber, onPaid, pollGeneration])

  const resumePolling = useCallback(() => {
    settledRef.current = false
    setPhase("open")
    setPollGeneration((n) => n + 1)
  }, [])

  const heading = error
    ? "Payment couldn't continue"
    : phase === "confirming"
      ? "Confirming your payment…"
      : phase === "dismissed"
        ? "Payment window closed"
        : phase === "timedOut"
          ? "Still waiting on confirmation"
          : "Complete your payment"
  const settledOutcome =
    context === "membership" ? "your membership activates automatically" : "your files unlock automatically"
  const body =
    error ??
    (phase === "confirming"
      ? `Payment received. We're waiting for the final confirmation, then ${settledOutcome}.`
      : phase === "dismissed"
        ? "You closed the payment window before finishing. Nothing has been charged — you can pick up where you left off."
        : phase === "timedOut"
          ? `This is taking longer than usual. If you completed the payment, keep your reference and check again — nothing has been charged twice either way.`
          : `The payment window is open over this page. Your ${noun} is confirmed here the moment the payment goes through.`)

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-10 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-foreground">
        <Clock size={ICON_SIZE.feature} className="animate-pulse motion-reduce:animate-none" aria-hidden="true" />
      </span>
      <div aria-live="polite">
        <h2 className="font-display text-lg font-bold text-foreground">{heading}</h2>
        <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">{body}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Order reference <CopyOrderNumber orderNumber={orderNumber} />
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        {phase === "timedOut" ? (
          <Button type="button" onClick={resumePolling} className="rounded-full font-semibold">
            Check again
          </Button>
        ) : (
          !error &&
          phase !== "confirming" && (
            <Button type="button" onClick={reopen} className="rounded-full font-semibold">
              {phase === "dismissed" ? "Resume payment" : "Reopen payment window"}
            </Button>
          )
        )}
        <Button type="button" variant="outline" className="rounded-full bg-transparent font-semibold" onClick={onCancel}>
          Choose a different method
        </Button>
      </div>
      {(showFallback || error) && phase !== "confirming" && phase !== "timedOut" && (
        <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
          Payment window not loading?{" "}
          <a
            href={fallbackUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-primary underline underline-offset-4"
          >
            Open it in a new tab instead
          </a>
          . This page keeps watching for the payment either way.
        </p>
      )}
      {!error && phase !== "timedOut" && (
        <>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Spinner size={ICON_SIZE.sm} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
            Checking payment status…
          </p>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck size={ICON_SIZE.sm} className="text-primary" aria-hidden="true" />
            Fungies is the merchant of record and handles tax on this {noun === "membership" ? "subscription" : "order"}.
          </p>
        </>
      )}
    </div>
  )
}

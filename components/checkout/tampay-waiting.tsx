"use client"

import { useEffect, useRef, useState } from "react"
import { confirmTampayPayment } from "@/lib/actions/checkout"
import { Button } from "@/components/ui/button"
import { CopyOrderNumber } from "@/components/order/copy-order-number"
import { ArrowUpRight, Clock, Spinner, ICON_SIZE } from "@/lib/storefront-icons"

interface TampayWaitingProps {
  orderNumber: string
  paymentUrl: string
  onPaid: (orderNumber: string) => void
  onCancel: () => void
}

const POLL_INTERVAL_MS = 4000
const MAX_ATTEMPTS = 150 // ~10 minutes

/**
 * TamPay has no return URL and no webhook, so this component IS the entire
 * confirmation UX: the buyer already has TamPay's hosted payment page open
 * in a separate tab (opened by the caller right before this mounts), and
 * this actively polls the `confirmTampayPayment` Server Action — which
 * itself re-checks payment directly with TamPay's API, never trusting the
 * client — until it reports "paid".
 */
export function TampayWaiting({ orderNumber, paymentUrl, onPaid, onCancel }: TampayWaitingProps) {
  const [error, setError] = useState<string | null>(null)
  const settledRef = useRef(false)

  useEffect(() => {
    settledRef.current = false
    let cancelled = false
    let attempts = 0
    let timeoutId: number

    async function poll() {
      if (cancelled || settledRef.current) return
      attempts += 1
      try {
        const result = await confirmTampayPayment(orderNumber)
        if (cancelled || settledRef.current) return
        if (result.status === "paid") {
          settledRef.current = true
          onPaid(result.orderNumber)
          return
        }
        if (result.status === "error") {
          settledRef.current = true
          setError(result.error)
          return
        }
      } catch (err) {
        // A transient network hiccup polling our own server action — keep
        // trying rather than giving up on the buyer's payment.
        console.error("[v0] TamPay poll failed:", err)
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

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card px-6 py-10 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-foreground">
        <Clock size={ICON_SIZE.feature} className="animate-pulse motion-reduce:animate-none" aria-hidden="true" />
      </span>
      <div>
        <h2 className="font-display text-lg font-bold text-foreground">Waiting for payment…</h2>
        <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {error ?? "Complete your payment in the TamPay tab that just opened. This page updates on its own the moment it's confirmed."}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Order reference <CopyOrderNumber orderNumber={orderNumber} />
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={() => window.open(paymentUrl, "_blank", "noopener,noreferrer")} className="font-semibold">
          Reopen payment page
          <ArrowUpRight size={ICON_SIZE.sm} aria-hidden="true" />
        </Button>
        <Button type="button" variant="outline" className="bg-transparent font-semibold" onClick={onCancel}>
          Choose a different method
        </Button>
      </div>
      {!error && (
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Spinner size={ICON_SIZE.sm} className="animate-spin motion-reduce:animate-none" aria-hidden="true" />
          Checking payment status…
        </p>
      )}
    </div>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import { confirmFungiesPayment } from "@/lib/actions/checkout"
import { Button } from "@/components/ui/button"
import { CopyOrderNumber } from "@/components/order/copy-order-number"
import { ArrowUpRight, Clock, ShieldCheck, Spinner, ICON_SIZE } from "@/lib/storefront-icons"

interface FungiesWaitingProps {
  orderNumber: string
  paymentUrl: string
  onPaid: (orderNumber: string) => void
  onCancel: () => void
}

const POLL_INTERVAL_MS = 3000
const MAX_ATTEMPTS = 300 // ~15 minutes

/**
 * Confirmation screen for Fungies. The buyer pays on Fungies' hosted
 * checkout in a separate tab; their signed webhook fulfils the order. This
 * screen only polls OUR database for that change, so it never touches the
 * provider's API and cannot be rate limited by it.
 */
export function FungiesWaiting({ orderNumber, paymentUrl, onPaid, onCancel }: FungiesWaitingProps) {
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
        const result = await confirmFungiesPayment(orderNumber)
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

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-10 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-foreground">
        <Clock size={ICON_SIZE.feature} className="animate-pulse motion-reduce:animate-none" aria-hidden="true" />
      </span>
      <div>
        <h2 className="font-display text-lg font-bold text-foreground">Waiting for payment…</h2>
        <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {error ?? "Complete your payment in the Fungies tab that just opened. Your files unlock here the moment the payment is confirmed."}
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          Order reference <CopyOrderNumber orderNumber={orderNumber} />
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={() => window.open(paymentUrl, "_blank", "noopener,noreferrer")} className="rounded-full font-semibold">
          Reopen payment page
          <ArrowUpRight size={ICON_SIZE.sm} aria-hidden="true" />
        </Button>
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

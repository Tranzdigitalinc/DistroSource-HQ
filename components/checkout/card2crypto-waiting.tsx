"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { checkCard2CryptoPaymentNow, confirmCard2CryptoPayment } from "@/lib/actions/checkout"
import { Button } from "@/components/ui/button"
import { CopyOrderNumber } from "@/components/order/copy-order-number"
import { ArrowUpRight, Check, Clock, Spinner, ICON_SIZE } from "@/lib/storefront-icons"

interface Card2CryptoWaitingProps {
  orderNumber: string
  paymentUrl: string
  onPaid: (orderNumber: string) => void
  onCancel: () => void
}

const POLL_INTERVAL_MS = 4000
const MAX_ATTEMPTS = 225 // ~15 minutes

/**
 * Confirmation screen for Card2Crypto. The buyer pays on Card2Crypto's
 * hosted page in a separate tab; their bot then calls our callback, which
 * verifies and fulfils the order. This screen only polls OUR database for
 * that change (cheap, never rate-limited by the provider) and offers one
 * explicit "I've paid" button that asks the provider directly.
 */
export function Card2CryptoWaiting({ orderNumber, paymentUrl, onPaid, onCancel }: Card2CryptoWaitingProps) {
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [isChecking, startCheck] = useTransition()
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
        const result = await confirmCard2CryptoPayment(orderNumber)
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
        console.error("[v0] Card2Crypto poll failed:", err)
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

  function checkNow() {
    setNotice(null)
    startCheck(async () => {
      try {
        const result = await checkCard2CryptoPaymentNow(orderNumber)
        if (result.status === "paid") {
          settledRef.current = true
          onPaid(result.orderNumber)
        } else if (result.status === "pending") {
          setNotice("No payment has reached us yet. If you just paid, give it a minute — this page updates on its own.")
        } else if (result.status === "underpaid") {
          setNotice(`We received $${result.received.toFixed(2)} of $${result.expected.toFixed(2)}. Support will sort this out — keep your order reference handy.`)
        } else {
          setError(result.error)
        }
      } catch {
        setNotice("Couldn't check right now. This page keeps checking automatically.")
      }
    })
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-10 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-foreground">
        <Clock size={ICON_SIZE.feature} className="animate-pulse motion-reduce:animate-none" aria-hidden="true" />
      </span>
      <div>
        <h2 className="font-display text-lg font-bold text-foreground">Waiting for payment…</h2>
        <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
          {error ?? "Complete your payment in the Card2Crypto tab that just opened. Your files unlock here the moment the payment is confirmed."}
        </p>
        {notice && !error && <p className="mt-2 max-w-sm text-xs leading-relaxed text-foreground">{notice}</p>}
        <p className="mt-2 text-xs text-muted-foreground">
          Order reference <CopyOrderNumber orderNumber={orderNumber} />
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <Button type="button" onClick={() => window.open(paymentUrl, "_blank", "noopener,noreferrer")} className="rounded-full font-semibold">
          Reopen payment page
          <ArrowUpRight size={ICON_SIZE.sm} aria-hidden="true" />
        </Button>
        {!error && (
          <Button type="button" variant="outline" disabled={isChecking} onClick={checkNow} className="rounded-full bg-transparent font-semibold">
            {isChecking ? <Spinner size={ICON_SIZE.sm} className="animate-spin" aria-hidden="true" /> : <Check size={ICON_SIZE.sm} aria-hidden="true" />}
            I&apos;ve paid, check now
          </Button>
        )}
        <Button type="button" variant="ghost" className="rounded-full font-semibold" onClick={onCancel}>
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

"use client"

import { Button } from "@/components/ui/button"
import { CopyOrderNumber } from "@/components/order/copy-order-number"
import { ArrowUpRight, Clock, ICON_SIZE } from "@/lib/storefront-icons"

interface WhopWaitingProps {
  orderNumber: string
  paymentUrl: string
  onCancel: () => void
}

/**
 * Whop's hosted checkout has a real return URL and a webhook, so — unlike
 * TamPay — this component does NOT poll anything. The buyer already has
 * Whop's payment page open in a separate tab; once they pay, Whop redirects
 * that tab straight to `/checkout/success`, whose own poller
 * (OrderStatusPoller) picks up the fulfillment performed by the verified
 * `payment.succeeded` webhook. This screen exists only so the original tab
 * isn't left blank in the meantime.
 */
export function WhopWaiting({ orderNumber, paymentUrl, onCancel }: WhopWaitingProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-border bg-card px-6 py-10 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-foreground">
        <Clock size={ICON_SIZE.feature} className="animate-pulse motion-reduce:animate-none" aria-hidden="true" />
      </span>
      <div>
        <h2 className="font-display text-lg font-bold text-foreground">Payment in progress…</h2>
        <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
          Complete your payment in the Whop tab that just opened. Once it&apos;s confirmed, you&apos;ll be redirected here automatically.
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
    </div>
  )
}

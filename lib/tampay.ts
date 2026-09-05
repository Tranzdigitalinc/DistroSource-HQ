import "server-only"

/**
 * TamPay REST API helper. Docs: https://tampay.io/docapi
 *
 * TamPay has no webhook/callback mechanism and its hosted payment page
 * (pay.tampay.io) has no return-url parameter, so this integration cannot
 * rely on a redirect back to DistroSource the way Polar does. Instead:
 *
 *   1. `createTampayPaymentLink` creates a fixed-amount, single-use link.
 *      The amount is locked in server-side at creation time from our own
 *      pricing, exactly like a Polar checkout or PayPal order — TamPay's
 *      hosted page cannot charge a different amount.
 *   2. The buyer completes payment on TamPay's hosted page in a separate
 *      tab.
 *   3. `getTampayLinkStatus` is polled from the server (never trusted from
 *      the client) to actively confirm payment before anything is
 *      fulfilled. See `confirmTampayPayment` in lib/actions/checkout.ts.
 */

const TAMPAY_API_BASE = "https://tampay.io/api/v1"

export type TampayPaymentMethod = "togo" | "lahza" | "stripe"

export interface TampayCustomer {
  name: string
  email: string
  /** Required for Togo only, international format (e.g. +970599000000). */
  phone?: string
  /** Required for Togo only. */
  city?: string
  /** ISO 3166-1 alpha-2. Togo only; TamPay infers it from phone/IP if omitted. */
  country?: string
}

export interface TampayPaymentLink {
  id: string
  /** TamPay's own generated order id (TP-XXXXXX) — always use this one for status checks, never one we mint ourselves. */
  orderId: string
  title: string
  amount: number
  currency: string
  paymentMethod: TampayPaymentMethod
  isActive: boolean
  isOneTime: boolean
  buyerPaysFee: boolean
  url: string
  createdAt: string
  customer?: TampayCustomer
}

export interface TampayLinkStatus {
  paid: boolean
  status: string
}

function getTampayApiKey(): string {
  const key = process.env.TAMPAY_API_KEY?.trim()
  if (!key) throw new Error("TAMPAY_API_KEY is not configured.")
  return key
}

async function tampayFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${TAMPAY_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getTampayApiKey()}`,
      "Content-Type": "application/json",
      ...(init.headers as Record<string, string> | undefined),
    },
    cache: "no-store",
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = (data as { message?: string; error?: string })?.message ?? (data as { error?: string })?.error ?? `TamPay request failed with status ${res.status}`
    throw new Error(message)
  }
  return data as T
}

/**
 * Creates a single-use TamPay payment link for a fixed amount. Any
 * `orderId` we might pass is ignored by TamPay — it always assigns its own
 * (`TP-XXXXXX`) and returns it in the response, which is what we persist
 * and later poll with.
 */
export async function createTampayPaymentLink(input: {
  title: string
  amountUsd: number
  paymentMethod: TampayPaymentMethod
  buyerPaysFee: boolean
  customer: TampayCustomer
}): Promise<TampayPaymentLink> {
  return tampayFetch<TampayPaymentLink>("/payment-links/one-time", {
    method: "POST",
    body: JSON.stringify({
      title: input.title,
      amount: input.amountUsd,
      currency: "USD",
      paymentMethod: input.paymentMethod,
      buyerPaysFee: input.buyerPaysFee,
      customer: input.customer,
    }),
  })
}

/**
 * Actively checks whether a one-time link has been paid. This is the only
 * source of truth for TamPay fulfilment — there is no webhook, so the
 * client polls a Server Action that calls this on an interval while the
 * buyer completes payment in a separate tab.
 */
export async function getTampayLinkStatus(tampayOrderId: string): Promise<TampayLinkStatus> {
  return tampayFetch<TampayLinkStatus>(`/one-time-links/${encodeURIComponent(tampayOrderId)}`, {
    method: "GET",
  })
}

import "server-only"

import { createHmac, timingSafeEqual } from "node:crypto"
import { getFungiesKeys, getFungiesProductId, getFungiesStoreUrl } from "@/lib/env"

/**
 * Fungies payment helper. Docs: https://docs.fungies.io
 *
 * Fungies is a merchant of record: it takes the payment, charges the right
 * tax and pays out. Its model is Product → Offer → Checkout, so a
 * variable-amount cart is expressed as a single-use Offer:
 *
 *   1. `createFungiesOffer` creates an offer priced at our own computed
 *      order total, against one reusable "DistroSource order" product. The
 *      offer carries `externalId = <our order number>` and `limit: 1`, so a
 *      link can be paid exactly once and the payment is unambiguously
 *      traceable back to one DistroSource order.
 *   2. The buyer pays on Fungies' hosted checkout (`buildFungiesCheckoutUrl`).
 *   3. Fungies POSTs a signed `payment_success` webhook, which is the only
 *      thing that fulfils the order. See app/api/webhooks/fungies/route.ts.
 *
 * Nothing here trusts the client: the amount is fixed server-side at offer
 * creation, and the webhook signature is verified against the raw body.
 */

const FUNGIES_API_BASE = "https://api.fungies.io/v0"

/**
 * Card processing has a practical floor well above the API's own 0.01 USD
 * minimum; below this a checkout is more likely to be declined than paid.
 */
export const FUNGIES_MIN_USD = 0.5

export interface FungiesOffer {
  id: string
  /** Echo of the `externalId` we sent — our order number. */
  internalId: string | null
  /** Smallest currency unit, e.g. 2999 for $29.99. Fungies returns minor units. */
  price: number
  currency: string
  status: string
}

interface FungiesEnvelope<T> {
  status?: string
  data?: T
  error?: { message?: string; code?: string } | string
  message?: string
}

async function fungiesFetch<T>(path: string, init: RequestInit & { write?: boolean } = {}): Promise<T> {
  const { publicKey, secretKey } = getFungiesKeys()
  const { write, ...rest } = init
  const res = await fetch(`${FUNGIES_API_BASE}${path}`, {
    ...rest,
    headers: {
      "x-fngs-public-key": publicKey,
      // Reads need only the public key; writes are rejected with 401 without this.
      ...(write ? { "x-fngs-secret-key": secretKey } : {}),
      "Content-Type": "application/json",
      ...(rest.headers as Record<string, string> | undefined),
    },
    cache: "no-store",
  })

  const body = (await res.json().catch(() => ({}))) as FungiesEnvelope<T>
  if (!res.ok || body.status === "error") {
    const detail =
      typeof body.error === "string"
        ? body.error
        : body.error?.message ?? body.message ?? `Fungies request failed with status ${res.status}`
    throw new Error(detail)
  }
  if (!body.data) throw new Error("Fungies returned an empty response.")
  return body.data
}

/**
 * Creates the single-use offer a buyer pays. `price` is sent as a decimal
 * amount (29.99) even though every response reads back in minor units — that
 * asymmetry is in Fungies' API, not a bug here.
 */
export async function createFungiesOffer(input: {
  orderNumber: string
  amountUsd: number
  name: string
}): Promise<FungiesOffer> {
  const data = await fungiesFetch<{ offer: FungiesOffer }>("/offers/create", {
    method: "POST",
    write: true,
    body: JSON.stringify({
      productId: getFungiesProductId(),
      name: input.name,
      currency: "USD",
      // Decimal in, minor units out. Round to cents so floating point can
      // never send a fraction of a cent, which Fungies rejects.
      price: Math.round(input.amountUsd * 100) / 100,
      // One sale per link: a shared or replayed checkout URL cannot be paid twice.
      limit: 1,
      // Read back as `internalId`, including inside the webhook's items[].
      externalId: input.orderNumber,
    }),
  })
  if (!data.offer?.id) throw new Error("Fungies did not return an offer.")
  return data.offer
}

/** Reads one offer back — used to reconcile a webhook or a stuck order. */
export async function getFungiesOffer(offerId: string): Promise<FungiesOffer> {
  const data = await fungiesFetch<{ offer: FungiesOffer }>(`/offers/${encodeURIComponent(offerId)}`, { method: "GET" })
  return data.offer
}

/**
 * Hosted checkout URL for an offer. Hosted links do not require the domain
 * to be allow-listed (unlike embedded/overlay checkouts), which is why this
 * integration opens a tab rather than an iframe.
 */
export function buildFungiesCheckoutUrl(input: {
  offerId: string
  email: string
  firstName?: string
  lastName?: string
}): string {
  const url = new URL(`/checkout/${input.offerId}`, getFungiesStoreUrl())
  url.searchParams.set("fngs-customer-email", input.email)
  if (input.firstName) url.searchParams.set("fngs-customer-first-name", input.firstName)
  if (input.lastName) url.searchParams.set("fngs-customer-last-name", input.lastName)
  return url.toString()
}

/**
 * Verifies `x-fngs-signature`: the literal string "sha256_" followed by the
 * hex HMAC-SHA256 of the RAW request body, keyed with the webhook secret.
 * Must be given the unparsed body — re-serialised JSON will not match.
 */
export function verifyFungiesSignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature) return false
  const expected = `sha256_${createHmac("sha256", secret).update(rawBody, "utf8").digest("hex")}`
  const a = Buffer.from(expected)
  const b = Buffer.from(signature)
  // Length check first: timingSafeEqual throws on a length mismatch.
  return a.length === b.length && timingSafeEqual(a, b)
}

/* ---------------------------------------------------------------- */
/* Webhook payload                                                    */
/* ---------------------------------------------------------------- */

export interface FungiesEventItem {
  object?: string
  id?: string
  name?: string
  value?: number
  quantity?: number
  currency?: string
  offer?: { object?: string; id?: string; internalId?: string | null }
  product?: { object?: string; id?: string; internalId?: string | null }
}

export interface FungiesEvent {
  id?: string
  type?: string
  idempotencyKey?: string
  testMode?: boolean
  data?: {
    items?: FungiesEventItem[]
    order?: { object?: string; id?: string; orderNumber?: string; value?: number; currency?: string }
    payment?: { object?: string; id?: string; status?: string; value?: number; currency?: string }
    user?: { object?: string; id?: string; email?: string }
  }
}

/**
 * Our order number for a payment event, taken from the offer's `internalId`
 * (the `externalId` we set at creation). Returns null when no line item
 * carries one, which means the payment did not originate from this store.
 */
export function orderNumberFromEvent(event: FungiesEvent): string | null {
  for (const item of event.data?.items ?? []) {
    const ref = item.offer?.internalId
    if (typeof ref === "string" && ref.trim()) return ref.trim()
  }
  return null
}

/** Total paid, in whole currency units. Fungies reports minor units. */
export function paidAmountFromEvent(event: FungiesEvent): number | null {
  const minor = event.data?.payment?.value ?? event.data?.order?.value
  if (typeof minor !== "number" || !Number.isFinite(minor)) return null
  return minor / 100
}

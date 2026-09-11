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
 *   2. `createFungiesCheckoutElement` wraps that offer in a checkout
 *      element, which is the only URL form the SDK can render as an overlay
 *      on our own page. The buyer never leaves the checkout.
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

export interface FungiesCheckoutElement {
  id: string
  name: string | null
  status: string
}

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

export type FungiesRecurringInterval = "month" | "year"

/**
 * Creates a recurring (subscription) offer. Identical to a one-time offer
 * plus `recurringInterval`: Fungies (via Stripe) then stores the buyer's card
 * and auto-charges every interval. `externalId` is our subscription reference,
 * so the webhook's offer.internalId maps straight back to our row — exactly
 * like one-time orders. One offer per subscriber (`limit: 1` = one signup).
 *
 * `productId` is the plan's own Fungies subscription product (see
 * FUNGIES_PLAN_PRODUCT_IDS in lib/membership.ts), not FUNGIES_PRODUCT_ID.
 */
export async function createFungiesRecurringOffer(input: {
  productId: string
  reference: string
  amountUsd: number
  name: string
  interval: FungiesRecurringInterval
}): Promise<FungiesOffer> {
  const data = await fungiesFetch<{ offer: FungiesOffer }>("/offers/create", {
    method: "POST",
    write: true,
    body: JSON.stringify({
      productId: input.productId,
      name: input.name,
      currency: "USD",
      price: Math.round(input.amountUsd * 100) / 100,
      recurringInterval: input.interval,
      recurringIntervalCount: 1,
      limit: 1,
      externalId: input.reference,
    }),
  })
  if (!data.offer?.id) throw new Error("Fungies did not return a recurring offer.")
  return data.offer
}

/**
 * Wraps one offer in a checkout element. Overlay and embedded checkouts can
 * only render an element URL; the bare `/checkout/{offerId}` link is hosted
 * only. One element per order keeps the two one-to-one.
 */
export async function createFungiesCheckoutElement(input: { offerId: string; name: string }): Promise<FungiesCheckoutElement> {
  const data = await fungiesFetch<{ checkoutElement: FungiesCheckoutElement }>("/elements/checkout/create", {
    method: "POST",
    write: true,
    // Note the spelling: the field is "offersIds", not "offerIds".
    body: JSON.stringify({ name: input.name, offersIds: [input.offerId] }),
  })
  if (!data.checkoutElement?.id) throw new Error("Fungies did not return a checkout element.")
  return data.checkoutElement
}

/**
 * URL the SDK opens in the overlay. The site's domain must be listed under
 * Authorized Domains in the Fungies dashboard, or the iframe renders blank.
 */
export function buildFungiesElementUrl(elementId: string): string {
  return new URL(`/checkout-element/${elementId}`, getFungiesStoreUrl()).toString()
}

/** Reads one offer back — used to reconcile a webhook or a stuck order. */
export async function getFungiesOffer(offerId: string): Promise<FungiesOffer> {
  const data = await fungiesFetch<{ offer: FungiesOffer }>(`/offers/${encodeURIComponent(offerId)}`, { method: "GET" })
  return data.offer
}

/** All statuses a Fungies subscription can report. */
export type FungiesSubscriptionStatus =
  | "active"
  | "past_due"
  | "canceled"
  | "unpaid"
  | "incomplete"
  | "incomplete_expired"
  | "trialing"
  | "paused"

export interface FungiesSubscription {
  id: string
  status: FungiesSubscriptionStatus
  currentIntervalStart?: number | null
  currentIntervalEnd?: number | null
  cancelAtIntervalEnd?: boolean
  canceledAt?: number | null
  userId?: string | null
  orderNumber?: string | null
}

/**
 * Authoritative current state of a subscription. Webhook events can arrive
 * out of order, so anything that changes state (updated/cancelled) reconciles
 * against this rather than trusting the event it rode in on.
 *
 * The id is the subscription's own identifier (its initial order number),
 * passed back unchanged — Fungies does NOT strip a leading `#`, so we never
 * add one.
 */
export async function getFungiesSubscription(subscriptionId: string): Promise<FungiesSubscription> {
  const data = await fungiesFetch<{ subscription: FungiesSubscription }>(
    `/subscriptions/${encodeURIComponent(subscriptionId)}`,
    { method: "GET" },
  )
  if (!data.subscription?.id) throw new Error("Fungies did not return a subscription.")
  return data.subscription
}

/**
 * Cancels a subscription. Defaults to end-of-period so the member keeps the
 * access they already paid for until the cycle they cancelled in runs out.
 */
export async function cancelFungiesSubscription(
  subscriptionId: string,
  atPeriodEnd = true,
): Promise<void> {
  await fungiesFetch<{ success: boolean }>(`/subscriptions/${encodeURIComponent(subscriptionId)}/cancel`, {
    method: "PATCH",
    write: true,
    body: JSON.stringify({
      cancelAtIntervalEnd: atPeriodEnd,
      cancelOption: atPeriodEnd ? "endInterval" : "immediately",
    }),
  })
}

/**
 * Hosted checkout URL for a bare offer. Kept as the fallback for anywhere a
 * full-page redirect is wanted; the overlay path uses an element URL instead.
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

export interface FungiesEventSubscription {
  object?: string
  id?: string
  status?: FungiesSubscriptionStatus
  currentIntervalStart?: number | null
  currentIntervalEnd?: number | null
  cancelAtIntervalEnd?: boolean
  canceledAt?: number | null
  userId?: string | null
  orderNumber?: string | null
}

export interface FungiesEvent {
  id?: string
  type?: string
  idempotencyKey?: string
  testMode?: boolean
  data?: {
    items?: FungiesEventItem[]
    order?: { object?: string; id?: string; orderNumber?: string; status?: string; value?: number; currency?: string; subscriptionId?: string | null }
    payment?: {
      object?: string
      id?: string
      status?: string
      /** one_time | subscription_initial | subscription_interval | subscription_update | ... */
      type?: string
      value?: number
      currency?: string
      createdAt?: number | null
      subscriptionId?: string | null
    }
    lastPayment?: { object?: string; id?: string; status?: string; type?: string; createdAt?: number | null }
    subscription?: FungiesEventSubscription
    user?: { object?: string; id?: string; email?: string }
  }
}

/**
 * The subscription an event concerns, if any. Presence of this is the signal
 * that a `payment_success` belongs to a membership rather than a one-time
 * order (which carries only `data.order`).
 */
export function subscriptionFromEvent(event: FungiesEvent): FungiesEventSubscription | null {
  const sub = event.data?.subscription
  return sub && typeof sub.id === "string" && sub.id.trim() ? sub : null
}

/**
 * The Fungies subscription id an event belongs to, from any of the places it
 * can appear. Subscription events always carry `data.subscription`; payment
 * events carry it only "when the payment belongs to a subscription", and also
 * expose `subscriptionId` on the payment and order objects. Reading all three
 * means a membership charge is never mistaken for a one-time order because a
 * single representation was missing.
 */
export function subscriptionIdFromEvent(event: FungiesEvent): string | null {
  const candidates = [event.data?.subscription?.id, event.data?.payment?.subscriptionId, event.data?.order?.subscriptionId]
  for (const c of candidates) if (typeof c === "string" && c.trim()) return c.trim()
  return null
}

/**
 * When the paid charge was made (ms epoch). The same payment is `data.payment`
 * on `payment_success` and `data.lastPayment` on `subscription_interval`, so
 * this is identical across both events for one charge.
 */
export function paidAtFromEvent(event: FungiesEvent): number | null {
  const v = event.data?.payment?.createdAt ?? event.data?.lastPayment?.createdAt
  return typeof v === "number" && Number.isFinite(v) ? v : null
}

/** Milliseconds epoch → Date, tolerant of null/seconds-vs-ms ambiguity. */
export function fungiesTimestampToDate(value: number | null | undefined): Date | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null
  // Fungies documents milliseconds; guard against a seconds value just in case.
  const ms = value < 1e12 ? value * 1000 : value
  return new Date(ms)
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

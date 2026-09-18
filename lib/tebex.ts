import "server-only"

/**
 * Tebex Checkout API client (https://docs.tebex.io/developers/checkout-api).
 *
 * Auth is HTTP Basic — account id as username, private key as password — per
 * the official docs. Packages are described INLINE as custom products, so
 * nothing has to be pre-created in the Tebex panel: every checkout prices the
 * item from our own catalogue, exactly like the per-order Fungies offers.
 *
 * Note: the Checkout API requires Tebex compliance approval on the account
 * (and is unavailable to some UGC creators, e.g. FiveM/RedM). If the account
 * is not approved, calls fail with Tebex's own error message.
 */

const BASE_URL = "https://checkout.tebex.io/api"

function getConfig() {
  const accountId = process.env.TEBEX_ACCOUNT_ID?.trim()
  const privateKey = process.env.TEBEX_PRIVATE_KEY?.trim()
  if (!accountId || !privateKey) throw new Error("Tebex Checkout is not configured.")
  return { accountId, privateKey }
}

async function tebexFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { accountId, privateKey } = getConfig()
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Basic ${Buffer.from(`${accountId}:${privateKey}`).toString("base64")}`,
      ...init.headers,
    },
    cache: "no-store",
  })
  const body = await response.text()
  let parsed: unknown = null
  try { parsed = body ? JSON.parse(body) : null } catch { parsed = null }
  if (!response.ok) {
    const message =
      parsed && typeof parsed === "object" && "message" in parsed
        ? String(parsed.message)
        : `Tebex checkout request failed with status ${response.status}.`
    throw new Error(message)
  }
  return parsed as T
}

export interface TebexBasket {
  ident: string
  expire?: string
  price?: number
  complete?: boolean
  complete_url?: string | null
  cancel_url?: string
  custom?: Record<string, unknown> | null
  links?: { checkout?: string; payment?: string }
}

/**
 * Creates the basket the customer pays through. `custom` is returned in the
 * post-completion webhook — that is how the payment finds its order again.
 */
export async function createTebexBasket(input: {
  completeUrl: string
  cancelUrl: string
  custom: Record<string, unknown>
  email?: string
  firstName?: string
  lastName?: string
}): Promise<TebexBasket> {
  return tebexFetch<TebexBasket>("/baskets", {
    method: "POST",
    body: JSON.stringify({
      complete_url: input.completeUrl,
      cancel_url: input.cancelUrl,
      complete_auto_redirect: true,
      custom: input.custom,
      ...(input.email ? { email: input.email } : {}),
      ...(input.firstName ? { first_name: input.firstName } : {}),
      ...(input.lastName ? { last_name: input.lastName } : {}),
    }),
  })
}

/**
 * Adds an inline custom package — no pre-created Tebex package required.
 * A subscription package renews every `expiryPeriod` until cancelled; Tebex
 * allows only one subscription item per basket and never mixed with one-time
 * items, so a subscription checkout is always its own basket.
 */
export async function addTebexCustomPackage(input: {
  basketIdent: string
  name: string
  priceUsd: number
  quantity: number
  type: "single" | "subscription"
  expiryPeriod?: "month" | "year"
  custom?: Record<string, unknown>
}): Promise<TebexBasket> {
  if (input.type === "subscription" && !input.expiryPeriod) throw new Error("A Tebex subscription package needs an expiry period.")
  return tebexFetch<TebexBasket>(`/baskets/${encodeURIComponent(input.basketIdent)}/packages`, {
    method: "POST",
    body: JSON.stringify({
      package: {
        name: input.name,
        price: input.priceUsd,
        type: input.type,
        qty: input.quantity,
        ...(input.type === "subscription" ? { expiry_period: input.expiryPeriod, expiry_length: 1 } : {}),
        ...(input.custom ? { custom: input.custom } : {}),
      },
      qty: input.quantity,
      type: input.type,
    }),
  })
}

export async function getTebexBasket(ident: string): Promise<TebexBasket> {
  return tebexFetch<TebexBasket>(`/baskets/${encodeURIComponent(ident)}`)
}

export interface TebexRecurringPayment {
  reference?: string
  next_payment_date?: string
  cancelled_at?: string | null
  cancellation_requested_at?: string | null
  status?: { id?: number; description?: string; active?: number }
  amount?: { amount?: number; period?: string }
}

/** Authoritative state of a recurring payment (tbx-r-…); webhooks reconcile against it. */
export async function getTebexRecurringPayment(reference: string): Promise<TebexRecurringPayment> {
  return tebexFetch<TebexRecurringPayment>(`/recurring-payments/${encodeURIComponent(reference)}`)
}

/** Cancels at the end of the current billing period — the customer keeps what they paid for. */
export async function cancelTebexRecurringPayment(reference: string): Promise<void> {
  await tebexFetch(`/recurring-payments/${encodeURIComponent(reference)}`, { method: "DELETE" })
}

export function isTebexConfigured() {
  return Boolean(process.env.TEBEX_ACCOUNT_ID?.trim() && process.env.TEBEX_PRIVATE_KEY?.trim())
}

export function tebexScriptUrl() {
  return "https://checkout.tebex.io/js/checkout.min.js"
}

export function tebexBrandColor() {
  return "#ff7a00"
}

// Tebex's browser API is loaded from the official script at runtime; the
// server never exposes the private key.
export type TebexCheckoutEvent = { type?: string; ident?: string }

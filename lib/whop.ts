import "server-only"

/**
 * Whop REST API helper. Docs: https://dev.whop.com
 *
 * Whop checkout uses a hosted redirect page, same UX shape as TamPay: the
 * buyer opens `purchaseUrl` (a new tab) and completes payment there.
 * Every order gets its own one-off "checkout configuration" with an
 * inline, single-use plan priced from our own server-side total — the
 * hosted page can never charge a different amount.
 *
 * Unlike TamPay, confirmation here is NOT via polling. Whop's webhook
 * (`app/api/webhooks/whop/route.ts`) is the single source of truth for
 * fulfilment, matching the Polar `order.paid` pattern. The webhook route is
 * currently a stub pending `WHOP_WEBHOOK_SECRET` — see that file.
 */

const WHOP_API_BASE = "https://api.whop.com/api/v1"

export interface WhopCheckoutConfiguration {
  id: string
  purchase_url: string | null
  redirect_url: string | null
}

function getWhopApiKey(): string {
  const key = process.env.WHOP_API_KEY?.trim()
  if (!key) throw new Error("WHOP_API_KEY is not configured.")
  return key
}

/** Whop's error body is `{ error: { type, message } }`, not the flatter `{ message }` / `{ error: string }` shape TamPay uses. */
interface WhopErrorBody {
  error?: { type?: string; message?: string }
}

async function whopFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${WHOP_API_BASE}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${getWhopApiKey()}`,
      "Content-Type": "application/json",
      ...(init.headers as Record<string, string> | undefined),
    },
    cache: "no-store",
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = (data as WhopErrorBody)?.error?.message ?? `Whop request failed with status ${res.status}`
    throw new Error(message)
  }
  return data as T
}

/**
 * Creates a one-off checkout configuration with an inline, single-use
 * one-time plan for the exact order total. `metadata` is copied by Whop
 * onto the resulting payment, which is how the webhook maps a completed
 * payment back to a DistroSource order.
 *
 * Currency is set on the PLAN, not the checkout configuration — the
 * configuration-level `currency` field only affects setup-mode payment
 * method availability and is left unset here. The endpoint path uses an
 * underscore (`/checkout_configurations`), not a hyphen.
 */
export async function createWhopCheckout(input: {
  title: string
  amountUsd: number
  redirectUrl: string
  metadata: Record<string, string | number>
}): Promise<WhopCheckoutConfiguration> {
  return whopFetch<WhopCheckoutConfiguration>("/checkout_configurations", {
    method: "POST",
    body: JSON.stringify({
      mode: "payment",
      redirect_url: input.redirectUrl,
      metadata: input.metadata,
      plan: {
        title: input.title,
        plan_type: "one_time",
        initial_price: input.amountUsd,
        currency: "usd",
      },
    }),
  })
}

export function whopPurchaseUrl(checkout: WhopCheckoutConfiguration): string {
  if (!checkout.purchase_url) throw new Error("Whop did not return a checkout URL.")
  return checkout.purchase_url
}

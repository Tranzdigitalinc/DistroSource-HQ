import "server-only"

import { getAppUrl } from "@/lib/env"

const BASE_URL = "https://checkout.tebex.io/api"

function getConfig() {
  const accountId = process.env.TEBEX_ACCOUNT_ID?.trim()
  const privateKey = process.env.TEBEX_PRIVATE_KEY?.trim()
  if (!accountId || !privateKey) throw new Error("Tebex Checkout is not configured.")
  return { accountId, privateKey }
}

async function tebexFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { privateKey } = getConfig()
  const response = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "X-Tebex-Secret": privateKey,
      ...init.headers,
    },
    cache: "no-store",
  })
  const body = await response.text()
  let parsed: unknown = null
  try { parsed = body ? JSON.parse(body) : null } catch { parsed = null }
  if (!response.ok) {
    const message = parsed && typeof parsed === "object" && "message" in parsed ? String(parsed.message) : "Tebex checkout request failed."
    throw new Error(message)
  }
  return parsed as T
}

export interface TebexBasket {
  ident: string
  url?: string
  complete_url?: string
  cancel_url?: string
  status?: string
}

export async function createTebexBasket(input: {
  orderNumber: string
  email: string
}): Promise<TebexBasket> {
  const { accountId } = getConfig()
  return tebexFetch<TebexBasket>(`/accounts/${encodeURIComponent(accountId)}/baskets`, {
    method: "POST",
    body: JSON.stringify({
      complete_url: `${getAppUrl()}/checkout/success?order=${encodeURIComponent(input.orderNumber)}`,
      cancel_url: `${getAppUrl()}/checkout?payment=cancelled`,
      custom: { distrosource_order_number: input.orderNumber, email: input.email },
    }),
  })
}

export async function addTebexPackage(input: { basketIdent: string; packageId: string; quantity: number; variableData?: Record<string, string> }) {
  return tebexFetch(`/baskets/${encodeURIComponent(input.basketIdent)}/packages`, {
    method: "POST",
    body: JSON.stringify({ package_id: input.packageId, quantity: input.quantity, variable_data: input.variableData }),
  })
}

export async function getTebexBasket(ident: string): Promise<TebexBasket> {
  return tebexFetch<TebexBasket>(`/baskets/${encodeURIComponent(ident)}`)
}

export function isTebexConfigured() {
  return Boolean(process.env.TEBEX_ACCOUNT_ID?.trim() && process.env.TEBEX_PRIVATE_KEY?.trim())
}

export function tebexAccountId() {
  return getConfig().accountId
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

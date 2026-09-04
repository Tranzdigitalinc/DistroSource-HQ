import "server-only"

import { Polar } from "@polar-sh/sdk"
import { getPolarServer, requireEnv } from "@/lib/env"

const required = requireEnv

export function getPolarClient() {
  return new Polar({
    accessToken: required("POLAR_ACCESS_TOKEN"),
    // Defaults to sandbox: a missing/typo'd POLAR_SERVER must never silently
    // move real money.
    server: getPolarServer(),
  })
}

export function getPolarWebhookSecret() {
  return required("POLAR_WEBHOOK_SECRET")
}

export function requiredPolarProductId() {
  return required("POLAR_PRODUCT_ID")
}

export function getPolarWebhookHeaders(request: Request) {
  const headers: Record<string, string> = {}
  request.headers.forEach((value, key) => {
    headers[key] = value
  })
  return headers
}

export function polarAmountInCents(usd: number) {
  return Math.round(usd * 100)
}

export function polarCheckoutUrl(checkout: { url?: string | null }) {
  if (!checkout.url) throw new Error("Polar did not return a checkout URL.")
  return checkout.url
}

import "server-only"

import { Polar } from "@polar-sh/sdk"

function required(name: string) {
  const value = process.env[name]
  if (!value) throw new Error(`${name} is not configured.`)
  return value
}

export function getPolarClient() {
  return new Polar({
    accessToken: required("POLAR_ACCESS_TOKEN"),
    server: process.env.POLAR_SERVER === "production" ? "production" : "sandbox",
  })
}

export function getPolarProductId() {
  return required("POLAR_PRODUCT_ID")
}

export function getPolarWebhookSecret() {
  return required("POLAR_WEBHOOK_SECRET")
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

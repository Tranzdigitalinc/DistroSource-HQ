import "server-only"

import { getCard2CryptoPayoutAddress } from "@/lib/env"

/**
 * Card2Crypto payment gateway helper.
 * Docs: https://documenter.getpostman.com/view/40408788/2sAYHxo4T5
 *
 * Card2Crypto is a hosted gateway: the customer pays by card, Apple Pay,
 * Google Pay or bank transfer on Card2Crypto's licensed provider page and
 * the merchant is settled in USDC on Polygon. The integration has three
 * moving parts:
 *
 *   1. `createCard2CryptoWallet` asks the API for a temporary, encrypted
 *      receiving address that is tied to OUR callback URL. The callback URL
 *      must carry a unique parameter per order; we pass the order number
 *      plus a random token so a callback cannot be forged by guessing.
 *   2. `buildCard2CryptoPaymentUrl` produces the hosted "smart" page URL
 *      the buyer is redirected to (never embedded — Card2Crypto forbids
 *      iframes). The amount is fixed server-side from our own pricing.
 *   3. When the buyer pays, Card2Crypto's bot calls our callback (GET) and
 *      `getCard2CryptoPaymentStatus` re-verifies with the ipn_token before
 *      anything is fulfilled. See lib/card2crypto-settlement.ts.
 */

const WALLET_ENDPOINT = "https://api.card2crypto.org/control/wallet.php"
const HOSTED_PAY_ENDPOINT = "https://pay.card2crypto.org/pay.php"
// The Postman docs list this under card2crypto.org, which serves a 404 page; the JSON lives on the api host.
const STATUS_ENDPOINT = "https://api.card2crypto.org/control/payment-status.php"

/** Lowest minimum across the providers the hosted page can pick (Stripe, Coinbase: USD 2). */
export const CARD2CRYPTO_MIN_USD = 2

export interface Card2CryptoWallet {
  /** URL-encoded, encrypted receiving address — passed as-is to the payment page. */
  addressIn: string
  /** Plain Polygon address of the temporary wallet; the callback echoes this back. */
  polygonAddressIn: string
  /** Token for the payment-status endpoint. Treat as a secret. */
  ipnToken: string
}

export interface Card2CryptoPaymentStatus {
  paid: boolean
  /** USDC received on the order wallet, as reported by Card2Crypto. */
  valueCoin: number | null
  txidOut: string | null
  coin: string | null
}

async function card2cryptoFetch(url: string): Promise<Record<string, unknown>> {
  const res = await fetch(url, { method: "GET", cache: "no-store", headers: { Accept: "application/json" } })
  const text = await res.text()
  let data: Record<string, unknown> = {}
  try {
    data = JSON.parse(text) as Record<string, unknown>
  } catch {
    data = {}
  }
  if (!res.ok) {
    const message = typeof data.error === "string" ? data.error : typeof data.message === "string" ? data.message : `Card2Crypto request failed with status ${res.status}`
    throw new Error(message)
  }
  return data
}

/**
 * Creates the temporary receiving wallet for one order. Card2Crypto returns
 * the same wallet again for an identical callback URL, so the callback must
 * be unique per order (it is: it carries the order number and a token).
 */
export async function createCard2CryptoWallet(input: { callbackUrl: string }): Promise<Card2CryptoWallet> {
  const params = new URLSearchParams({ address: getCard2CryptoPayoutAddress(), callback: input.callbackUrl })
  const data = await card2cryptoFetch(`${WALLET_ENDPOINT}?${params.toString()}`)
  const addressIn = typeof data.address_in === "string" ? data.address_in : ""
  const polygonAddressIn = typeof data.polygon_address_in === "string" ? data.polygon_address_in : ""
  const ipnToken = typeof data.ipn_token === "string" ? data.ipn_token : ""
  if (!addressIn || !polygonAddressIn || !ipnToken) {
    throw new Error("Card2Crypto did not return a receiving wallet. Please try again in a moment.")
  }
  return { addressIn, polygonAddressIn, ipnToken }
}

/**
 * Hosted payment page URL. Card2Crypto picks the best providers for the
 * buyer's region on this page. `address_in` arrives already URL-encoded, so
 * it is decoded once here and re-encoded by URLSearchParams — never twice.
 */
export function buildCard2CryptoPaymentUrl(input: { addressIn: string; amountUsd: number; email: string }): string {
  let address = input.addressIn
  try {
    address = decodeURIComponent(input.addressIn)
  } catch {
    address = input.addressIn
  }
  const params = new URLSearchParams({
    address,
    amount: input.amountUsd.toFixed(2),
    email: input.email,
    currency: "USD",
  })
  return `${HOSTED_PAY_ENDPOINT}?${params.toString()}`
}

/**
 * Re-verifies a payment with Card2Crypto. Their docs ask that this is not
 * polled continuously, so it is only called from the callback handler and
 * from the buyer's explicit "I've paid" check — never on a timer.
 */
export async function getCard2CryptoPaymentStatus(ipnToken: string): Promise<Card2CryptoPaymentStatus> {
  const params = new URLSearchParams({ ipn_token: ipnToken })
  const data = await card2cryptoFetch(`${STATUS_ENDPOINT}?${params.toString()}`)
  const value = data.value_coin
  const parsed = typeof value === "number" ? value : typeof value === "string" ? Number.parseFloat(value) : NaN
  return {
    paid: data.status === "paid",
    valueCoin: Number.isFinite(parsed) ? parsed : null,
    txidOut: typeof data.txid_out === "string" ? data.txid_out : null,
    coin: typeof data.coin === "string" ? data.coin : null,
  }
}

// PayPal Orders v2 REST API helper. Environment is selected via project vars.
// Docs: https://developer.paypal.com/docs/api/orders/v2/

const isSandbox = process.env.PAYPAL_ENVIRONMENT?.toLowerCase() === "sandbox"
const PAYPAL_API_BASE = isSandbox ? "https://api-m.sandbox.paypal.com" : "https://api-m.paypal.com"

interface PaypalTokenResponse {
  access_token: string
  expires_in: number
}

let cachedToken: { value: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.value
  }

  const clientId = isSandbox ? process.env.PAYPAL_SANDBOX_CLIENT_ID : process.env.PAYPAL_CLIENT_ID
  const clientSecret = isSandbox ? process.env.PAYPAL_SANDBOX_CLIENT_SECRET : process.env.PAYPAL_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    const environment = isSandbox ? "sandbox" : "live"
    throw new Error(`PayPal ${environment} credentials are not configured.`)
  }

  const res = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
    cache: "no-store",
  })

  if (!res.ok) {
    const text = await res.text().catch(() => "")
    throw new Error(`Failed to authenticate with PayPal: ${res.status} ${text}`)
  }

  const data = (await res.json()) as PaypalTokenResponse
  cachedToken = { value: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 }
  return data.access_token
}

async function paypalFetch<T>(path: string, init: RequestInit & { requestId?: string } = {}): Promise<T> {
  const token = await getAccessToken()
  const headers: Record<string, string> = {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string> | undefined),
  }
  if (init.requestId) headers["PayPal-Request-Id"] = init.requestId

  const res = await fetch(`${PAYPAL_API_BASE}${path}`, {
    ...init,
    headers,
    cache: "no-store",
  })

  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = (data as { message?: string; details?: { description?: string }[] })?.details?.[0]?.description ?? (data as { message?: string })?.message ?? `PayPal request failed with status ${res.status}`
    throw new Error(message)
  }
  return data as T
}

export interface PaypalOrderResource {
  id: string
  status: string
  purchase_units: {
    payments?: {
      captures?: { id: string; status: string; amount: { value: string; currency_code: string } }[]
    }
  }[]
}

/**
 * Creates a fixed-amount PayPal order. The amount is locked in at this point —
 * PayPal will not let the buyer be charged a different amount at capture time.
 */
export async function createPaypalOrder(input: { amountUsd: number; referenceId: string; requestId: string }): Promise<PaypalOrderResource> {
  return paypalFetch<PaypalOrderResource>("/v2/checkout/orders", {
    method: "POST",
    requestId: input.requestId,
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: input.referenceId,
          amount: { currency_code: "USD", value: input.amountUsd.toFixed(2) },
        },
      ],
    }),
  })
}

export async function capturePaypalOrder(paypalOrderId: string): Promise<PaypalOrderResource> {
  return paypalFetch<PaypalOrderResource>(`/v2/checkout/orders/${paypalOrderId}/capture`, {
    method: "POST",
    requestId: `capture-${paypalOrderId}`,
  })
}

export async function refundPaypalCapture(captureId: string, reason: string): Promise<void> {
  await paypalFetch(`/v2/payments/captures/${captureId}/refund`, {
    method: "POST",
    requestId: `refund-${captureId}`,
    body: JSON.stringify({ note_to_payer: reason.slice(0, 255) }),
  })
}

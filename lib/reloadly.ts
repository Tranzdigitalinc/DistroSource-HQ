export type ReloadlyProduct = {
  id: number
  productName: string
  brand?: { brandId: number; brandName: string }
  category?: { id: number; name: string }
  country?: { isoName?: string; name?: string }
  currency?: { code?: string; symbol?: string }
  images?: { url: string }[]
  logoUrls?: string[]
  imageUrls?: string[]
  global?: boolean
  status?: string
  supportsPreOrder?: boolean
  denominationType?: string
  recipientCurrencyCode?: string
  senderCurrencyCode?: string
  minRecipientDenomination?: number
  maxRecipientDenomination?: number
  fixedRecipientDenominations?: number[]
  fixedRecipientToSenderDenominationsMap?: Record<string, number>
  senderFeePercentage?: number
  recipientCurrencyToSenderCurrencyExchangeRate?: number
  redeemInstruction?: { concise?: string; verbose?: string }
  additionalRequirements?: Record<string, unknown>
  metadata?: Record<string, unknown> | null
  fixedSenderDenominations?: number[]
  minSenderDenomination?: number
  maxSenderDenomination?: number
  senderFee?: number
  discountPercentage?: number
}

function parseProducts(value: unknown): ReloadlyProduct[] {
  const items = Array.isArray(value) ? value : (value as { content?: unknown[] })?.content ?? []
  return items.flatMap((item) => {
    const product = item as Partial<ReloadlyProduct> & { productId?: number }
    const id = product.id ?? product.productId
    if (typeof id !== "number" || typeof product.productName !== "string") return []
    return [{ ...product, id, images: product.images ?? product.imageUrls?.map((url) => ({ url })) } as ReloadlyProduct]
  })
}

type ReloadlyConnection = { token: string; apiBaseUrl: string }

async function getAccessToken(): Promise<ReloadlyConnection> {
  const clientId = process.env.RELOADLY_CLIENT_ID?.trim()
  const clientSecret = process.env.RELOADLY_CLIENT_SECRET?.trim()
  if (!clientId || !clientSecret) throw new Error("Reloadly credentials are not configured")

  const environments = [
    { audience: "https://giftcards.reloadly.com", apiBaseUrl: "https://giftcards.reloadly.com" },
    { audience: "https://giftcards-sandbox.reloadly.com", apiBaseUrl: "https://giftcards-sandbox.reloadly.com" },
  ]
  let lastStatus = 401

  for (const environment of environments) {
    const response = await fetch("https://auth.reloadly.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
        audience: environment.audience,
      }),
      cache: "no-store",
    })
    if (!response.ok) {
      lastStatus = response.status
      continue
    }
    const data = (await response.json()) as { access_token?: string }
    if (data.access_token) return { token: data.access_token, apiBaseUrl: environment.apiBaseUrl }
  }

  throw new Error(`Reloadly authentication failed (${lastStatus}); verify these are matching Live or Sandbox credentials`)
}

export async function fetchAllReloadlyProducts() {
  const { token, apiBaseUrl } = await getAccessToken()
  const products: ReloadlyProduct[] = []
  let page = 1
  const size = 100

  while (true) {
    const response = await fetch(`${apiBaseUrl}/products?page=${page}&size=${size}`, {
      headers: { Accept: "application/com.reloadly.giftcards-v1+json", Authorization: `Bearer ${token}` },
      cache: "no-store",
    })
    if (!response.ok) throw new Error(`Reloadly products request failed (${response.status})`)
    const payload = (await response.json()) as unknown
    const parsed = parseProducts(payload)
    if (!parsed.length && page === 1) throw new Error("Reloadly returned an unexpected product response")
    products.push(...parsed)
    if (parsed.length < size) break
    page += 1
    if (page > 1000) throw new Error("Reloadly pagination exceeded the safety limit")
  }

  return products
}

export function getProductImage(product: ReloadlyProduct) {
  return product.images?.[0]?.url ?? product.logoUrls?.[0] ?? null
}

export function getDenominations(product: ReloadlyProduct) {
  const fixed = product.fixedRecipientDenominations?.length
    ? product.fixedRecipientDenominations
    : product.fixedSenderDenominations ?? []
  if (fixed.length) return fixed
  if (product.minSenderDenomination != null && product.maxSenderDenomination != null) {
    return [product.minSenderDenomination, product.maxSenderDenomination]
  }
  return []
}

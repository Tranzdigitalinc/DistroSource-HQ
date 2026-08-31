export type ReloadlyProduct = {
  id: number
  productName: string
  brand?: { brandId: number; brandName: string }
  category?: { id: number; name: string }
  country?: { isoName?: string; name?: string }
  currency?: { code?: string; symbol?: string }
  images?: { url: string }[]
  logoUrls?: string[]
  fixedRecipientDenominations?: number[]
  fixedSenderDenominations?: number[]
  minSenderDenomination?: number
  maxSenderDenomination?: number
  senderFee?: number
  discountPercentage?: number
}

function parseProducts(value: unknown): ReloadlyProduct[] {
  const items = Array.isArray(value) ? value : (value as { content?: unknown[] })?.content ?? []
  return items.filter((item): item is ReloadlyProduct => {
    const product = item as Partial<ReloadlyProduct>
    return typeof product.id === "number" && typeof product.productName === "string"
  })
}

async function getAccessToken() {
  const clientId = process.env.RELOADLY_CLIENT_ID
  const clientSecret = process.env.RELOADLY_CLIENT_SECRET
  if (!clientId || !clientSecret) throw new Error("Reloadly credentials are not configured")

  const response = await fetch("https://auth.reloadly.com/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "client_credentials",
      audience: "https://giftcards.reloadly.com",
    }),
    cache: "no-store",
  })
  if (!response.ok) throw new Error(`Reloadly authentication failed (${response.status})`)
  const data = (await response.json()) as { access_token?: string }
  if (!data.access_token) throw new Error("Reloadly did not return an access token")
  return data.access_token
}

export async function fetchAllReloadlyProducts() {
  const token = await getAccessToken()
  const products: ReloadlyProduct[] = []
  let page = 1
  const size = 100

  while (true) {
    const response = await fetch(`https://giftcards.reloadly.com/products?page=${page}&size=${size}`, {
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

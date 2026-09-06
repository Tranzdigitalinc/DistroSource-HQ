import type { GamingProduct } from "@/lib/gaming/types"

/**
 * Tebex is the payment infrastructure for the Gaming department, and only
 * for the Gaming department. Regular DistroSource products continue to go
 * through the existing checkout; the two are never mixed in one transaction.
 *
 * Nothing here talks to the Tebex API. A Gaming purchase is a redirect to a
 * Tebex-hosted package page, so there is no basket to reconcile and no
 * payment state held in this application.
 */

/** The placeholder host shipped with the seed catalogue. */
const PLACEHOLDER_HOST = "example.tebex.io"

/**
 * True once a product points at a real Tebex store rather than the seeded
 * placeholder. The Buy button uses this to refuse to send a customer to a
 * URL that cannot take their money.
 */
export function isTebexConfigured(product: Pick<GamingProduct, "tebexPackageUrl" | "tebexPackageId">): boolean {
  const url = product.tebexPackageUrl?.trim()
  if (!url) return false
  try {
    const parsed = new URL(url)
    if (parsed.hostname === PLACEHOLDER_HOST) return false
    // Tebex stores are always *.tebex.io unless a custom domain is set up;
    // accept both rather than hard-coding one deployment's choice.
    return parsed.protocol === "https:"
  } catch {
    return false
  }
}

export function getTebexCheckoutUrl(product: Pick<GamingProduct, "tebexPackageUrl">): string {
  return product.tebexPackageUrl
}

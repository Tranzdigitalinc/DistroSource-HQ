/**
 * Resolving Gaming product imagery.
 *
 * `product.images` holds real captures of the delivered files. When a product
 * has any, they are what the storefront shows — the illustrated `art` scenes
 * are the fallback for products that have not been shot yet, not a permanent
 * fixture.
 *
 * Three reference forms are accepted so adding images does not require
 * deciding where to host them first:
 *
 *   "/gaming/police-01.png"          a file in /public, served directly
 *   "https://cdn.example.com/x.jpg"  any external URL, proxied and cached
 *   "catalog/images/x.png"           a Vercel Blob pathname
 *
 * External URLs go through `/api/external-image`, which validates the
 * content type and caches the response, so no `next.config` remote pattern
 * has to be added for each new host.
 */

export function resolveGamingImage(src: string): string {
  const trimmed = src.trim()
  if (!trimmed) return ""
  // Already a local path or an app route — pass through untouched.
  if (trimmed.startsWith("/")) return trimmed
  if (/^https?:\/\//i.test(trimmed)) return `/api/external-image?url=${encodeURIComponent(trimmed)}`
  // Anything else is treated as a Blob pathname.
  return `/api/blob-image?pathname=${encodeURIComponent(trimmed)}`
}

/** True when a product has real captures and should not render illustrations. */
export function hasRealImages(images: string[]): boolean {
  return images.some((src) => src.trim().length > 0)
}

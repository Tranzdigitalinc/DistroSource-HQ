// Lightweight user-agent parsing — no external dependency. Good enough for
// admin-facing device/browser/OS breakdowns; not meant to be exhaustive.

export function parseDeviceType(userAgent: string): "mobile" | "tablet" | "desktop" {
  const ua = userAgent.toLowerCase()
  if (/ipad|tablet(?!.*mobile)/.test(ua)) return "tablet"
  if (/mobi|iphone|ipod|android.*mobile|windows phone/.test(ua)) return "mobile"
  return "desktop"
}

export function parseBrowser(userAgent: string): string {
  const ua = userAgent
  if (/edg\//i.test(ua)) return "Edge"
  if (/opr\/|opera/i.test(ua)) return "Opera"
  if (/samsungbrowser/i.test(ua)) return "Samsung Internet"
  if (/firefox\//i.test(ua)) return "Firefox"
  if (/crios\//i.test(ua)) return "Chrome (iOS)"
  if (/chrome\//i.test(ua) && !/chromium/i.test(ua)) return "Chrome"
  if (/fxios\//i.test(ua)) return "Firefox (iOS)"
  if (/safari\//i.test(ua) && /version\//i.test(ua)) return "Safari"
  if (/msie |trident\//i.test(ua)) return "Internet Explorer"
  return "Unknown"
}

export function parseOs(userAgent: string): string {
  const ua = userAgent
  if (/windows nt/i.test(ua)) return "Windows"
  if (/mac os x/i.test(ua) && !/iphone|ipad|ipod/i.test(ua)) return "macOS"
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS"
  if (/android/i.test(ua)) return "Android"
  if (/cros/i.test(ua)) return "Chrome OS"
  if (/linux/i.test(ua)) return "Linux"
  return "Unknown"
}

export function countryCodeToFlag(code: string | null | undefined): string {
  if (!code || code.length !== 2) return ""
  const upper = code.toUpperCase()
  const codePoints = [...upper].map((char) => 127397 + char.charCodeAt(0))
  return String.fromCodePoint(...codePoints)
}

export function countryCodeToName(code: string | null | undefined): string {
  if (!code) return "Unknown"
  try {
    const displayNames = new Intl.DisplayNames(["en"], { type: "region" })
    return displayNames.of(code.toUpperCase()) ?? code
  } catch {
    return code
  }
}

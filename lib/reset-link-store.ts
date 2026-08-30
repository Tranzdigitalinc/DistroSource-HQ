// Demo-only in-memory store for password reset links.
// RedeemCove has no email provider configured, so instead of sending a real
// email, the reset link is captured here and shown directly in the UI.
// This is a documented simplification and is not suitable for production use.
const store = new Map<string, { url: string; expiresAt: number }>()

export function saveResetLink(email: string, url: string) {
  store.set(email.toLowerCase(), { url, expiresAt: Date.now() + 1000 * 60 * 15 })
}

export function getResetLink(email: string): string | null {
  const entry = store.get(email.toLowerCase())
  if (!entry) return null
  if (entry.expiresAt < Date.now()) {
    store.delete(email.toLowerCase())
    return null
  }
  return entry.url
}

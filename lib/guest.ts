import { cookies } from "next/headers"
import { randomUUID } from "crypto"

const GUEST_COOKIE = "guest_id"
const GUEST_COOKIE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days

/**
 * Read-only lookup of the current guest identity. Safe to call from Server
 * Components. Returns null if the visitor has no guest cart yet.
 */
export async function getGuestId() {
  const store = await cookies()
  return store.get(GUEST_COOKIE)?.value ?? null
}

/**
 * Reads the guest identity, creating one if it doesn't exist yet. Sets a
 * cookie, so this may only be called from Server Actions or Route Handlers.
 */
export async function getOrCreateGuestId() {
  const store = await cookies()
  const existing = store.get(GUEST_COOKIE)?.value
  if (existing) return existing

  const id = `guest_${randomUUID()}`
  store.set(GUEST_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: GUEST_COOKIE_MAX_AGE,
    path: "/",
  })
  return id
}

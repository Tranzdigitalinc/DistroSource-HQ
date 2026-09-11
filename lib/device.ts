import "server-only"
import { cookies } from "next/headers"
import { randomUUID } from "crypto"

/**
 * First-party, opaque device/session continuity identifier.
 *
 * This is NOT sent to TamPay, Lahza, or any payment provider — their
 * documented API (https://tampay.io/docapi) has no field for a merchant
 * device/session identifier. It exists purely for DistroSource's own
 * internal fraud/risk observability (see lib/payment-risk.ts), so we can
 * tell a genuinely returning browser from a brand-new one across visits.
 *
 * Deliberately NOT a fingerprint: it is a random UUID that carries no
 * information about the device's hardware, fonts, canvas/WebGL rendering,
 * or audio stack. It only proves "this is the same cookie jar as before,"
 * nothing more.
 */
const DEVICE_COOKIE = "distrosource_device_id"
const DEVICE_COOKIE_MAX_AGE = 60 * 60 * 24 * 400 // ~400 days (Chrome's own cap on cookie lifetime)

/**
 * Read-only lookup. Safe to call from Server Components — never creates
 * the cookie, only reads it if already set.
 */
export async function getDeviceId(): Promise<string | null> {
  const store = await cookies()
  return store.get(DEVICE_COOKIE)?.value ?? null
}

/**
 * Reads the device id, creating one if this is the first time we've seen
 * this browser. Sets a cookie, so this may only be called from Server
 * Actions or Route Handlers (same constraint as lib/guest.ts).
 *
 * Returns both the id and whether it was already present, since "was this
 * device already known" is itself a useful truthful signal.
 */
export async function getOrCreateDeviceId(): Promise<{ deviceId: string; wasKnown: boolean }> {
  const store = await cookies()
  const existing = store.get(DEVICE_COOKIE)?.value
  if (existing) return { deviceId: existing, wasKnown: true }

  const id = randomUUID()
  store.set(DEVICE_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: DEVICE_COOKIE_MAX_AGE,
    path: "/",
  })
  return { deviceId: id, wasKnown: false }
}

import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { getGuestId, getOrCreateGuestId } from "@/lib/guest"

export async function getSession() {
  return auth.api.getSession({ headers: await headers() })
}

export async function getUserId() {
  const session = await getSession()
  if (!session?.user) throw new Error("Unauthorized")
  return session.user.id
}

export async function getOptionalUserId() {
  const session = await getSession()
  return session?.user?.id ?? null
}

/**
 * Identifies who owns a cart or order — the signed-in user, or a guest
 * cookie identity. Creates the guest cookie if needed, so this may only be
 * called from Server Actions or Route Handlers.
 */
export async function getOwnerId() {
  const session = await getSession()
  if (session?.user) return session.user.id
  return getOrCreateGuestId()
}

/**
 * Read-only variant of getOwnerId, safe to call from Server Components.
 * Returns null if the visitor is signed out and has no guest cart yet.
 */
export async function getOptionalOwnerId() {
  const session = await getSession()
  if (session?.user) return session.user.id
  return getGuestId()
}

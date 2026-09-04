"use server"

import { randomUUID } from "node:crypto"
import { and, eq, inArray, isNull, lt, or } from "drizzle-orm"
import { db } from "@/lib/db"
import { abandonedCarts, notificationPreferences, productLicenses } from "@/lib/db/schema"
import { getOptionalOwnerId, getOwnerId } from "@/lib/session"
import { addToCart } from "@/lib/actions/cart"
import { sendAbandonedCartEmail, sendAbandonedCartReminderEmail } from "@/lib/email"
import { getAuthBaseUrl } from "@/lib/env"

const REMINDER_DELAY_HOURS = 24

interface AbandonedCartItem {
  productId: number
  licenseId: number
  quantity: number
}

function getRecoveryBaseUrl() {
  return getAuthBaseUrl()
}

export async function saveAbandonedCart(input: { email: string; subtotalUsd: number; items: unknown[] }) {
  const email = input.email.trim().toLowerCase()
  if (!/^([^\s@]+)@([^\s@]+)\.([^\s@]+)$/.test(email)) throw new Error("Enter a valid email address.")
  if (!Number.isFinite(input.subtotalUsd) || input.subtotalUsd <= 0 || input.items.length === 0) throw new Error("Your cart is empty.")
  const userId = await getOptionalOwnerId()
  const recoveryToken = randomUUID()
  await db.insert(abandonedCarts).values({ userId, email, subtotalUsd: input.subtotalUsd.toFixed(2), cartSnapshot: input.items, recoveryToken })
  // Best-effort only: a recovery email failure (e.g. email provider not
  // configured) must never block the checkout flow that triggered this save.
  try {
    await sendAbandonedCartEmail(email, `${getRecoveryBaseUrl()}/recover-cart/${recoveryToken}`, input.subtotalUsd)
  } catch (error) {
    console.error("[v0] Failed to send abandoned cart email:", error)
  }
  return { recoveryToken }
}

export async function restoreAbandonedCart(token: string) {
  const ownerId = await getOwnerId()
  const [cart] = await db
    .select()
    .from(abandonedCarts)
    .where(and(eq(abandonedCarts.recoveryToken, token), eq(abandonedCarts.status, "open")))
    .limit(1)

  if (!cart) return { success: false, reason: "not_found" as const }

  const snapshot = Array.isArray(cart.cartSnapshot) ? (cart.cartSnapshot as AbandonedCartItem[]) : []
  const restorable = snapshot.filter((item) => Number.isInteger(item.productId) && Number.isInteger(item.licenseId))
  if (restorable.length === 0) return { success: false, reason: "empty_snapshot" as const }

  const licenseIds = restorable.map((item) => item.licenseId)
  const availableLicenses = await db.select({ id: productLicenses.id }).from(productLicenses).where(inArray(productLicenses.id, licenseIds))
  const availableIds = new Set(availableLicenses.map((l) => l.id))

  let restoredCount = 0
  for (const item of restorable) {
    if (!availableIds.has(item.licenseId)) continue
    await addToCart(item.productId, item.licenseId, item.quantity)
    restoredCount += 1
  }

  await db
    .update(abandonedCarts)
    .set({ status: "recovered", recoveredAt: new Date(), userId: ownerId })
    .where(eq(abandonedCarts.id, cart.id))

  return { success: restoredCount > 0, reason: restoredCount > 0 ? ("restored" as const) : ("unavailable" as const) }
}


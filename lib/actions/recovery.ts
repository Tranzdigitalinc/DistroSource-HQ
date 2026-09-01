"use server"

import { randomUUID } from "node:crypto"
import { db } from "@/lib/db"
import { abandonedCarts } from "@/lib/db/schema"
import { getOptionalOwnerId } from "@/lib/session"
import { sendAbandonedCartEmail } from "@/lib/email"

export async function saveAbandonedCart(input: { email: string; subtotalUsd: number; items: unknown[] }) {
  const email = input.email.trim().toLowerCase()
  if (!/^([^\s@]+)@([^\s@]+)\.([^\s@]+)$/.test(email)) throw new Error("Enter a valid email address.")
  if (!Number.isFinite(input.subtotalUsd) || input.subtotalUsd <= 0 || input.items.length === 0) throw new Error("Your cart is empty.")
  const userId = await getOptionalOwnerId()
  const recoveryToken = randomUUID()
  await db.insert(abandonedCarts).values({ userId, email, subtotalUsd: input.subtotalUsd.toFixed(2), cartSnapshot: input.items, recoveryToken })
  const baseUrl = process.env.BETTER_AUTH_URL ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  await sendAbandonedCartEmail(email, `${baseUrl}/recover-cart/${recoveryToken}`, input.subtotalUsd)
  return { recoveryToken }
}

"use server"

import { db } from "@/lib/db"
import { newsletterSubscribers } from "@/lib/db/schema"
import { sql } from "drizzle-orm"
import { RATE_LIMITS, enforceRateLimit } from "@/lib/rate-limit"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function subscribeToNewsletter(email: string) {
  await enforceRateLimit("newsletter", RATE_LIMITS.newsletter)

  const trimmed = email.trim().toLowerCase()

  if (!EMAIL_PATTERN.test(trimmed)) {
    throw new Error("Enter a valid email address.")
  }

  await db
    .insert(newsletterSubscribers)
    .values({ email: trimmed })
    .onConflictDoUpdate({
      target: newsletterSubscribers.email,
      set: { email: sql`excluded.email` },
    })

  return { success: true }
}

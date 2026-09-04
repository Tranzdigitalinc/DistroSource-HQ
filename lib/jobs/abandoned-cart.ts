import "server-only"

/**
 * Abandoned-cart reminder job.
 *
 * Deliberately outside `lib/actions/recovery.ts`: it was previously an export
 * of a `"use server"` module, which makes it a network-reachable endpoint that
 * triggers a bulk email send. Its only caller is the CRON_SECRET-authenticated
 * route at app/api/cron/abandoned-cart-reminders/route.ts.
 */

import { and, eq, isNull, lt } from "drizzle-orm"
import { db } from "@/lib/db"
import { abandonedCarts, notificationPreferences } from "@/lib/db/schema"
import { sendAbandonedCartReminderEmail } from "@/lib/email"
import { getAuthBaseUrl } from "@/lib/env"

const REMINDER_DELAY_HOURS = 24

function getRecoveryBaseUrl() {
  return getAuthBaseUrl()
}

export async function sendAbandonedCartReminders() {
  const cutoff = new Date(Date.now() - REMINDER_DELAY_HOURS * 60 * 60 * 1000)
  const eligibleCarts = await db
    .select()
    .from(abandonedCarts)
    .where(and(eq(abandonedCarts.status, "open"), lt(abandonedCarts.createdAt, cutoff), isNull(abandonedCarts.lastRemindedAt)))
    .limit(100)

  let sentCount = 0
  let skippedCount = 0

  for (const cart of eligibleCarts) {
    if (cart.userId) {
      const [prefs] = await db.select().from(notificationPreferences).where(eq(notificationPreferences.userId, cart.userId)).limit(1)
      if (prefs && !prefs.promotions) {
        skippedCount += 1
        continue
      }
    }

    const sent = await sendAbandonedCartReminderEmail(
      cart.email,
      `${getRecoveryBaseUrl()}/recover-cart/${cart.recoveryToken}`,
      Number.parseFloat(cart.subtotalUsd),
    )
    await db.update(abandonedCarts).set({ lastRemindedAt: new Date() }).where(eq(abandonedCarts.id, cart.id))
    if (sent) sentCount += 1
  }

  return { sentCount, skippedCount, eligible: eligibleCarts.length }
}

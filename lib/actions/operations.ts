"use server"

import { and, desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { operationEvents } from "@/lib/db/schema"
import { isRetryableEvent } from "@/lib/retryable-events"
import { isAdminEmail } from "@/lib/admin-emails"

export async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || !isAdminEmail(session.user.email)) throw new Error("Unauthorized")
  return session.user.id
}

export async function getOperationEvents() {
  await requireAdmin()
  return db.select().from(operationEvents).orderBy(desc(operationEvents.createdAt)).limit(50)
}

export async function getOperationEventsFiltered(filters: { status?: string; eventType?: string; page?: number }) {
  await requireAdmin()
  const pageSize = 25
  const page = Math.max(1, filters.page ?? 1)
  const conditions = []
  if (filters.status) conditions.push(eq(operationEvents.status, filters.status))
  if (filters.eventType) conditions.push(eq(operationEvents.eventType, filters.eventType))
  const where = conditions.length ? and(...conditions) : undefined

  const [rows, eventTypes] = await Promise.all([
    db.select().from(operationEvents).where(where).orderBy(desc(operationEvents.createdAt)).limit(pageSize).offset((page - 1) * pageSize),
    db.selectDistinct({ eventType: operationEvents.eventType }).from(operationEvents).orderBy(operationEvents.eventType),
  ])

  return { rows, eventTypes: eventTypes.map((r) => r.eventType), page, pageSize }
}

export async function resolveOperationEvent(id: number) {
  const userId = await requireAdmin()
  await db.update(operationEvents).set({ status: "resolved", resolvedAt: new Date(), createdBy: userId }).where(and(eq(operationEvents.id, id), eq(operationEvents.status, "open")))
  revalidatePath("/admin")
}

export async function getReloadlySyncHealth() {
  await requireAdmin()
  const [lastSuccess] = await db
    .select()
    .from(operationEvents)
    .where(eq(operationEvents.eventType, "reloadly_sync_completed"))
    .orderBy(desc(operationEvents.createdAt))
    .limit(1)
  const [lastFailure] = await db
    .select()
    .from(operationEvents)
    .where(and(eq(operationEvents.eventType, "reloadly_sync_failed"), eq(operationEvents.status, "open")))
    .orderBy(desc(operationEvents.createdAt))
    .limit(1)
  return { lastSuccess: lastSuccess ?? null, lastFailure: lastFailure ?? null }
}

export async function createOperationEvent(input: { eventType: string; entityType: string; entityId?: string; payload?: unknown }) {
  const userId = await requireAdmin()
  await db.insert(operationEvents).values({ eventType: input.eventType, entityType: input.entityType, entityId: input.entityId, payload: input.payload, createdBy: userId })
  revalidatePath("/admin")
}

export async function retryOperationEvent(id: number) {
  const userId = await requireAdmin()
  const [event] = await db.select().from(operationEvents).where(and(eq(operationEvents.id, id), eq(operationEvents.status, "open"))).limit(1)
  if (!event) throw new Error("Event not found or already resolved.")
  if (!isRetryableEvent(event.eventType)) throw new Error("This event type cannot be retried.")

  const payload = (event.payload as Record<string, unknown>) ?? {}
  const retryCount = typeof payload.retryCount === "number" ? payload.retryCount + 1 : 1

  let succeeded = false
  let failureReason = ""

  if (event.eventType === "confirmation_email_failed") {
    const { resendOrderConfirmationEmailForAdmin } = await import("@/lib/actions/account")
    const orderNumber = payload.orderNumber as string | undefined
    if (!orderNumber) throw new Error("Missing order number on this event.")
    try {
      await resendOrderConfirmationEmailForAdmin(orderNumber)
      succeeded = true
    } catch (error) {
      failureReason = error instanceof Error ? error.message : "Unknown error"
    }
  }

  if (succeeded) {
    // resendOrderConfirmationEmail already resolves the matching event; this
    // second update is a no-op if that already happened, and a safety net
    // (with the retry count recorded) if it didn't for any reason.
    await db
      .update(operationEvents)
      .set({ status: "resolved", resolvedAt: new Date(), payload: { ...payload, retryCount } })
      .where(and(eq(operationEvents.id, id), eq(operationEvents.status, "open")))
  } else {
    await db
      .update(operationEvents)
      .set({ payload: { ...payload, retryCount, lastRetryError: failureReason, lastRetryAt: new Date().toISOString(), lastRetryBy: userId } })
      .where(eq(operationEvents.id, id))
  }

  revalidatePath("/admin")
  revalidatePath("/admin/audit")
  return { success: succeeded, failureReason }
}

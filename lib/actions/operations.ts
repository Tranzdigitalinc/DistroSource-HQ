"use server"

import { and, desc, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { operationEvents } from "@/lib/db/schema"

const ADMIN_EMAIL = "info@corevalleyjo.com"

async function requireAdmin() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user || session.user.email.trim().toLowerCase() !== ADMIN_EMAIL) throw new Error("Unauthorized")
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

export async function createOperationEvent(input: { eventType: string; entityType: string; entityId?: string; payload?: unknown }) {
  const userId = await requireAdmin()
  await db.insert(operationEvents).values({ eventType: input.eventType, entityType: input.entityType, entityId: input.entityId, payload: input.payload, createdBy: userId })
  revalidatePath("/admin")
}

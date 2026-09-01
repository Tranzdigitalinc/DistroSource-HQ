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

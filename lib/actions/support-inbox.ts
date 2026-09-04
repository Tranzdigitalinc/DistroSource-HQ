"use server"

import { and, asc, desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { supportConversations, supportMessages } from "@/lib/db/schema"
import { requireAdmin } from "@/lib/actions/operations"
import { sendSupportReplyEmail } from "@/lib/email"
import { auth } from "@/lib/auth"

export async function getSupportConversations(filters: { status?: "open" | "closed"; page?: number } = {}) {
  await requireAdmin()
  const pageSize = 25
  const page = Math.max(1, filters.page ?? 1)
  const where = filters.status ? eq(supportConversations.status, filters.status) : undefined

  const rows = await db
    .select()
    .from(supportConversations)
    .where(where)
    .orderBy(desc(supportConversations.lastMessageAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize)

  return { rows, page, pageSize }
}

export async function getSupportConversation(id: number) {
  await requireAdmin()
  const [conversation] = await db.select().from(supportConversations).where(eq(supportConversations.id, id)).limit(1)
  if (!conversation) throw new Error("Conversation not found.")

  const messages = await db
    .select()
    .from(supportMessages)
    .where(eq(supportMessages.conversationId, id))
    .orderBy(asc(supportMessages.createdAt))

  return { conversation, messages }
}

export async function replyToSupportConversation(conversationId: number, body: string) {
  const adminUserId = await requireAdmin()

  const text = body.trim()
  if (!text) throw new Error("Enter a reply before sending.")

  const [conversation] = await db.select().from(supportConversations).where(eq(supportConversations.id, conversationId)).limit(1)
  if (!conversation) throw new Error("Conversation not found.")

  const session = await auth.api.getSession({ headers: await headers() })
  const agentName = session?.user?.name?.split(" ")[0]

  const resendEmailId = await sendSupportReplyEmail(
    conversation.customerEmail,
    conversation.id,
    conversation.subject,
    text,
    agentName,
  )

  await db.transaction(async (tx) => {
    await tx.insert(supportMessages).values({
      conversationId,
      direction: "outbound",
      body: text,
      fromEmail: "support@distrosource.com",
      adminUserId,
      resendEmailId,
    })
    await tx.update(supportConversations).set({ lastMessageAt: new Date() }).where(eq(supportConversations.id, conversationId))
  })

  revalidatePath(`/admin/support/${conversationId}`)
  revalidatePath("/admin/support")
}

export async function setSupportConversationStatus(conversationId: number, status: "open" | "closed") {
  await requireAdmin()
  await db.update(supportConversations).set({ status }).where(and(eq(supportConversations.id, conversationId)))
  revalidatePath(`/admin/support/${conversationId}`)
  revalidatePath("/admin/support")
}

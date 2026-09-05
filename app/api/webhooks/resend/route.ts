import { NextResponse } from "next/server"
import { Resend } from "resend"
import { and, eq } from "drizzle-orm"
import { db } from "@/lib/db"
import { supportConversations, supportMessages } from "@/lib/db/schema"

// Constructed lazily: the Resend SDK throws when the key is absent, and a
// module-scope client made that throw at import time — which is when Next
// collects route config, so any build without RESEND_API_KEY failed here
// rather than at the request that actually needs mail. Mirrors the
// getPolarClient() factory in lib/polar.ts.
function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}

// Inbound mail lands on a subdomain delegated entirely to Resend
// (mail.distrosource.com), separate from the root domain's existing mail
// provider. A reply to a support thread is addressed to
// conversation+<id>@mail.distrosource.com (see conversationReplyTo in
// lib/email.ts) — that id is how we thread a reply onto the right
// conversation instead of creating a new one.
function parseConversationId(recipients: string[]) {
  for (const address of recipients) {
    const match = address.match(/conversation\+(\d+)@/i)
    if (match) return Number(match[1])
  }
  return null
}

function extractName(fromHeader: string) {
  const match = fromHeader.match(/^"?([^"<]+)"?\s*<[^>]+>$/)
  return match ? match[1].trim() : null
}

function extractEmail(fromHeader: string) {
  const match = fromHeader.match(/<([^>]+)>/)
  return (match ? match[1] : fromHeader).trim().toLowerCase()
}

export async function POST(request: Request) {
  const payload = await request.text()
  const webhookSecret = process.env.RESEND_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error("[v0] RESEND_WEBHOOK_SECRET is not configured")
    return NextResponse.json({ error: "Webhook not configured" }, { status: 500 })
  }

  const svixId = request.headers.get("svix-id")
  const svixTimestamp = request.headers.get("svix-timestamp")
  const svixSignature = request.headers.get("svix-signature")
  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: "Missing webhook signature headers" }, { status: 400 })
  }

  let event: ReturnType<Resend["webhooks"]["verify"]>
  try {
    event = getResend().webhooks.verify({
      payload,
      headers: { id: svixId, timestamp: svixTimestamp, signature: svixSignature },
      webhookSecret,
    })
  } catch (error) {
    console.error("[v0] Resend webhook verification failed", error)
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 401 })
  }

  if (event.type !== "email.received") {
    return NextResponse.json({ received: true })
  }

  const { email_id, from, to, subject } = event.data
  const fromEmail = extractEmail(from)
  const fromName = extractName(from)

  // Webhook payload has metadata only — fetch the body separately.
  const { data: email, error: fetchError } = await getResend().emails.receiving.get(email_id)
  if (fetchError || !email) {
    console.error("[v0] Failed to fetch received email body", fetchError)
    return NextResponse.json({ error: "Could not load email content" }, { status: 502 })
  }
  const body = email.text ?? "(No plain-text content)"

  const conversationId = parseConversationId(to)

  if (conversationId) {
    const [conversation] = await db
      .select({ id: supportConversations.id })
      .from(supportConversations)
      .where(eq(supportConversations.id, conversationId))
      .limit(1)

    if (conversation) {
      await db.transaction(async (tx) => {
        await tx.insert(supportMessages).values({
          conversationId: conversation.id,
          direction: "inbound",
          body,
          fromEmail,
          resendEmailId: email_id,
        })
        await tx
          .update(supportConversations)
          .set({ status: "open", lastMessageAt: new Date() })
          .where(eq(supportConversations.id, conversation.id))
      })
      return NextResponse.json({ received: true, conversationId: conversation.id })
    }
    // Fall through to create a fresh conversation if the referenced thread
    // no longer exists (e.g. deleted) — the message shouldn't be dropped.
  }

  // No conversation id in the recipient — this is a fresh inbound email to
  // support@distrosource.com (or a reply that mangled the Reply-To). Try to
  // attach it to the customer's most recent open conversation before
  // starting a new one, so back-and-forth without conversation-id threading
  // still lands in one thread.
  const [existingOpen] = await db
    .select({ id: supportConversations.id })
    .from(supportConversations)
    .where(and(eq(supportConversations.customerEmail, fromEmail), eq(supportConversations.status, "open")))
    .orderBy(supportConversations.lastMessageAt)
    .limit(1)

  const targetConversationId = existingOpen
    ? existingOpen.id
    : await db
        .insert(supportConversations)
        .values({ subject, customerEmail: fromEmail, customerName: fromName })
        .returning({ id: supportConversations.id })
        .then((rows) => rows[0].id)

  await db.transaction(async (tx) => {
    await tx.insert(supportMessages).values({
      conversationId: targetConversationId,
      direction: "inbound",
      body,
      fromEmail,
      resendEmailId: email_id,
    })
    await tx
      .update(supportConversations)
      .set({ status: "open", lastMessageAt: new Date() })
      .where(eq(supportConversations.id, targetConversationId))
  })

  return NextResponse.json({ received: true, conversationId: targetConversationId })
}

export const dynamic = "force-dynamic"

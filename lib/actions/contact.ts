"use server"

import { Resend } from "resend"
import { RATE_LIMITS, enforceRateLimit } from "@/lib/rate-limit"
import { db } from "@/lib/db"
import { supportConversations, supportMessages } from "@/lib/db/schema"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

// Constructed lazily: the Resend SDK throws when the key is absent, and a
// module-scope client made that throw at import time — which is when Next
// collects route config, so any build without RESEND_API_KEY failed here
// rather than at the request that actually needs mail. Mirrors the
// getPolarClient() factory in lib/polar.ts.
function getResend() {
  return new Resend(process.env.RESEND_API_KEY)
}
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "DistroSource <support@distrosource.com>"
const SUPPORT_INBOX = "support@distrosource.com"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const TOPIC_LABELS: Record<string, string> = {
  order: "Order",
  download: "Download",
  licensing: "Licensing",
  billing: "Billing",
  refund: "Refund",
  account: "Account",
  product: "Product question",
  technical: "Technical issue",
  business: "Business & team licensing",
  partnership: "Partnership",
  other: "Other",
}

export async function submitContactMessage(input: {
  name: string
  email: string
  topic: string
  message: string
}) {
  // Public, unauthenticated, and sends mail — the classic spam relay target.
  await enforceRateLimit("contact", RATE_LIMITS.contact)

  const name = input.name.trim()
  const email = input.email.trim()
  const message = input.message.trim()
  const topicLabel = TOPIC_LABELS[input.topic] ?? "General inquiry"

  if (!name) throw new Error("Enter your name.")
  if (!EMAIL_PATTERN.test(email)) throw new Error("Enter a valid email address.")
  if (!message || message.length < 10) throw new Error("Enter a message with at least 10 characters.")

  const subject = `${topicLabel} — ${name}`

  const { error } = await getResend().emails.send({
    from: FROM_EMAIL,
    to: SUPPORT_INBOX,
    replyTo: email,
    subject: `[Contact form] ${subject}`,
    text: `From: ${name} <${email}>\nTopic: ${topicLabel}\n\n${message}`,
  })

  if (error) {
    console.error("[v0] Failed to send contact message:", error)
    throw new Error("Could not send your message. Please try again later.")
  }

  // Also land this as the opening message of a conversation in the admin
  // Support Inbox, so staff see contact-form submissions alongside inbound
  // email replies in one place instead of only in the support@ mailbox.
  try {
    const session = await auth.api.getSession({ headers: await headers() })
    const [conversation] = await db
      .insert(supportConversations)
      .values({
        subject,
        customerEmail: email,
        customerName: name,
        userId: session?.user?.id ?? null,
      })
      .returning({ id: supportConversations.id })

    await db.insert(supportMessages).values({
      conversationId: conversation.id,
      direction: "inbound",
      body: message,
      fromEmail: email,
    })
  } catch (dbError) {
    // The email to support@ already went out — don't fail the user-facing
    // submission just because the inbox mirror failed.
    console.error("[v0] Failed to record contact message in support inbox:", dbError)
  }

  return { success: true }
}

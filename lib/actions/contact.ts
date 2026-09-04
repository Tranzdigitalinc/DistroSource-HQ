"use server"

import { Resend } from "resend"
import { RATE_LIMITS, enforceRateLimit } from "@/lib/rate-limit"

const resend = new Resend(process.env.RESEND_API_KEY)
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

  const { error } = await resend.emails.send({
    from: FROM_EMAIL,
    to: SUPPORT_INBOX,
    replyTo: email,
    subject: `[Contact form] ${topicLabel} — ${name}`,
    text: `From: ${name} <${email}>\nTopic: ${topicLabel}\n\n${message}`,
  })

  if (error) {
    console.error("[v0] Failed to send contact message:", error)
    throw new Error("Could not send your message. Please try again later.")
  }

  return { success: true }
}

"use server"

import { Resend } from "resend"

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "RedeemCove <support@redeemcove.com>"
const SUPPORT_INBOX = "support@redeemcove.com"

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const TOPIC_LABELS: Record<string, string> = {
  order: "Order or delivery issue",
  billing: "Billing or payment",
  account: "Account access",
  business: "Business & bulk gifting",
  partnership: "Brand partnership",
  other: "Something else",
}

export async function submitContactMessage(input: {
  name: string
  email: string
  topic: string
  message: string
}) {
  const name = input.name.trim()
  const email = input.email.trim()
  const message = input.message.trim()
  const topicLabel = TOPIC_LABELS[input.topic] ?? "General inquiry"

  if (!name) throw new Error("Enter your name.")
  if (!EMAIL_PATTERN.test(email)) throw new Error("Enter a valid email address.")
  if (!message || message.length < 10) throw new Error("Enter a message with at least 10 characters.")

  await resend.emails.send({
    from: FROM_EMAIL,
    to: SUPPORT_INBOX,
    replyTo: email,
    subject: `[Contact form] ${topicLabel} — ${name}`,
    text: `From: ${name} <${email}>\nTopic: ${topicLabel}\n\n${message}`,
  })

  return { success: true }
}

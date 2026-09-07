"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { CheckCircle2, Loader2, ICON_SIZE } from "@/lib/storefront-icons"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { submitContactMessage } from "@/lib/actions/contact"

const topics = [
  { value: "order", label: "Order" },
  { value: "download", label: "Download" },
  { value: "licensing", label: "Licensing" },
  { value: "billing", label: "Billing" },
  { value: "refund", label: "Refund" },
  { value: "account", label: "Account" },
  { value: "product", label: "Product question" },
  { value: "technical", label: "Technical issue" },
  { value: "other", label: "Other" },
]

const ORDER_TOPICS = new Set(["order", "download", "billing", "refund"])

export function ContactForm({ defaultTopic = "order" }: { defaultTopic?: string }) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [topic, setTopic] = useState(defaultTopic)
  const [orderNumber, setOrderNumber] = useState("")
  const [message, setMessage] = useState("")
  const [isPending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) return

    // The action's contract is {name,email,topic,message}; the optional order
    // number rides inside the message so the server signature stays stable.
    const body = orderNumber.trim() ? `Order number: ${orderNumber.trim()}\n\n${message.trim()}` : message.trim()

    startTransition(async () => {
      try {
        await submitContactMessage({ name, email, topic, message: body })
        setSubmitted(true)
        toast.success("Message sent.")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not send your message. Please try again.")
      }
    })
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-card p-10 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
          <CheckCircle2 size={ICON_SIZE.feature} aria-hidden="true" />
        </span>
        <h3 className="font-display text-lg font-bold">Message sent</h3>
        <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
          Thanks, {name.split(" ")[0]}. We&apos;ll reply to <span className="font-medium text-foreground">{email}</span>. Typical response within 1 business day.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-lg border border-border bg-card p-6 sm:p-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-name" className="text-sm font-medium text-foreground">Name</label>
          <Input id="contact-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-email" className="text-sm font-medium text-foreground">Email</label>
          <Input id="contact-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-topic" className="text-sm font-medium text-foreground">Topic</label>
          {/* `items` lets Base UI render the label, not the raw value, in the trigger. */}
          <Select items={topics} value={topic} onValueChange={(value) => setTopic(value ?? "order")}>
            <SelectTrigger id="contact-topic" className="h-9 w-full rounded-md">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {topics.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-order" className="text-sm font-medium text-foreground">
            Order number <span className="font-normal text-muted-foreground">(optional)</span>
          </label>
          <Input
            id="contact-order"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="DS-XXXXXXXXXX"
            className="font-mono"
            aria-describedby={ORDER_TOPICS.has(topic) ? "contact-order-hint" : undefined}
          />
          {ORDER_TOPICS.has(topic) && (
            <p id="contact-order-hint" className="text-xs text-muted-foreground">
              Found in your confirmation email or under Account → Orders.
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-message" className="text-sm font-medium text-foreground">Message</label>
        <Textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Tell us what happened and what you expected."
          rows={6}
          minLength={10}
          required
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-muted-foreground">Typical response within 1 business day.</p>
        <Button type="submit" size="lg" disabled={isPending} className="h-11 px-6 font-semibold">
          {isPending && <Loader2 size={ICON_SIZE.sm} className="animate-spin" aria-hidden="true" />}
          {isPending ? "Sending…" : "Send message"}
        </Button>
      </div>
    </form>
  )
}

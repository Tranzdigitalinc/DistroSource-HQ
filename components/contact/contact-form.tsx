"use client"

import { useState, useTransition } from "react"
import { CheckCircle2 } from "lucide-react"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { submitContactMessage } from "@/lib/actions/contact"
import { Loader2 } from "lucide-react"

const topics = [
  { value: "order", label: "Order or delivery issue" },
  { value: "billing", label: "Billing or payment" },
  { value: "account", label: "Account access" },
  { value: "business", label: "Business & bulk gifting" },
  { value: "partnership", label: "Brand partnership" },
  { value: "other", label: "Something else" },
]

export function ContactForm() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [topic, setTopic] = useState("order")
  const [message, setMessage] = useState("")
  const [isPending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim() || !message.trim()) return

    startTransition(async () => {
      try {
        await submitContactMessage({ name, email, topic, message })
        setSubmitted(true)
        toast.success("Message sent — our team will reply by email shortly.")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not send your message. Please try again.")
      }
    })
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-10 text-center">
        <CheckCircle2 className="size-8 text-primary" />
        <h3 className="font-display text-lg font-semibold">Message sent</h3>
        <p className="max-w-sm text-sm text-muted-foreground">
          Thanks, {name.split(" ")[0]}. We&apos;ve received your message and will follow up at {email} within one
          business day.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6 sm:p-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-name" className="text-sm font-medium text-foreground">
            Name
          </label>
          <Input
            id="contact-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jordan Lee"
            required
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="contact-email" className="text-sm font-medium text-foreground">
            Email
          </label>
          <Input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-topic" className="text-sm font-medium text-foreground">
          What can we help with?
        </label>
        <Select value={topic} onValueChange={(value) => setTopic(value ?? "order")}>
          <SelectTrigger id="contact-topic">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {topics.map((t) => (
              <SelectItem key={t.value} value={t.value}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="contact-message" className="text-sm font-medium text-foreground">
          Message
        </label>
        <Textarea
          id="contact-message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Include your order number if this is about a purchase."
          rows={5}
          required
        />
      </div>

      <Button type="submit" size="lg" disabled={isPending} className="h-11 self-start px-6 font-semibold">
        {isPending ? "Sending..." : "Send message"}
      </Button>
    </form>
  )
}

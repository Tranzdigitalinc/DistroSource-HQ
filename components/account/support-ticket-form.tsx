"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { submitSupportTicket } from "@/lib/actions/account"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, Send } from "lucide-react"

const categories = [
  { value: "order", label: "Order issue" },
  { value: "code", label: "Code not working" },
  { value: "billing", label: "Billing question" },
  { value: "account", label: "Account help" },
  { value: "general", label: "General question" },
]

export function SupportTicketForm() {
  const [subject, setSubject] = useState("")
  const [category, setCategory] = useState("general")
  const [message, setMessage] = useState("")
  const [orderNumber, setOrderNumber] = useState("")
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      await submitSupportTicket({ subject, category, message, orderNumber: orderNumber || undefined })
      setSubject("")
      setMessage("")
      setOrderNumber("")
      setCategory("general")
      toast.success("Ticket submitted — our team will follow up by email.")
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" value={subject} onChange={(e) => setSubject(e.target.value)} required placeholder="Brief summary of your issue" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={(value) => setCategory(value ?? "general")}>
            <SelectTrigger id="category" className="w-full">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="order-number">Order number (optional)</Label>
        <Input id="order-number" value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} placeholder="RC-XXXXXXXX" className="font-mono" />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
          rows={5}
          placeholder="Describe the issue in as much detail as possible"
        />
      </div>

      <Button type="submit" disabled={isPending} className="self-start font-semibold">
        {isPending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
        Submit ticket
      </Button>
    </form>
  )
}

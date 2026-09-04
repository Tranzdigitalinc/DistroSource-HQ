"use client"

import { useState, useTransition } from "react"
import { toast } from "sonner"
import { Loader2, Send } from "@/lib/admin-icons"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { replyToSupportConversation, setSupportConversationStatus } from "@/lib/actions/support-inbox"

interface SupportMessage {
  id: number
  direction: string
  body: string
  fromEmail: string
  createdAt: Date
}

export function SupportConversationThread({
  conversationId,
  status,
  messages,
}: {
  conversationId: number
  status: string
  messages: SupportMessage[]
}) {
  const [reply, setReply] = useState("")
  const [isSending, startSending] = useTransition()
  const [isUpdatingStatus, startStatusUpdate] = useTransition()

  function handleSend() {
    const text = reply.trim()
    if (!text) {
      toast.error("Enter a reply before sending.")
      return
    }
    startSending(async () => {
      try {
        await replyToSupportConversation(conversationId, text)
        setReply("")
        toast.success("Reply sent")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not send the reply.")
      }
    })
  }

  function handleToggleStatus() {
    const next = status === "closed" ? "open" : "closed"
    startStatusUpdate(async () => {
      try {
        await setSupportConversationStatus(conversationId, next)
        toast.success(next === "closed" ? "Conversation closed" : "Conversation reopened")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not update the conversation.")
      }
    })
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              "flex flex-col gap-1 rounded-lg border p-3 text-sm",
              message.direction === "outbound" ? "ml-6 border-primary/30 bg-primary/5" : "mr-6 border-border bg-secondary/20",
            )}
          >
            <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
              <span className="font-medium text-foreground">{message.direction === "outbound" ? "DistroSource Support" : message.fromEmail}</span>
              <span>{message.createdAt.toLocaleString()}</span>
            </div>
            <p className="whitespace-pre-wrap leading-relaxed text-foreground">{message.body}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2 border-t border-border pt-4">
        <Textarea
          value={reply}
          onChange={(event) => setReply(event.target.value)}
          placeholder="Write a reply — the customer receives it by email and can reply back into this thread."
          rows={4}
          disabled={isSending}
        />
        <div className="flex items-center justify-between gap-2">
          <Button type="button" variant="outline" size="sm" onClick={handleToggleStatus} disabled={isUpdatingStatus}>
            {isUpdatingStatus ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : null}
            {status === "closed" ? "Reopen conversation" : "Close conversation"}
          </Button>
          <Button type="button" onClick={handleSend} disabled={isSending}>
            {isSending ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <Send className="size-3.5" aria-hidden="true" />}
            Send reply
          </Button>
        </div>
      </div>
    </div>
  )
}

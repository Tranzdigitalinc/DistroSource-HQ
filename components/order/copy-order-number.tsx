"use client"

import { useState } from "react"
import { Check, Copy } from "@/lib/storefront-icons"

export function CopyOrderNumber({ orderNumber }: { orderNumber: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(orderNumber)
      } else {
        throw new Error("Clipboard API unavailable")
      }
      setCopied(true)
    } catch {
      // Fallback for browsers/contexts that deny Clipboard API access
      const textarea = document.createElement("textarea")
      textarea.value = orderNumber
      textarea.style.position = "fixed"
      textarea.style.opacity = "0"
      document.body.appendChild(textarea)
      textarea.select()
      try {
        document.execCommand("copy")
        setCopied(true)
      } catch {
        setCopied(false)
      } finally {
        document.body.removeChild(textarea)
      }
    } finally {
      setTimeout(() => setCopied(false), 1500)
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-label="Copy order number"
      className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 font-mono font-semibold text-foreground transition-colors hover:bg-secondary"
    >
      {orderNumber}
      {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5 text-muted-foreground" />}
    </button>
  )
}

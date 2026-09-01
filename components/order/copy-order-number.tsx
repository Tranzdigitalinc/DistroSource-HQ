"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

export function CopyOrderNumber({ orderNumber }: { orderNumber: string }) {
  const [copied, setCopied] = useState(false)

  function handleCopy() {
    navigator.clipboard.writeText(orderNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
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

"use client"

import { useState, useTransition } from "react"
import { Eye, Copy, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { revealOrderItemCode } from "@/lib/actions/checkout"

export function RevealCode({ orderItemId, isRevealed }: { orderItemId: number; isRevealed: boolean }) {
  const [revealed, setRevealed] = useState(isRevealed)
  const [code, setCode] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleReveal() {
    startTransition(async () => {
      const result = await revealOrderItemCode(orderItemId)
      setCode(result.redemptionCode)
      setRevealed(true)
    })
  }

  function handleCopy() {
    if (!code) return
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  if (!revealed || !code) {
    return (
      <Button size="sm" variant="outline" onClick={handleReveal} disabled={isPending} className="bg-transparent">
        <Eye className="size-3.5" />
        {isPending ? "Revealing..." : "Reveal code"}
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <code className="rounded-md bg-secondary px-2.5 py-1.5 font-mono text-sm font-semibold tracking-wide">
        {code}
      </code>
      <Button size="sm" variant="outline" onClick={handleCopy} className="bg-transparent" aria-label="Copy code">
        {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
      </Button>
    </div>
  )
}

"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function CopyReferralLink({ referralUrl }: { referralUrl: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    await navigator.clipboard.writeText(referralUrl)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }

  return (
    <div className="flex flex-col gap-2 sm:flex-row">
      <Input readOnly value={referralUrl} onFocus={(e) => e.currentTarget.select()} className="font-mono text-xs sm:text-sm" />
      <Button type="button" variant="outline" onClick={copy} className="shrink-0">
        {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
        {copied ? "Copied" : "Copy link"}
      </Button>
    </div>
  )
}

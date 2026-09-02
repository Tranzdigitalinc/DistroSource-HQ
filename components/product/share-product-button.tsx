"use client"

import { useEffect, useState } from "react"
import { Check, Copy, Share2 } from "@/lib/storefront-icons"
import { Button } from "@/components/ui/button"

export function ShareProductButton({ name }: { name: string }) {
  const [copied, setCopied] = useState(false)
  const [canShare, setCanShare] = useState(false)
  useEffect(() => setCanShare(Boolean(navigator.share)), [])
  async function share() {
    const url = window.location.href
    if (navigator.share) {
      await navigator.share({ title: name, url })
      return
    }
    await navigator.clipboard.writeText(url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1800)
  }
  return <Button type="button" variant="outline" size="sm" onClick={share}>{copied ? <Check data-icon="inline-start" /> : canShare ? <Share2 data-icon="inline-start" /> : <Copy data-icon="inline-start" />}{copied ? "Link copied" : "Share"}</Button>
}

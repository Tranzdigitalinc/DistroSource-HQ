"use client"

import { useState, useSyncExternalStore } from "react"
import { Check, Copy, Share2 } from "@/lib/storefront-icons"
import { Button } from "@/components/ui/button"

const noop = () => () => {}

export function ShareProductButton({ name }: { name: string }) {
  const [copied, setCopied] = useState(false)
  // Web Share availability is a browser fact; read it without an effect.
  const canShare = useSyncExternalStore(noop, () => typeof navigator !== "undefined" && Boolean(navigator.share), () => false)
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
  return (
    <Button type="button" variant="outline" size="sm" onClick={share} className="gap-2 bg-transparent">
      {copied ? <Check className="size-4" /> : canShare ? <Share2 className="size-4" /> : <Copy className="size-4" />}
      {copied ? "Link copied" : "Share"}
    </Button>
  )
}

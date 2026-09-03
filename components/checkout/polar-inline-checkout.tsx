"use client"

import { useEffect, useRef } from "react"
import { PolarEmbedCheckout } from "@polar-sh/checkout/embed"
import { Loader2 } from "lucide-react"

interface PolarInlineCheckoutProps {
  checkoutUrl: string
  onSuccess: (successUrl: string) => void
}

export function PolarInlineCheckout({ checkoutUrl, onSuccess }: PolarInlineCheckoutProps) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mountRef.current) return
    let checkout: Awaited<ReturnType<typeof PolarEmbedCheckout.create>> | null = null
    let active = true

    PolarEmbedCheckout.create(checkoutUrl, {
      theme: "light",
      onLoaded: () => {
        if (active) mountRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      },
    }).then((instance) => {
      if (!active) {
        instance.close()
        return
      }
      checkout = instance
      instance.addEventListener("success", (event) => onSuccess(event.detail.successURL))
    })

    return () => {
      active = false
      checkout?.close()
    }
  }, [checkoutUrl, onSuccess])

  return (
    <div ref={mountRef} className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-center gap-2 border-b border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        Secure payment form loading…
      </div>
    </div>
  )
}

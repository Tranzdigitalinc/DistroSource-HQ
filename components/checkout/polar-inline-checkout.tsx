"use client"

import { useEffect, useRef, useState } from "react"
import { Loader2 } from "lucide-react"

interface PolarInlineCheckoutProps {
  checkoutUrl: string
  onSuccess: (successUrl: string) => void
}

const POLAR_ORIGINS = new Set(["https://polar.sh", "https://sandbox.polar.sh"])

export function PolarInlineCheckout({ checkoutUrl, onSuccess }: PolarInlineCheckoutProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const url = new URL(checkoutUrl)
    url.searchParams.set("embed", "true")
    url.searchParams.set("embed_origin", window.location.origin)
    url.searchParams.set("theme", "light")

    const iframe = document.createElement("iframe")
    iframe.src = url.toString()
    iframe.title = "Secure DistroSource payment"
    iframe.allow = "payment *; publickey-credentials-get *"
    iframe.className = "block min-h-[720px] w-full border-0 bg-card"
    iframe.addEventListener("load", () => setLoaded(true), { once: true })
    mount.appendChild(iframe)

    const handleMessage = (event: MessageEvent) => {
      if (!POLAR_ORIGINS.has(event.origin) || event.data?.type !== "POLAR_CHECKOUT") return
      if (event.data.event === "success" && event.data.successURL) onSuccess(event.data.successURL)
    }
    window.addEventListener("message", handleMessage)

    return () => {
      window.removeEventListener("message", handleMessage)
      iframe.remove()
    }
  }, [checkoutUrl, onSuccess])

  return (
    <section aria-labelledby="payment-heading" className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="border-b border-border bg-secondary/40 px-4 py-3">
        <h2 id="payment-heading" className="font-semibold text-foreground">Payment</h2>
        <p className="mt-1 text-sm text-muted-foreground">Secure checkout, right here on DistroSource.</p>
      </div>
      <div ref={mountRef} className="relative min-h-[720px]">
        {!loaded && (
          <div className="absolute inset-0 z-10 flex items-center justify-center gap-2 bg-card text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            Loading secure payment…
          </div>
        )}
      </div>
    </section>
  )
}

export type { PolarInlineCheckoutProps }

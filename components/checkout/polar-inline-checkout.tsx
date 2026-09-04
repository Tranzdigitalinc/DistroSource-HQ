"use client"

import { useEffect, useRef, useState } from "react"
import { AlertTriangle, Lock, Spinner, ICON_SIZE } from "@/lib/storefront-icons"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PolarInlineCheckoutProps {
  checkoutUrl: string
  onSuccess: (successUrl: string) => void
}

const POLAR_ORIGINS = new Set(["https://polar.sh", "https://sandbox.polar.sh"])

/** How long to wait for the iframe to load before offering a fallback. */
const LOAD_TIMEOUT_MS = 15_000

/**
 * Embeds Polar's hosted checkout. The success message from Polar only
 * *navigates* to the success page — it is never treated as payment
 * confirmation. Fulfilment happens exclusively from the verified
 * `order.paid` webhook.
 */
export function PolarInlineCheckout({ checkoutUrl, onSuccess }: PolarInlineCheckoutProps) {
  const mountRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "timeout">("loading")

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    // Bring the payment form into view when it replaces the details form.
    sectionRef.current?.scrollIntoView({ block: "start", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" })

    const url = new URL(checkoutUrl)
    url.searchParams.set("embed", "true")
    url.searchParams.set("embed_origin", window.location.origin)
    url.searchParams.set("theme", document.documentElement.classList.contains("dark") ? "dark" : "light")

    const iframe = document.createElement("iframe")
    iframe.src = url.toString()
    iframe.title = "Secure payment by Polar"
    iframe.allow = "payment *; publickey-credentials-get *"
    // The frame owns its own height so the page never shows two scrollbars.
    iframe.className = "block w-full border-0 bg-card"
    iframe.style.minHeight = window.innerWidth < 640 ? "34rem" : "40rem"
    iframe.addEventListener("load", () => setStatus("ready"), { once: true })
    mount.appendChild(iframe)

    const timer = window.setTimeout(() => {
      setStatus((current) => (current === "loading" ? "timeout" : current))
    }, LOAD_TIMEOUT_MS)

    const handleMessage = (event: MessageEvent) => {
      // Origin allow-list is the security boundary: never act on a
      // postMessage from an unexpected origin.
      if (!POLAR_ORIGINS.has(event.origin) || event.data?.type !== "POLAR_CHECKOUT") return
      if (event.data.event === "success" && event.data.successURL) onSuccess(event.data.successURL)
      // Polar reports its own content height so the frame can grow instead of scrolling inside itself.
      if (event.data.event === "resize" && typeof event.data.height === "number" && event.data.height > 300) {
        iframe.style.minHeight = `${Math.ceil(event.data.height)}px`
      }
    }
    window.addEventListener("message", handleMessage)

    return () => {
      window.clearTimeout(timer)
      window.removeEventListener("message", handleMessage)
      iframe.remove()
    }
  }, [checkoutUrl, onSuccess])

  return (
    <section ref={sectionRef} aria-labelledby="payment-heading" className="scroll-mt-20 overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
        <Lock size={ICON_SIZE.sm} className="text-muted-foreground" aria-hidden="true" />
        <h2 id="payment-heading" className="text-sm font-semibold text-foreground">Payment</h2>
        <span className="ml-auto text-xs text-muted-foreground">Secured by Polar</span>
      </div>

      <div className="relative">
        <div
          ref={mountRef}
          className={cn("transition-opacity duration-300 motion-reduce:transition-none", status === "ready" ? "opacity-100" : "opacity-0")}
        />
        {status !== "ready" && (
          <div
            className="absolute inset-0 z-10 flex min-h-[34rem] flex-col items-center justify-center gap-3 bg-card px-6 text-center sm:min-h-[40rem]"
            role="status"
            aria-live="polite"
          >
            {status === "loading" ? (
              <>
                <Spinner size={ICON_SIZE.feature} className="animate-spin text-muted-foreground motion-reduce:animate-none" aria-hidden="true" />
                <p className="text-sm font-medium text-foreground">Preparing secure checkout…</p>
              </>
            ) : (
              <>
                <AlertTriangle size={ICON_SIZE.feature} className="text-muted-foreground" aria-hidden="true" />
                <p className="text-sm font-medium text-foreground">The payment form is taking longer than usual</p>
                <p className="max-w-sm text-xs leading-relaxed text-muted-foreground">
                  Your cart is saved. You can open the secure payment page directly, or go back and try again.
                </p>
                <Button
                  render={<a href={checkoutUrl} target="_blank" rel="noopener noreferrer" />}
                  nativeButton={false}
                  size="sm"
                  variant="outline"
                  className="mt-1 bg-transparent"
                >
                  Open secure payment page
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  )
}

export type { PolarInlineCheckoutProps }

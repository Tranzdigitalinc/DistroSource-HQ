"use client"

import Script from "next/script"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
const TEBEX_SCRIPT_URL = "https://checkout.tebex.io/js/checkout.min.js"
const TEBEX_BRAND_COLOR = "#ff7a00"

declare global {
  interface Window { Tebex?: { checkout: { init: (options: { ident: string; brand?: { color?: string } }) => void; launch: () => void } } }
}

export function TebexCheckout({ ident, onCancel }: { ident: string; onCancel: () => void }) {
  const [ready, setReady] = useState(false)
  const launch = () => {
    if (!window.Tebex) return
    window.Tebex.checkout.init({ ident, brand: { color: TEBEX_BRAND_COLOR } })
    window.Tebex.checkout.launch()
  }
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border bg-card px-6 py-10 text-center">
      <Script src={TEBEX_SCRIPT_URL} strategy="afterInteractive" onLoad={() => setReady(true)} />
      <div>
        <h2 className="font-display text-lg font-bold text-foreground">Complete your payment</h2>
        <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">Tebex will open a secure checkout window. Your downloads unlock automatically after payment confirmation.</p>
      </div>
      <Button type="button" onClick={launch} disabled={!ready} className="rounded-full font-semibold">
        {ready ? "Open Tebex checkout" : <><Spinner className="animate-spin" /> Loading secure checkout…</>}
      </Button>
      <button type="button" onClick={onCancel} className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Choose a different method</button>
    </div>
  )
}

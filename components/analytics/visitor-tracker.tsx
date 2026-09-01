"use client"

import { useEffect, useRef } from "react"
import { usePathname, useSearchParams } from "next/navigation"

// Fires a best-effort page-view beacon whenever the route changes. This is
// telemetry, not data used to render UI, so a side-effect in useEffect (not
// data fetching for rendering) is the correct pattern here.
export function VisitorTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastTracked = useRef<string | null>(null)

  useEffect(() => {
    const query = searchParams.toString()
    const path = query ? `${pathname}?${query}` : pathname
    if (lastTracked.current === path) return
    lastTracked.current = path

    const payload = JSON.stringify({
      path,
      action: "page_view",
      referrer: document.referrer || null,
    })

    try {
      const blob = new Blob([payload], { type: "application/json" })
      if (!navigator.sendBeacon?.("/api/track", blob)) {
        fetch("/api/track", { method: "POST", body: payload, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(() => {})
      }
    } catch {
      // Never let telemetry failures affect the page.
    }
  }, [pathname, searchParams])

  return null
}

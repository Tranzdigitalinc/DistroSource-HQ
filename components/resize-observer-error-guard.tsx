"use client"

import { useEffect } from "react"

/** Prevents Chromium's benign ResizeObserver loop notification from surfacing as an app error. */
export function ResizeObserverErrorGuard() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (event.message === "ResizeObserver loop completed with undelivered notifications.") {
        event.preventDefault()
        event.stopImmediatePropagation()
      }
    }

    window.addEventListener("error", handleError, true)
    return () => window.removeEventListener("error", handleError, true)
  }, [])

  return null
}

"use client"

import { useEffect } from "react"

const RESIZE_OBSERVER_ERROR = "ResizeObserver loop completed with undelivered notifications."

function isResizeObserverNotification(event: ErrorEvent) {
  return event.message === RESIZE_OBSERVER_ERROR || event.error?.message === RESIZE_OBSERVER_ERROR
}

/** Prevents Chromium's benign ResizeObserver loop notification from surfacing as an app error. */
export function ResizeObserverErrorGuard() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      if (!isResizeObserverNotification(event)) return
      event.preventDefault()
      event.stopImmediatePropagation()
    }

    window.addEventListener("error", handleError, true)
    return () => window.removeEventListener("error", handleError, true)
  }, [])

  return null
}

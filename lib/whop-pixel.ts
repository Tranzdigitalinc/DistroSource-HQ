export type WhopTrackProperties = {
  value?: number
  currency?: string
  email?: string
  event_id?: string
  product_id?: string | number
  product_name?: string
}

type WhopPixel = {
  track: (eventName: string, properties?: WhopTrackProperties) => void
}

declare global {
  interface Window {
    whop?: WhopPixel
  }
}

/**
 * Tracks a browser-side Whop conversion without breaking forms when the
 * pixel is blocked, still loading, or unavailable in a preview.
 */
export function trackWhopEvent(eventName: string, properties?: WhopTrackProperties) {
  if (typeof window === "undefined") return
  window.whop?.track(eventName, properties)
}

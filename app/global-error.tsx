"use client"

import { useEffect } from "react"

/**
 * Last-resort boundary for errors thrown by the root layout itself. It
 * replaces the whole document, so it cannot use the app's providers, fonts,
 * or components — styling is inline on purpose and the palette is hardcoded
 * to the DistroSource navy/orange rather than reading CSS variables that may
 * never have loaded.
 */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[storefront] global error:", error)
  }, [error])

  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "#fbfaf8",
          color: "#14213d",
          fontFamily: "system-ui, -apple-system, Segoe UI, sans-serif",
          textAlign: "center",
        }}
      >
        <main style={{ maxWidth: "28rem" }}>
          <h1 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 700, letterSpacing: "-0.01em" }}>DistroSource is temporarily unavailable</h1>
          <p style={{ margin: "0.75rem 0 0", fontSize: "0.9375rem", lineHeight: 1.6, color: "#5b6478" }}>
            The page could not be loaded. Your cart, orders and downloads are unaffected.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: "1.5rem",
              height: "2.75rem",
              padding: "0 1.5rem",
              border: "none",
              borderRadius: "0.5rem",
              background: "#f26522",
              color: "#fff",
              fontSize: "0.9375rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Reload the page
          </button>
          {error.digest && (
            <p style={{ margin: "1.5rem 0 0", fontSize: "0.75rem", color: "#5b6478" }}>
              Reference <code style={{ fontFamily: "ui-monospace, monospace" }}>{error.digest}</code>
            </p>
          )}
        </main>
      </body>
    </html>
  )
}

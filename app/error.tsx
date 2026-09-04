"use client"

import { useEffect } from "react"
import Link from "next/link"
import { AlertTriangle, ArrowRight, RefreshCw, ICON_SIZE } from "@/lib/storefront-icons"
import { Button } from "@/components/ui/button"

/**
 * Route-level error boundary.
 *
 * Next masks server error messages in production (that is what surfaces as
 * "Minified React error #441" with a digest), so this page never tries to
 * explain the cause. It does three useful things instead: keep the customer
 * inside the storefront, offer a retry that re-runs the failed render, and
 * show the digest — the one value support can match against server logs.
 */
export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("[storefront] route error:", error)
  }, [error])

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
        <AlertTriangle size={ICON_SIZE.feature} aria-hidden="true" />
      </span>
      <h1 className="mt-5 font-display text-2xl font-bold tracking-tight">Something went wrong on our side.</h1>
      <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
        This page didn&apos;t load. Nothing you were doing was lost — your cart and account are unaffected.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button size="lg" onClick={reset} className="font-semibold">
          <RefreshCw aria-hidden="true" />
          Try again
        </Button>
        <Button size="lg" variant="outline" className="bg-transparent font-semibold" nativeButton={false} render={<Link href="/" />}>
          Go to homepage
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>

      {error.digest && (
        <p className="mt-8 text-xs text-muted-foreground">
          Reference{" "}
          <code className="rounded border border-border bg-secondary px-1.5 py-0.5 font-mono text-[11px] text-foreground">{error.digest}</code>
          {" · "}
          <Link href="/contact" className="underline underline-offset-4 hover:text-foreground">
            Contact support
          </Link>
        </p>
      )}
    </div>
  )
}

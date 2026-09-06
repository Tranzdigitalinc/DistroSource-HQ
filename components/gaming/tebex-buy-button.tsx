"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, ArrowRight, Lock, ICON_SIZE } from "@/lib/storefront-icons"
import { isTebexConfigured } from "@/lib/gaming/tebex"
import { formatUsd } from "@/lib/format"
import { cn } from "@/lib/utils"

/**
 * The only way to pay for a Gaming product.
 *
 * Gaming payments run through Tebex; regular DistroSource products keep the
 * existing checkout. The two are deliberately never combined — a Gaming
 * purchase leaves the site entirely rather than entering the site cart, so
 * there is no path on which a Tebex item and a Polar item share a
 * transaction.
 *
 * The interstitial exists because the destination is a third-party domain:
 * the customer is told where they are going and who takes the payment before
 * the tab opens, not after.
 */
export function TebexBuyButton({
  product,
  size = "lg",
  className,
  label,
}: {
  product: { title: string; price: number; tebexPackageId: string; tebexPackageUrl: string }
  size?: "sm" | "default" | "lg"
  className?: string
  label?: string
}) {
  const [open, setOpen] = useState(false)
  const configured = isTebexConfigured(product)

  return (
    <>
      <Button
        size={size}
        onClick={() => setOpen(true)}
        className={cn("font-semibold", className)}
        aria-label={`Buy ${product.title} — ${formatUsd(product.price)}`}
      >
        <Lock size={ICON_SIZE.sm} aria-hidden="true" />
        {label ?? "Buy Now"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[calc(100%-2rem)] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display text-lg font-bold">Secure Checkout</DialogTitle>
            <DialogDescription className="leading-relaxed">
              You are being redirected to our secure Gaming checkout. Payments are processed securely by Tebex.
            </DialogDescription>
          </DialogHeader>

          <div className="rounded-lg border border-border bg-secondary/40 px-4 py-3">
            <p className="text-sm font-semibold text-foreground">{product.title}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              {formatUsd(product.price)} · Official DistroSource product
            </p>
          </div>

          {configured ? (
            <Button
              size="lg"
              className="w-full font-semibold"
              nativeButton={false}
              render={
                <a
                  href={product.tebexPackageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                />
              }
            >
              Continue to Checkout
              <ArrowRight size={ICON_SIZE.base} aria-hidden="true" />
            </Button>
          ) : (
            // Refuses to send a customer to the seeded placeholder URL. The
            // catalogue ships before the Tebex packages exist; this is the
            // guard that keeps that from becoming a dead-end payment.
            <div className="flex items-start gap-2.5 rounded-lg border border-border bg-secondary/40 px-4 py-3">
              <AlertTriangle size={ICON_SIZE.sm} className="mt-0.5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                Checkout for this product is not live yet. Its Tebex package still points at the placeholder store, so
                nothing would be charged. Contact DistroSource support if you need it sooner.
              </p>
            </div>
          )}

          <p className="text-center text-xs text-muted-foreground">
            Payments handled by Tebex. Your DistroSource account and cart are unaffected.
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}

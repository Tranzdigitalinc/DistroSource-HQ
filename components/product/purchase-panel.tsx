"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { motion, AnimatePresence } from "motion/react"
import { Check, Download, FileText, Heart, Loader2, Lock, ShoppingCart } from "@/lib/storefront-icons"
import { Button } from "@/components/ui/button"
import { PriceDisplay } from "@/components/price-display"
import { LicenseSelector, type LicenseOption } from "@/components/product/license-selector"
import { addToCart } from "@/lib/actions/cart"
import { toggleWishlist } from "@/lib/actions/wishlist"
import { licenseLabel } from "@/lib/licenses"
import { mutate } from "swr"
import { cn } from "@/lib/utils"
import { trackWhopEvent } from "@/lib/whop-pixel"

export interface PurchaseMeta {
  formats?: string[]
  software?: string[]
  version?: string
  updatedAt?: string
  hasDocumentation?: boolean
}

export function PurchasePanel({
  productId,
  licenses,
  initialWishlisted,
  isPreviewOnly = false,
  meta,
}: {
  productId: number
  licenses: LicenseOption[]
  initialWishlisted: boolean
  isPreviewOnly?: boolean
  meta?: PurchaseMeta
}) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState(licenses[0]?.id)
  const [wishlisted, setWishlisted] = useState(initialWishlisted)
  const [isAdding, startAdd] = useTransition()
  const [isBuying, startBuy] = useTransition()
  const [isSaving, startSaving] = useTransition()
  const [justAdded, setJustAdded] = useState(false)
  const selected = licenses.find((license) => license.id === selectedId) ?? licenses[0]

  useEffect(() => {
    trackWhopEvent("view_content", { product_id: productId, event_id: `view-product-${productId}` })
  }, [productId])

  async function add() {
    await addToCart(productId, selected.id, 1)
    trackWhopEvent("add_to_cart", {
      value: Number.parseFloat(selected.price),
      currency: "USD",
      product_id: productId,
    })
    await mutate("/api/cart/summary")
  }

  function handleAddToCart() {
    startAdd(async () => {
      try {
        await add()
        router.refresh()
        setJustAdded(true)
        toast.success("Added to cart", { description: `${licenseLabel(selected.licenseType)} licence` })
        setTimeout(() => setJustAdded(false), 2000)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't add this to your cart. Please try again.")
      }
    })
  }

  function handleBuyNow() {
    startBuy(async () => {
      try {
        await add()
        trackWhopEvent("checkout_started", {
          value: Number.parseFloat(selected.price),
          currency: "USD",
          product_id: productId,
          event_id: `checkout-${productId}-${Date.now()}`,
        })
        router.push("/checkout")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't start checkout. Please try again.")
      }
    })
  }

  function handleWishlist() {
    startSaving(async () => {
      try {
        const result = await toggleWishlist(productId)
        setWishlisted(result.wishlisted)
        toast.success(result.wishlisted ? "Saved to wishlist" : "Removed from wishlist")
      } catch {
        toast.error("Sign in to use your wishlist")
        router.push("/sign-in")
      }
    })
  }

  if (!selected) return null
  const busy = isAdding || isBuying
  const facts = [
    meta?.formats?.length ? ["Formats", meta.formats.map((format) => format.toUpperCase()).join(", ")] : null,
    meta?.software?.length ? ["Works with", meta.software.join(", ")] : null,
    meta?.version ? ["Version", `v${meta.version}`] : null,
    meta?.updatedAt ? ["Updated", meta.updatedAt] : null,
  ].filter((row): row is [string, string] => Boolean(row))

  return (
    <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_24px_80px_-44px_color-mix(in_oklch,var(--foreground)_34%,transparent)]">
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Selected licence</p>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.16 }}
                className="mt-1 flex items-baseline gap-2"
              >
                <span className="font-display text-4xl font-black tabular-nums tracking-[-0.045em] text-foreground">
                  <PriceDisplay usdAmount={Number.parseFloat(selected.price)} />
                </span>
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.08em] text-muted-foreground">USD</span>
              </motion.div>
            </AnimatePresence>
            <p className="mt-1 text-xs text-muted-foreground">{licenseLabel(selected.licenseType)} licence · one-time payment</p>
          </div>

          <Button
            onClick={handleWishlist}
            disabled={isSaving}
            variant="outline"
            size="icon"
            className="size-10 shrink-0 rounded-full bg-transparent"
            aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
            aria-pressed={wishlisted}
          >
            <Heart size={17} className={cn("transition-transform", wishlisted && "scale-110 fill-destructive text-destructive")} aria-hidden="true" />
          </Button>
        </div>

        <div className="mt-6 border-t border-border/70 pt-5">
          <LicenseSelector licenses={licenses} value={selected.id} onChange={setSelectedId} />
        </div>

        {facts.length > 0 && (
          <dl className="mt-5 grid grid-cols-2 gap-2">
            {facts.map(([key, value]) => (
              <div key={key} className="rounded-xl bg-secondary/45 px-3 py-2.5">
                <dt className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">{key}</dt>
                <dd className="mt-0.5 truncate text-xs font-semibold text-foreground">{value}</dd>
              </div>
            ))}
          </dl>
        )}

        {isPreviewOnly && (
          <p className="mt-5 rounded-xl border border-dashed border-border bg-secondary/35 px-4 py-3 text-xs leading-5 text-muted-foreground">
            This product&apos;s downloadable files are still being prepared, so it isn&apos;t purchasable yet.
          </p>
        )}

        <div className="mt-6 grid gap-2.5">
          {!isPreviewOnly && (
            <Button onClick={handleBuyNow} disabled={busy} size="lg" className="h-12 w-full rounded-xl bg-foreground font-bold text-background hover:bg-primary hover:text-primary-foreground">
              {isBuying ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : <Lock size={15} aria-hidden="true" />}
              Buy now
            </Button>
          )}
          <Button
            onClick={handleAddToCart}
            disabled={busy || justAdded || isPreviewOnly}
            variant="outline"
            size="lg"
            className={cn("h-12 w-full rounded-xl bg-transparent font-bold", justAdded && "border-success bg-success/10 text-success")}
          >
            {isAdding ? <Loader2 size={17} className="animate-spin" aria-hidden="true" /> : justAdded ? <Check size={17} aria-hidden="true" /> : <ShoppingCart size={17} aria-hidden="true" />}
            {justAdded ? "Added to cart" : isPreviewOnly ? "Not yet available" : "Add to cart"}
          </Button>
        </div>
      </div>

      <ul className="grid gap-px border-t border-border/70 bg-border/70 sm:grid-cols-3">
        {[
          { icon: Download, text: "Digital delivery" },
          ...(meta?.hasDocumentation ? [{ icon: FileText, text: "Docs included" }] : []),
          { icon: Lock, text: "Secure checkout" },
        ].map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center justify-center gap-2 bg-secondary/28 px-3 py-3 text-[11px] font-medium text-muted-foreground">
            <Icon size={13} className="text-foreground" aria-hidden="true" />
            {text}
          </li>
        ))}
      </ul>
    </div>
  )
}

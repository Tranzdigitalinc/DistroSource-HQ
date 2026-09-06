"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AnimatePresence, motion } from "motion/react"
import { mutate } from "swr"
import { PriceDisplay } from "@/components/price-display"
import { LicenseSelector, type LicenseOption } from "@/components/product/license-selector"
import { addToCart } from "@/lib/actions/cart"
import { toggleWishlist } from "@/lib/actions/wishlist"
import { licenseLabel } from "@/lib/licenses"
import { trackWhopEvent } from "@/lib/whop-pixel"
import { Check, Download, FileText, Heart, Loader2, Lock, ShoppingCart } from "@/lib/storefront-icons"
import { cn } from "@/lib/utils"

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
        window.setTimeout(() => setJustAdded(false), 2000)
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
    <div className="overflow-hidden rounded-[30px] border border-border bg-card shadow-[0_24px_80px_-42px_rgba(0,0,0,0.24)]">
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground">Selected licence</p>
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={selected.id}
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 5 }}
                transition={{ duration: 0.18 }}
                className="mt-2 flex items-end gap-2"
              >
                <span className="font-display text-4xl font-black tabular-nums tracking-[-0.055em] text-foreground sm:text-5xl">
                  <PriceDisplay usdAmount={Number.parseFloat(selected.price)} />
                </span>
                <span className="pb-1 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">USD</span>
              </motion.div>
            </AnimatePresence>
            <p className="mt-1 text-xs text-muted-foreground">{licenseLabel(selected.licenseType)} licence · one-time payment</p>
          </div>

          <button
            type="button"
            onClick={handleWishlist}
            disabled={isSaving}
            aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
            aria-pressed={wishlisted}
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-full border transition-[background-color,color,transform] active:scale-95 disabled:opacity-50",
              wishlisted ? "border-destructive/20 bg-destructive/10 text-destructive" : "border-border hover:bg-secondary",
            )}
          >
            <Heart size={18} className={wishlisted ? "fill-current" : ""} />
          </button>
        </div>

        <div className="mt-6 border-t border-border pt-5">
          <LicenseSelector licenses={licenses} value={selected.id} onChange={setSelectedId} />
        </div>

        {isPreviewOnly && (
          <p className="mt-5 rounded-2xl border border-dashed border-border bg-secondary/45 px-4 py-3 text-xs leading-6 text-muted-foreground">
            This product&apos;s downloadable files are still being prepared, so purchasing is disabled for now.
          </p>
        )}

        <div className="mt-6 grid gap-2.5">
          {!isPreviewOnly && (
            <button
              type="button"
              onClick={handleBuyNow}
              disabled={busy}
              className="group flex h-14 w-full items-center justify-between rounded-full bg-foreground px-5 text-sm font-bold text-background transition-[transform,opacity] active:scale-[0.985] disabled:opacity-60"
            >
              <span className="flex items-center gap-2">
                {isBuying ? <Loader2 size={16} className="animate-spin" /> : <Lock size={15} />}
                {isBuying ? "Preparing checkout…" : "Buy now"}
              </span>
              <span className="flex size-9 items-center justify-center rounded-full bg-background text-foreground transition-transform group-hover:translate-x-1">
                <PriceDisplay usdAmount={Number.parseFloat(selected.price)} />
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={busy || justAdded || isPreviewOnly}
            className={cn(
              "flex h-13 w-full items-center justify-center gap-2 rounded-full border border-border px-5 text-sm font-bold transition-[background-color,transform] hover:bg-secondary active:scale-[0.985] disabled:opacity-55",
              justAdded && "border-success/30 bg-success/10 text-success",
            )}
          >
            {isAdding ? <Loader2 size={16} className="animate-spin" /> : justAdded ? <Check size={16} /> : <ShoppingCart size={16} />}
            {justAdded ? "Added to cart" : isPreviewOnly ? "Not yet available" : "Add to cart"}
          </button>
        </div>
      </div>

      {facts.length > 0 && (
        <dl className="grid grid-cols-2 gap-px border-t border-border bg-border sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
          {facts.map(([label, value]) => (
            <div key={label} className="min-w-0 bg-card px-4 py-3.5">
              <dt className="font-mono text-[8px] font-black uppercase tracking-[0.12em] text-muted-foreground">{label}</dt>
              <dd className="mt-1 truncate text-[11px] font-semibold text-foreground" title={value}>{value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="grid gap-2 border-t border-border bg-secondary/30 px-5 py-4 text-[11px] text-muted-foreground sm:px-6">
        <p className="flex items-center gap-2"><Download size={14} className="text-primary" /> Digital delivery after confirmed payment</p>
        {meta?.hasDocumentation && <p className="flex items-center gap-2"><FileText size={14} className="text-primary" /> Documentation included</p>}
        <p className="flex items-center gap-2"><Lock size={14} className="text-primary" /> Secure checkout through the available payment provider</p>
      </div>
    </div>
  )
}

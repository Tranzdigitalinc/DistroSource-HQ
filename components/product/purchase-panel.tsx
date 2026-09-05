"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { motion, AnimatePresence } from "motion/react"
import { Check, Download, FileText, Heart, Loader2, Lock, ShoppingCart, ICON_SIZE } from "@/lib/storefront-icons"
import { Button } from "@/components/ui/button"
import { PriceDisplay } from "@/components/price-display"
import { LicenseSelector, type LicenseOption } from "@/components/product/license-selector"
import { addToCart } from "@/lib/actions/cart"
import { toggleWishlist } from "@/lib/actions/wishlist"
import { licenseLabel } from "@/lib/licenses"
import { mutate } from "swr"
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

  const selected = licenses.find((l) => l.id === selectedId) ?? licenses[0]

  async function add() {
    await addToCart(productId, selected.id, 1)
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

  /** Add the selected licence, then go straight to the cart review before payment. */
  function handleBuyNow() {
    startBuy(async () => {
      try {
        await add()
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
    meta?.formats?.length ? ["Formats", meta.formats.map((f) => f.toUpperCase()).join(", ")] : null,
    meta?.software?.length ? ["Compatibility", meta.software.join(", ")] : null,
    meta?.version ? ["Version", `v${meta.version}`] : null,
    meta?.updatedAt ? ["Last updated", meta.updatedAt] : null,
  ].filter((r): r is [string, string] => Boolean(r))

  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-[var(--shadow-e1)]">
      <div className="border-b border-border px-5 py-4">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={selected.id}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.16 }}
            className="flex items-baseline gap-2"
          >
            <span className="font-display text-3xl font-bold tabular-nums tracking-tight text-foreground">
              <PriceDisplay usdAmount={Number.parseFloat(selected.price)} />
            </span>
            <span className="font-mono text-xs font-medium uppercase text-muted-foreground">USD</span>
          </motion.div>
        </AnimatePresence>
        <p className="mt-0.5 text-xs text-muted-foreground">{licenseLabel(selected.licenseType)} licence · one-time payment</p>
      </div>

      <div className="border-b border-border px-5 py-4">
        <LicenseSelector licenses={licenses} value={selected.id} onChange={setSelectedId} />
      </div>

      {facts.length > 0 && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 border-b border-border px-5 py-3.5 text-xs">
          {facts.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="min-w-0 truncate text-foreground">{v}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="flex flex-col gap-2.5 px-5 py-4">
        {isPreviewOnly && (
          <p className="rounded-md border border-dashed border-border bg-secondary/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
            This product&apos;s downloadable files are still being prepared, so it isn&apos;t purchasable yet.
          </p>
        )}

        <div className="flex items-center gap-2">
          <Button
            onClick={handleAddToCart}
            disabled={busy || justAdded || isPreviewOnly}
            size="lg"
            className={cn("h-11 flex-1 font-semibold", justAdded && "bg-success hover:bg-success")}
          >
            {isAdding ? <Loader2 size={ICON_SIZE.base} className="animate-spin" aria-hidden="true" /> : justAdded ? <Check size={ICON_SIZE.base} aria-hidden="true" /> : <ShoppingCart size={ICON_SIZE.base} aria-hidden="true" />}
            {justAdded ? "Added to cart" : isPreviewOnly ? "Not yet available" : "Add to cart"}
          </Button>
          <Button
            onClick={handleWishlist}
            disabled={isSaving}
            variant="outline"
            size="icon"
            className="size-11 shrink-0 bg-transparent"
            aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
            aria-pressed={wishlisted}
          >
            <Heart size={ICON_SIZE.nav} className={cn("transition-transform", wishlisted && "scale-110 fill-destructive text-destructive")} aria-hidden="true" />
          </Button>
        </div>
        {!isPreviewOnly && (
          <Button onClick={handleBuyNow} disabled={busy} variant="outline" size="lg" className="h-11 w-full bg-transparent font-semibold">
            {isBuying ? <Loader2 size={ICON_SIZE.base} className="animate-spin" aria-hidden="true" /> : <Lock size={ICON_SIZE.sm} aria-hidden="true" />}
            Buy now
          </Button>
        )}
      </div>

      {/* Reassurance: only statements true for this product. */}
      <ul className="flex flex-col gap-1.5 border-t border-border bg-secondary/30 px-5 py-3.5">
        {[
          { icon: Download, text: "Digital delivery to My Library after payment" },
          ...(meta?.hasDocumentation ? [{ icon: FileText, text: "Documentation included" }] : []),
          { icon: Lock, text: "Secure checkout by Polar" },
        ].map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon size={ICON_SIZE.sm} className="shrink-0 text-success" aria-hidden="true" />
            {text}
          </li>
        ))}
      </ul>
    </div>
  )
}

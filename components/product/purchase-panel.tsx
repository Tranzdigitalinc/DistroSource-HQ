"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { motion, AnimatePresence, useInView } from "motion/react"
import NumberFlow from "@number-flow/react"
import { Check, Download, FileText, Heart, Loader2, Lock, ShoppingBag, ICON_SIZE } from "@/lib/storefront-icons"
import { Button } from "@/components/ui/button"
import { PriceDisplay } from "@/components/price-display"
import { LicenseSelector, type LicenseOption } from "@/components/product/license-selector"
import { openCartDrawer, refreshCart } from "@/components/cart/cart-drawer-provider"
import { addToCart } from "@/lib/actions/cart"
import { toggleWishlist } from "@/lib/actions/wishlist"
import { licenseLabel } from "@/lib/licenses"
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
  compareAtPrice,
  meta,
}: {
  productId: number
  licenses: LicenseOption[]
  initialWishlisted: boolean
  isPreviewOnly?: boolean
  compareAtPrice?: number | null
  meta?: PurchaseMeta
}) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState(licenses[0]?.id)
  const [wishlisted, setWishlisted] = useState(initialWishlisted)
  const [isAdding, startAdd] = useTransition()
  const [isBuying, startBuy] = useTransition()
  const [isSaving, startSaving] = useTransition()
  const [justAdded, setJustAdded] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)
  // The sticky bar shows on small screens whenever the panel is scrolled away.
  const panelInView = useInView(panelRef, { margin: "-64px 0px 0px 0px" })

  const selected = licenses.find((l) => l.id === selectedId) ?? licenses[0]

  useEffect(() => {
  }, [productId])

  async function add() {
    await addToCart(productId, selected.id, 1)
    await refreshCart()
  }

  function handleAddToCart() {
    startAdd(async () => {
      try {
        await add()
        router.refresh()
        setJustAdded(true)
        openCartDrawer()
        setTimeout(() => setJustAdded(false), 2000)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't add this to your cart. Please try again.")
      }
    })
  }

  /** Add the selected licence, then go straight to checkout. */
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
  const price = Number.parseFloat(selected.price)
  const onSale = compareAtPrice != null && compareAtPrice > price

  const facts = [
    meta?.formats?.length ? ["Formats", meta.formats.map((f) => f.toUpperCase()).join(", ")] : null,
    meta?.software?.length ? ["Works with", meta.software.join(", ")] : null,
    meta?.version ? ["Version", `v${meta.version}`] : null,
    meta?.updatedAt ? ["Updated", meta.updatedAt] : null,
  ].filter((r): r is [string, string] => Boolean(r))

  return (
    <>
    <div ref={panelRef} className="flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-e1)]">
      <div className="px-5 pt-5">
        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            <NumberFlow value={price} format={{ style: "currency", currency: "USD" }} className="font-display text-4xl font-bold tabular-nums tracking-tight text-foreground" />
            {onSale && (
              <span className="text-base text-muted-foreground line-through">
                <PriceDisplay usdAmount={compareAtPrice!} />
              </span>
            )}
            <span className="font-mono text-[11px] font-medium uppercase tracking-[0.08em] text-muted-foreground">USD · one-time</span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{licenseLabel(selected.licenseType)} licence. Instant download after payment.</p>
      </div>

      <div className="px-5 py-5">
        <LicenseSelector licenses={licenses} value={selected.id} onChange={setSelectedId} />
      </div>

      <div className="flex flex-col gap-2.5 px-5 pb-5">
        {isPreviewOnly && (
          <p className="rounded-lg border border-dashed border-border bg-secondary/50 px-3 py-2 text-xs leading-relaxed text-muted-foreground">
            This product&apos;s downloadable files are still being prepared, so it isn&apos;t purchasable yet.
          </p>
        )}

        <div className="flex items-center gap-2">
          <Button
            onClick={handleAddToCart}
            disabled={busy || justAdded || isPreviewOnly}
            size="lg"
            className={cn("h-12 flex-1 rounded-full text-[15px] font-semibold", justAdded && "bg-success hover:bg-success")}
          >
            {isAdding ? <Loader2 size={ICON_SIZE.base} className="animate-spin" aria-hidden="true" /> : justAdded ? <Check size={ICON_SIZE.base} aria-hidden="true" /> : <ShoppingBag size={ICON_SIZE.base} aria-hidden="true" />}
            {justAdded ? "Added to cart" : isPreviewOnly ? "Not yet available" : "Add to cart"}
          </Button>
          <Button
            onClick={handleWishlist}
            disabled={isSaving}
            variant="outline"
            size="icon"
            className="size-12 shrink-0 rounded-full bg-transparent"
            aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
            aria-pressed={wishlisted}
          >
            <Heart size={ICON_SIZE.nav} className={cn("transition-transform", wishlisted && "scale-110 fill-destructive text-destructive")} aria-hidden="true" />
          </Button>
        </div>
        {!isPreviewOnly && (
          <Button onClick={handleBuyNow} disabled={busy} variant="outline" size="lg" className="h-11 w-full rounded-full bg-transparent font-semibold">
            {isBuying ? <Loader2 size={ICON_SIZE.base} className="animate-spin" aria-hidden="true" /> : <Lock size={ICON_SIZE.sm} aria-hidden="true" />}
            Buy now
          </Button>
        )}
      </div>

      {facts.length > 0 && (
        <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 border-t border-border px-5 py-4 text-xs">
          {facts.map(([k, v]) => (
            <div key={k} className="contents">
              <dt className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{k}</dt>
              <dd className="min-w-0 truncate text-foreground">{v}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* Reassurance: only statements true for this product. */}
      <ul className="flex flex-col gap-1.5 border-t border-border bg-secondary/40 px-5 py-4">
        {[
          { icon: Download, text: "Delivered to My Library after payment" },
          ...(meta?.hasDocumentation ? [{ icon: FileText, text: "Documentation included" }] : []),
          { icon: Lock, text: "Secure checkout via Polar or TamPay" },
        ].map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
            <Icon size={ICON_SIZE.sm} className="shrink-0 text-success" aria-hidden="true" />
            {text}
          </li>
        ))}
      </ul>
    </div>

    <AnimatePresence>
      {!panelInView && !isPreviewOnly && (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 320, damping: 32 }}
          className="fixed inset-x-3 bottom-3 z-40 flex items-center gap-3 rounded-full border border-border bg-background/90 p-2 pl-5 shadow-[var(--shadow-e3)] backdrop-blur-xl lg:hidden"
        >
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-bold tabular-nums leading-tight tracking-tight">
              <PriceDisplay usdAmount={price} />
            </p>
            <p className="truncate text-[11px] text-muted-foreground">{licenseLabel(selected.licenseType)} licence</p>
          </div>
          <Button onClick={handleAddToCart} disabled={busy || justAdded} className={cn("h-11 rounded-full px-5 font-semibold", justAdded && "bg-success hover:bg-success")}>
            {isAdding ? <Loader2 size={ICON_SIZE.base} className="animate-spin" aria-hidden="true" /> : justAdded ? <Check size={ICON_SIZE.base} aria-hidden="true" /> : <ShoppingBag size={ICON_SIZE.base} aria-hidden="true" />}
            {justAdded ? "Added" : "Add to cart"}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
    </>
  )
}

"use client"

import { useEffect, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { AnimatePresence, motion } from "motion/react"
import { Check, Download, FileText, Heart, Loader2, Lock, ShoppingCart } from "@/lib/storefront-icons"
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

export function PurchasePanel({ productId, licenses, initialWishlisted, isPreviewOnly = false, meta }: {
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
    trackWhopEvent("add_to_cart", { value: Number.parseFloat(selected.price), currency: "USD", product_id: productId })
    await mutate("/api/cart/summary")
  }

  function handleAddToCart() {
    startAdd(async () => {
      try {
        await add()
        router.refresh()
        setJustAdded(true)
        toast.success("Added to cart", { description: `${licenseLabel(selected.licenseType)} licence` })
        window.setTimeout(() => setJustAdded(false), 1800)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't add this to your cart.")
      }
    })
  }

  function handleBuyNow() {
    startBuy(async () => {
      try {
        await add()
        trackWhopEvent("checkout_started", { value: Number.parseFloat(selected.price), currency: "USD", product_id: productId, event_id: `checkout-${productId}-${Date.now()}` })
        router.push("/checkout")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't start checkout.")
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
    <section className="border border-border bg-background shadow-[0_24px_70px_-45px_rgba(17,24,39,.35)]">
      <div className="border-b border-border p-5 sm:p-6">
        <p className="font-mono text-[9px] font-black uppercase tracking-[0.13em] text-muted-foreground">Choose your licence</p>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={selected.id} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.18 }} className="mt-3 flex items-end justify-between gap-4">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-5xl font-black leading-none tracking-[-0.06em]"><PriceDisplay usdAmount={Number.parseFloat(selected.price)} /></span>
                <span className="font-mono text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">USD</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">{licenseLabel(selected.licenseType)} licence · one-time purchase</p>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="border-b border-border p-5 sm:p-6">
        <LicenseSelector licenses={licenses} value={selected.id} onChange={setSelectedId} />
      </div>

      {facts.length > 0 && (
        <dl className="grid gap-px border-b border-border bg-border sm:grid-cols-2">
          {facts.map(([label, value]) => (
            <div key={label} className="bg-background px-5 py-4">
              <dt className="font-mono text-[8px] font-black uppercase tracking-[0.12em] text-muted-foreground">{label}</dt>
              <dd className="mt-1 truncate text-sm font-semibold text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      <div className="p-5 sm:p-6">
        {isPreviewOnly && <p className="mb-4 border border-dashed border-border bg-secondary/40 px-4 py-3 text-xs leading-5 text-muted-foreground">This product is still being prepared and is not purchasable yet.</p>}
        <button type="button" onClick={handleBuyNow} disabled={busy || isPreviewOnly} className="flex h-14 w-full items-center justify-center gap-2 bg-[#111827] text-sm font-black text-white transition-transform active:scale-[0.99] disabled:opacity-50 dark:bg-white dark:text-[#111827]">
          {isBuying ? <Loader2 size={16} className="animate-spin" /> : <Lock size={15} />}
          {isPreviewOnly ? "Not yet available" : "Buy now"}
        </button>
        <div className="mt-2 grid grid-cols-[1fr_52px] gap-2">
          <button type="button" onClick={handleAddToCart} disabled={busy || justAdded || isPreviewOnly} className={cn("flex h-12 items-center justify-center gap-2 border border-border text-sm font-bold transition-colors hover:bg-secondary", justAdded && "border-success text-success")}>
            {isAdding ? <Loader2 size={15} className="animate-spin" /> : justAdded ? <Check size={15} /> : <ShoppingCart size={15} />}
            {justAdded ? "Added" : "Add to cart"}
          </button>
          <button type="button" onClick={handleWishlist} disabled={isSaving} aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"} aria-pressed={wishlisted} className="flex size-[52px] items-center justify-center border border-border transition-colors hover:bg-secondary">
            <Heart size={18} className={cn(wishlisted && "fill-destructive text-destructive")} />
          </button>
        </div>
      </div>

      <ul className="grid gap-px border-t border-border bg-border sm:grid-cols-3">
        {[
          { icon: Download, text: "Digital delivery" },
          ...(meta?.hasDocumentation ? [{ icon: FileText, text: "Documentation" }] : []),
          { icon: Lock, text: "Secure checkout" },
        ].map(({ icon: Icon, text }) => (
          <li key={text} className="flex items-center gap-2 bg-secondary/30 px-4 py-3 text-[11px] text-muted-foreground"><Icon size={13} className="text-success" /> {text}</li>
        ))}
      </ul>
    </section>
  )
}

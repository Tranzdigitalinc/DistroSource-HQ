"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { motion } from "motion/react"
import { ChevronDown, Heart, ImageOff, Loader2, Trash, ICON_SIZE } from "@/lib/storefront-icons"
import { PriceDisplay } from "@/components/price-display"
import { LicenseSelector, type LicenseOption } from "@/components/product/license-selector"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { changeCartItemLicense, removeCartItem } from "@/lib/actions/cart"
import { toggleWishlist } from "@/lib/actions/wishlist"
import { licenseLabel } from "@/lib/licenses"
import { getSourceTypeLabel } from "@/lib/format"
import { useCartCount } from "@/lib/use-cart"
import { cn } from "@/lib/utils"

export interface CartLineItemProps {
  cartItemId: number
  productId: number
  productSlug: string
  productName: string
  tagline?: string | null
  categoryName?: string | null
  sourceType?: string
  licenseId: number
  licenseType: string
  licenseOptions: LicenseOption[]
  imageUrl: string | null
  fileFormats?: string[]
  software?: string[]
  unitPriceUsd: string
  quantity: number
  onRemoved?: (cartItemId: number) => void
}

const actionClass =
  "inline-flex h-9 items-center gap-1.5 rounded-md px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

export function CartLineItem({
  cartItemId,
  productId,
  productSlug,
  productName,
  tagline,
  categoryName,
  sourceType,
  licenseId,
  licenseType,
  licenseOptions,
  imageUrl,
  fileFormats,
  software,
  unitPriceUsd,
  quantity,
  onRemoved,
}: CartLineItemProps) {
  const router = useRouter()
  const { refresh } = useCartCount()
  const [isRemoving, startRemove] = useTransition()
  const [isSaving, startSave] = useTransition()
  const [isChanging, startChange] = useTransition()
  const [licenseOpen, setLicenseOpen] = useState(false)

  const lineTotal = Number.parseFloat(unitPriceUsd) * quantity
  // Software/format strings in the catalog can be whole phrases, so keep
  // this to one of each and let the row clamp the line.
  const meta = [
    ...(software?.length ? [software[0]] : []),
    ...(fileFormats?.length ? [fileFormats.slice(0, 2).map((f) => f.toUpperCase()).join(", ")] : []),
  ]

  function handleRemove() {
    startRemove(async () => {
      try {
        await removeCartItem(cartItemId)
        refresh()
        router.refresh()
        onRemoved?.(cartItemId)
        toast.success("Removed from cart")
      } catch {
        toast.error("We couldn't remove this item. Please try again.")
      }
    })
  }

  /** Saves to wishlist, then removes from the cart — "move", not "copy". */
  function handleMoveToWishlist() {
    startSave(async () => {
      try {
        await toggleWishlist(productId)
        await removeCartItem(cartItemId)
        refresh()
        router.refresh()
        onRemoved?.(cartItemId)
        toast.success("Moved to wishlist")
      } catch {
        toast.error("Sign in to save items to your wishlist.")
      }
    })
  }

  function handleLicenseChange(nextId: number) {
    if (nextId === licenseId) {
      setLicenseOpen(false)
      return
    }
    startChange(async () => {
      try {
        await changeCartItemLicense(cartItemId, nextId)
        setLicenseOpen(false)
        refresh()
        router.refresh()
        const next = licenseOptions.find((l) => l.id === nextId)
        toast.success(`Licence changed to ${next ? licenseLabel(next.licenseType) : "the selected tier"}`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "We couldn't change the licence. Please try again.")
      }
    })
  }

  const busy = isRemoving || isSaving || isChanging

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: busy ? 0.55 : 1, y: 0 }}
      exit={{ opacity: 0, height: 0, marginTop: 0, marginBottom: 0 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-[4.5rem_minmax(0,1fr)] gap-4 border-b border-border py-5 last:border-0 sm:grid-cols-[6rem_minmax(0,1fr)_auto]"
    >
      <Link
        href={`/products/${productSlug}`}
        className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-border bg-secondary/40 transition-opacity hover:opacity-90"
        aria-label={`View ${productName}`}
      >
        {imageUrl ? (
          <Image src={imageUrl} alt="" fill className="object-cover" sizes="96px" />
        ) : (
          <span className="flex size-full items-center justify-center text-muted-foreground">
            <ImageOff size={ICON_SIZE.nav} aria-hidden="true" />
          </span>
        )}
      </Link>

      <div className="min-w-0">
        <div className="flex items-start justify-between gap-3 sm:block">
          <div className="min-w-0">
            <Link
              href={`/products/${productSlug}`}
              className="block text-[15px] font-semibold leading-snug text-foreground transition-colors hover:text-primary"
            >
              {productName}
            </Link>
            {tagline && <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">{tagline}</p>}
          </div>
          <PriceDisplay usdAmount={lineTotal} className="shrink-0 text-base font-bold tabular-nums text-foreground sm:hidden" />
        </div>

        <dl className="mt-2 line-clamp-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
          {categoryName && <dd>{categoryName}</dd>}
          {categoryName && (meta.length > 0 || sourceType) && <span aria-hidden="true">·</span>}
          {meta.length > 0 && <dd>{meta.join(" • ")}</dd>}
          {meta.length > 0 && sourceType && <span aria-hidden="true">·</span>}
          {sourceType && <dd>{getSourceTypeLabel(sourceType)}</dd>}
        </dl>

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <Popover open={licenseOpen} onOpenChange={setLicenseOpen}>
            <PopoverTrigger
              disabled={busy || licenseOptions.length < 2}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-md border border-border bg-secondary/60 pl-3 pr-2.5 text-xs font-semibold text-foreground transition-colors",
                "hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default disabled:hover:border-border",
              )}
              aria-label={`Licence: ${licenseLabel(licenseType)}. Change licence`}
            >
              {isChanging ? <Loader2 size={12} className="animate-spin" aria-hidden="true" /> : null}
              {licenseLabel(licenseType)} licence
              {licenseOptions.length > 1 && <ChevronDown size={12} className="text-muted-foreground" aria-hidden="true" />}
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80 rounded-lg p-3">
              <LicenseSelector licenses={licenseOptions} value={licenseId} onChange={handleLicenseChange} compact />
            </PopoverContent>
          </Popover>
          {quantity > 1 && <span className="font-mono text-xs text-muted-foreground">× {quantity}</span>}
        </div>

        <div className={cn("mt-2 -ml-2 flex flex-wrap items-center", busy && "pointer-events-none")}>
          <button type="button" onClick={handleMoveToWishlist} disabled={busy} className={actionClass}>
            {isSaving ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Heart size={14} aria-hidden="true" />}
            Save for later
          </button>
          <button type="button" onClick={handleRemove} disabled={busy} className={actionClass}>
            {isRemoving ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : <Trash size={14} aria-hidden="true" />}
            Remove
          </button>
        </div>
      </div>

      <div className="hidden text-right sm:block">
        <PriceDisplay usdAmount={lineTotal} className="text-base font-bold tabular-nums text-foreground" />
        {quantity > 1 && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            <PriceDisplay usdAmount={Number.parseFloat(unitPriceUsd)} /> each
          </p>
        )}
      </div>
    </motion.li>
  )
}

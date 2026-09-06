"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { motion } from "motion/react"
import { ChevronDown, Heart, ImageOff, Loader2, Trash } from "@/lib/storefront-icons"
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

const actionClass = "inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[11px] font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

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
  const meta = [
    ...(software?.length ? [software[0]] : []),
    ...(fileFormats?.length ? [fileFormats.slice(0, 2).map((format) => format.toUpperCase()).join(", ")] : []),
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
        const next = licenseOptions.find((license) => license.id === nextId)
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
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: busy ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.985, height: 0, marginTop: 0, marginBottom: 0 }}
      transition={{ duration: 0.22 }}
      className="group grid grid-cols-[92px_minmax(0,1fr)] gap-4 border-b border-border py-6 last:border-b-0 sm:grid-cols-[122px_minmax(0,1fr)_auto] sm:gap-6 sm:py-7"
    >
      <Link
        href={`/products/${productSlug}`}
        className="relative aspect-square overflow-hidden rounded-[22px] bg-secondary"
        aria-label={`View ${productName}`}
      >
        {imageUrl ? (
          <Image src={imageUrl} alt="" fill className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" sizes="122px" />
        ) : (
          <span className="flex size-full items-center justify-center text-muted-foreground"><ImageOff size={22} /></span>
        )}
      </Link>

      <div className="min-w-0 py-1">
        <div className="flex items-start justify-between gap-3 sm:block">
          <div className="min-w-0">
            <p className="font-mono text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground">
              {categoryName ?? (sourceType ? getSourceTypeLabel(sourceType) : "Digital product")}
            </p>
            <Link href={`/products/${productSlug}`} className="mt-1.5 block font-display text-base font-black leading-tight tracking-[-0.025em] text-foreground transition-colors hover:text-primary sm:text-lg">
              {productName}
            </Link>
            {tagline && <p className="mt-1 line-clamp-1 text-xs leading-5 text-muted-foreground sm:text-sm">{tagline}</p>}
          </div>
          <PriceDisplay usdAmount={lineTotal} className="shrink-0 font-display text-base font-black tabular-nums sm:hidden" />
        </div>

        {meta.length > 0 && <p className="mt-2 truncate text-[11px] text-muted-foreground">{meta.join(" · ")}</p>}

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Popover open={licenseOpen} onOpenChange={setLicenseOpen}>
            <PopoverTrigger
              disabled={busy || licenseOptions.length < 2}
              className={cn(
                "inline-flex h-9 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-[11px] font-semibold transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default",
              )}
              aria-label={`Licence: ${licenseLabel(licenseType)}. Change licence`}
            >
              {isChanging && <Loader2 size={12} className="animate-spin" />}
              {licenseLabel(licenseType)} licence
              {licenseOptions.length > 1 && <ChevronDown size={12} className="text-muted-foreground" />}
            </PopoverTrigger>
            <PopoverContent align="start" className="w-80 rounded-[22px] p-3">
              <LicenseSelector licenses={licenseOptions} value={licenseId} onChange={handleLicenseChange} compact />
            </PopoverContent>
          </Popover>
          {quantity > 1 && <span className="font-mono text-[10px] text-muted-foreground">Qty {quantity}</span>}
        </div>

        <div className={cn("mt-3 -ml-2 flex flex-wrap items-center", busy && "pointer-events-none")}>
          <button type="button" onClick={handleMoveToWishlist} disabled={busy} className={actionClass}>
            {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Heart size={13} />}
            Save
          </button>
          <button type="button" onClick={handleRemove} disabled={busy} className={actionClass}>
            {isRemoving ? <Loader2 size={13} className="animate-spin" /> : <Trash size={13} />}
            Remove
          </button>
        </div>
      </div>

      <div className="hidden min-w-24 py-1 text-right sm:block">
        <PriceDisplay usdAmount={lineTotal} className="font-display text-xl font-black tabular-nums tracking-tight text-foreground" />
        {quantity > 1 && <p className="mt-1 text-[11px] text-muted-foreground"><PriceDisplay usdAmount={Number.parseFloat(unitPriceUsd)} /> each</p>}
      </div>
    </motion.li>
  )
}

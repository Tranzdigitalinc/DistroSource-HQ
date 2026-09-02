"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { motion } from "motion/react"
import { Check, Loader2, Minus, Plus, X } from "@/lib/storefront-icons"
import { PriceDisplay } from "@/components/price-display"
import { updateCartItemQuantity, removeCartItem } from "@/lib/actions/cart"
import { formatLicenseType } from "@/lib/format"
import { useCartCount } from "@/lib/use-cart"
import { cn } from "@/lib/utils"

interface CartLineItemProps {
  cartItemId: number
  productSlug: string
  productName: string
  licenseType: string
  imageUrl: string | null
  unitPriceUsd: string
  quantity: number
  onRemoved?: (cartItemId: number) => void
}

export function CartLineItem({
  cartItemId,
  productSlug,
  productName,
  licenseType,
  imageUrl,
  unitPriceUsd,
  quantity,
  onRemoved,
}: CartLineItemProps) {
  const router = useRouter()
  const [qty, setQty] = useState(quantity)
  const [isUpdating, startUpdate] = useTransition()
  const [isRemoving, startRemove] = useTransition()
  const { refresh } = useCartCount()

  function updateQty(next: number) {
    const clamped = Math.max(1, Math.min(20, next))
    if (clamped === qty) return
    setQty(clamped)
    startUpdate(async () => {
      try {
        await updateCartItemQuantity(cartItemId, clamped)
        refresh()
        router.refresh()
      } catch {
        setQty(qty)
        toast.error("We couldn't update this item. Please try again.")
      }
    })
  }

  function handleRemove() {
    startRemove(async () => {
      try {
        await removeCartItem(cartItemId)
        refresh()
        router.refresh()
        onRemoved?.(cartItemId)
        toast.success("Item removed from your cart")
      } catch {
        toast.error("We couldn't remove this item. Please try again.")
      }
    })
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: isRemoving ? 0.4 : 1, y: 0 }}
      exit={{ opacity: 0, x: -24, height: 0, marginTop: 0, marginBottom: 0 }}
      transition={{ duration: 0.3 }}
      className="flex gap-3 border-b border-border py-5 last:border-0 sm:gap-4"
    >
      <Link
        href={`/products/${productSlug}`}
        className="relative size-20 shrink-0 overflow-hidden border border-border bg-muted sm:size-24"
      >
        {imageUrl ? (
          <Image src={imageUrl || "/placeholder.svg"} alt={productName} fill className="object-cover" sizes="96px" />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-muted-foreground">No preview</div>
        )}
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <Link href={`/products/${productSlug}`} className="text-sm font-semibold leading-snug hover:text-accent">
              {productName}
            </Link>
            <p className="text-xs text-muted-foreground">{formatLicenseType(licenseType)} license</p>
            <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
              <Check className="size-3 text-success" aria-hidden="true" />
              Instant digital download
            </p>
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.85 }}
            onClick={handleRemove}
            disabled={isRemoving}
            className="-mr-1.5 -mt-1.5 flex size-9 shrink-0 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:opacity-50"
            aria-label="Remove item"
          >
            {isRemoving ? <Loader2 className="size-4 animate-spin" /> : <X className="size-4" />}
          </motion.button>
        </div>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center border border-border">
            <motion.button
              type="button"
              whileTap={{ scale: 0.85 }}
              onClick={() => updateQty(qty - 1)}
              disabled={isUpdating || isRemoving || qty <= 1}
              className="flex size-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
              aria-label="Decrease quantity"
            >
              <Minus className="size-3.5" />
            </motion.button>
            <span className="w-7 text-center font-mono text-sm font-medium tabular-nums">
              {isUpdating ? <Loader2 className="mx-auto size-3.5 animate-spin text-muted-foreground" /> : qty}
            </span>
            <motion.button
              type="button"
              whileTap={{ scale: 0.85 }}
              onClick={() => updateQty(qty + 1)}
              disabled={isUpdating || isRemoving || qty >= 20}
              className="flex size-9 items-center justify-center text-muted-foreground transition-colors hover:text-foreground disabled:opacity-30"
              aria-label="Increase quantity"
            >
              <Plus className="size-3.5" />
            </motion.button>
          </div>
          <span className={cn("font-mono text-base font-bold", isRemoving && "opacity-40")}>
            <PriceDisplay usdAmount={Number.parseFloat(unitPriceUsd) * qty} />
          </span>
        </div>
      </div>
    </motion.div>
  )
}

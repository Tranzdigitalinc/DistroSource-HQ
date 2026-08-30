"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"
import { Minus, Plus, X } from "lucide-react"
import { PriceDisplay } from "@/components/price-display"
import { BrandThumbnail } from "@/components/product/brand-thumbnail"
import { updateCartItemQuantity, removeCartItem } from "@/lib/actions/cart"

interface CartLineItemProps {
  cartItemId: number
  productSlug: string
  productName: string
  brandName: string
  brandLogoUrl?: string | null
  brandColor?: string | null
  denominationLabel: string
  imageUrl: string | null
  unitPriceUsd: string
  quantity: number
}

export function CartLineItem({
  cartItemId,
  productSlug,
  productName,
  brandName,
  brandLogoUrl,
  brandColor,
  denominationLabel,
  imageUrl,
  unitPriceUsd,
  quantity,
}: CartLineItemProps) {
  const [qty, setQty] = useState(quantity)
  const [isPending, startTransition] = useTransition()

  function updateQty(next: number) {
    const clamped = Math.max(1, Math.min(20, next))
    setQty(clamped)
    startTransition(async () => {
      await updateCartItemQuantity(cartItemId, clamped)
    })
  }

  function handleRemove() {
    startTransition(async () => {
      await removeCartItem(cartItemId)
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="flex gap-4 border-b border-border py-5 last:border-0"
    >
      <Link href={`/products/${productSlug}`} className="relative size-20 shrink-0 overflow-hidden rounded-lg">
        {imageUrl ? (
          <Image src={imageUrl || "/placeholder.svg"} alt={productName} fill className="object-cover" sizes="80px" />
        ) : (
          <BrandThumbnail
            logoUrl={brandLogoUrl ?? null}
            brandColor={brandColor ?? null}
            brandName={brandName}
            logoClassName="rounded-lg shadow-none"
          />
        )}
      </Link>
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium text-muted-foreground">{brandName}</p>
            <Link href={`/products/${productSlug}`} className="text-sm font-semibold hover:underline">
              {productName}
            </Link>
            <p className="text-xs text-muted-foreground">{denominationLabel}</p>
          </div>
          <motion.button
            type="button"
            whileTap={{ scale: 0.85 }}
            onClick={handleRemove}
            disabled={isPending}
            className="shrink-0 text-muted-foreground hover:text-destructive"
            aria-label="Remove item"
          >
            <X className="size-4" />
          </motion.button>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center rounded-lg border border-border">
            <motion.button
              type="button"
              whileTap={{ scale: 0.85 }}
              onClick={() => updateQty(qty - 1)}
              disabled={isPending}
              className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label="Decrease quantity"
            >
              <Minus className="size-3.5" />
            </motion.button>
            <span className="w-7 text-center text-sm font-medium">{qty}</span>
            <motion.button
              type="button"
              whileTap={{ scale: 0.85 }}
              onClick={() => updateQty(qty + 1)}
              disabled={isPending}
              className="flex size-8 items-center justify-center text-muted-foreground hover:text-foreground"
              aria-label="Increase quantity"
            >
              <Plus className="size-3.5" />
            </motion.button>
          </div>
          <span className="font-display text-base font-bold">
            <PriceDisplay usdAmount={Number.parseFloat(unitPriceUsd) * qty} />
          </span>
        </div>
      </div>
    </motion.div>
  )
}

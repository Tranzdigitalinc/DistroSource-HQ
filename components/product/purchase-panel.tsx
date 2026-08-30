"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Heart, Minus, Plus, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PriceDisplay } from "@/components/price-display"
import { addToCart } from "@/lib/actions/cart"
import { toggleWishlist } from "@/lib/actions/wishlist"
import { mutate } from "swr"
import { cn } from "@/lib/utils"

interface Variant {
  id: number
  denominationLabel: string
  priceUsd: string
  faceValueUsd: string
  discountPercent: number
  stockCount: number
}

export function PurchasePanel({
  productId,
  variants,
  initialWishlisted,
}: {
  productId: number
  variants: Variant[]
  initialWishlisted: boolean
}) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState(variants[0]?.id)
  const [quantity, setQuantity] = useState(1)
  const [wishlisted, setWishlisted] = useState(initialWishlisted)
  const [isPending, startTransition] = useTransition()

  const selected = variants.find((v) => v.id === selectedId) ?? variants[0]

  function handleAddToCart() {
    startTransition(async () => {
      try {
        await addToCart(productId, selected.id, quantity)
        mutate("/api/cart/summary")
        toast.success("Added to cart", {
          description: `${selected.denominationLabel} x${quantity}`,
        })
      } catch {
        toast.error("Couldn't add this to your cart. Please try again.")
      }
    })
  }

  function handleWishlist() {
    startTransition(async () => {
      try {
        const result = await toggleWishlist(productId)
        setWishlisted(result.wishlisted)
        toast.success(result.wishlisted ? "Added to wishlist" : "Removed from wishlist")
      } catch {
        toast.error("Please sign in to use your wishlist")
        router.push("/sign-in")
      }
    })
  }

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6">
      <div>
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Choose a denomination
        </p>
        <div className="grid grid-cols-2 gap-2">
          {variants.map((variant) => (
            <button
              key={variant.id}
              type="button"
              onClick={() => setSelectedId(variant.id)}
              className={cn(
                "flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-all",
                selectedId === variant.id
                  ? "border-primary bg-primary/5 ring-1 ring-primary"
                  : "border-border hover:border-primary/40",
              )}
            >
              <span className="text-sm font-semibold">{variant.denominationLabel}</span>
              <span className="text-xs text-muted-foreground">
                <PriceDisplay usdAmount={Number.parseFloat(variant.priceUsd)} />
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <span className="font-display text-2xl font-bold">
          <PriceDisplay usdAmount={Number.parseFloat(selected.priceUsd) * quantity} />
        </span>
        {selected.discountPercent > 0 && (
          <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent-foreground">
            Save {selected.discountPercent}%
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Qty</p>
        <div className="flex items-center rounded-lg border border-border">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex size-9 items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label="Decrease quantity"
          >
            <Minus className="size-3.5" />
          </button>
          <span className="w-8 text-center text-sm font-medium">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(10, q + 1))}
            className="flex size-9 items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label="Increase quantity"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button onClick={handleAddToCart} disabled={isPending} className="h-11 flex-1 font-semibold">
          <ShoppingCart className="size-4" />
          Add to cart
        </Button>
        <Button
          onClick={handleWishlist}
          disabled={isPending}
          variant="outline"
          size="icon"
          className="size-11 shrink-0 bg-transparent"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={cn("size-4.5", wishlisted && "fill-destructive text-destructive")} />
        </Button>
      </div>
    </div>
  )
}

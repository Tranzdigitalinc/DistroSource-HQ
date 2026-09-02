"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { motion, AnimatePresence } from "motion/react"
import { Heart, Minus, Plus, ShoppingCart, Check, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PriceDisplay } from "@/components/price-display"
import { addToCart } from "@/lib/actions/cart"
import { toggleWishlist } from "@/lib/actions/wishlist"
import { formatLicenseType } from "@/lib/format"
import { mutate } from "swr"
import { cn } from "@/lib/utils"

interface License {
  id: number
  licenseType: string
  price: string
  description: string | null
}

export function PurchasePanel({
  productId,
  licenses,
  initialWishlisted,
}: {
  productId: number
  licenses: License[]
  initialWishlisted: boolean
}) {
  const router = useRouter()
  const [selectedId, setSelectedId] = useState(licenses[0]?.id)
  const [quantity, setQuantity] = useState(1)
  const [wishlisted, setWishlisted] = useState(initialWishlisted)
  const [isPending, startTransition] = useTransition()
  const [justAdded, setJustAdded] = useState(false)

  const selected = licenses.find((l) => l.id === selectedId) ?? licenses[0]

  function handleAddToCart() {
    startTransition(async () => {
      try {
        await addToCart(productId, selected.id, quantity)
        await mutate("/api/cart/summary")
        router.refresh()
        setJustAdded(true)
        toast.success("Added to cart", {
          description: `${formatLicenseType(selected.licenseType)} license x${quantity}`,
        })
        setTimeout(() => setJustAdded(false), 2000)
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

  if (!selected) return null

  return (
    <div className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6">
      <div>
        <p className="mb-2.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Choose a license
        </p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {licenses.map((license) => (
            <motion.button
              key={license.id}
              type="button"
              onClick={() => { setSelectedId(license.id); setQuantity(1) }}
              whileTap={{ scale: 0.96 }}
              className={cn(
                "relative flex flex-col items-start gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-all",
                selectedId === license.id
                  ? "border-accent bg-accent/10 ring-1 ring-accent"
                  : "border-border hover:border-accent/40",
              )}
            >
              <span className="text-sm font-semibold">{formatLicenseType(license.licenseType)}</span>
              <span className="text-xs text-muted-foreground">
                <PriceDisplay usdAmount={Number.parseFloat(license.price)} />
              </span>
              {license.description && (
                <span className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{license.description}</span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between rounded-lg bg-secondary/50 px-4 py-3">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={`${selected.id}-${quantity}`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.18 }}
            className="font-display text-2xl font-bold"
          >
            <PriceDisplay usdAmount={Number.parseFloat(selected.price) * quantity} />
          </motion.span>
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Qty</p>
        <div className="flex items-center rounded-lg border border-border">
          <motion.button
            type="button"
            whileTap={{ scale: 0.85 }}
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="flex size-9 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus className="size-3.5" />
          </motion.button>
          <span className="w-8 text-center text-sm font-medium">{quantity}</span>
          <motion.button
            type="button"
            whileTap={{ scale: 0.85 }}
            onClick={() => setQuantity((q) => Math.min(10, q + 1))}
            className="flex size-9 items-center justify-center text-muted-foreground hover:text-foreground disabled:opacity-40"
            disabled={quantity >= 10}
            aria-label="Increase quantity"
          >
            <Plus className="size-3.5" />
          </motion.button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          onClick={handleAddToCart}
          disabled={isPending || justAdded}
          className={cn("h-11 flex-1 font-semibold transition-all", justAdded && "bg-success hover:bg-success")}
        >
          {justAdded ? (
            <>
              <Check className="size-4" />
              Added!
            </>
          ) : (
            <>
              <ShoppingCart className="size-4" />
              Add to cart
            </>
          )}
        </Button>
        <Button
          onClick={handleWishlist}
          disabled={isPending}
          variant="outline"
          size="icon"
          className="size-11 shrink-0 bg-transparent"
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={cn("size-4.5 transition-all", wishlisted && "fill-destructive text-destructive scale-110")} />
        </Button>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
        <Download className="size-3 text-accent" />
        Instant access — download from My Library right after purchase
      </div>
    </div>
  )
}

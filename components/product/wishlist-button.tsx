"use client"

import useSWR from "swr"
import { motion, AnimatePresence } from "motion/react"
import { Heart } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { getWishlistProductIds, toggleWishlist } from "@/lib/actions/wishlist"

export function WishlistButton({ productId, className }: { productId: number; className?: string }) {
  const { data: ids = [], mutate } = useSWR("wishlist-ids", getWishlistProductIds, {
    revalidateOnFocus: false,
  })

  const isWishlisted = ids.includes(productId)

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    const optimisticIds = isWishlisted ? ids.filter((id) => id !== productId) : [...ids, productId]
    mutate(optimisticIds, { revalidate: false })

    try {
      const result = await toggleWishlist(productId)
      mutate(result.wishlisted ? [...optimisticIds.filter((id) => id !== productId), productId] : optimisticIds, {
        revalidate: false,
      })
    } catch {
      mutate(ids, { revalidate: false })
      toast.error("Sign in to save items to your wishlist")
    }
  }

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      whileTap={{ scale: 0.85 }}
      aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={isWishlisted}
      className={cn(
        "flex size-8 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm ring-1 ring-border/60 backdrop-blur transition-colors hover:bg-background",
        className,
      )}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={isWishlisted ? "on" : "off"}
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.5, opacity: 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 20 }}
          className="flex"
        >
          <Heart className={cn("size-4 transition-colors", isWishlisted && "fill-destructive text-destructive")} />
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}

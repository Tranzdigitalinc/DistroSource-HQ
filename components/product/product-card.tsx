"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import Image from "next/image"
import { AnimatePresence, motion } from "motion/react"
import { toast } from "sonner"
import { mutate } from "swr"
import { Star, ShoppingCart, Layers, Loader2, Check } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PriceDisplay } from "@/components/price-display"
import { BrandThumbnail } from "@/components/product/brand-thumbnail"
import { WishlistButton } from "@/components/product/wishlist-button"
import { FlagIcon } from "@/components/flag-icon"
import { addToCart } from "@/lib/actions/cart"
import { cn } from "@/lib/utils"

const MotionDiv = motion.create("div")
const MotionButton = motion.create("button")

export interface ProductCardData {
  product: {
    id: number
    slug: string
    name: string
    imageUrl: string | null
    isDeal: boolean
    rating: string
    reviewCount: number
  }
  brand: { name: string; logoUrl: string | null; brandColor?: string | null }
  category: { slug: string }
  country?: { code: string; flagEmoji: string | null } | null
  variants: { id?: number; priceUsd: string; faceValueUsd: string; discountPercent: number }[]
  minPrice?: number
}

export function ProductCard({
  item,
  className,
  style,
}: {
  item: ProductCardData
  className?: string
  style?: React.CSSProperties
}) {
  const [isPending, startTransition] = useTransition()
  const [justAdded, setJustAdded] = useState(false)
  const cheapest = item.variants.reduce(
    (min, v) => (Number.parseFloat(v.priceUsd) < Number.parseFloat(min.priceUsd) ? v : min),
    item.variants[0],
  )
  const maxDiscount = Math.max(...item.variants.map((v) => v.discountPercent), 0)
  const hasMultipleOffers = item.variants.length > 1
  const href = `/products/${item.product.slug}`

  useEffect(() => {
    if (!justAdded) return
    const timeout = setTimeout(() => setJustAdded(false), 1600)
    return () => clearTimeout(timeout)
  }, [justAdded])

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault()
    if (!cheapest.id || isPending) return
    startTransition(async () => {
      try {
        await addToCart(item.product.id, cheapest.id!, 1)
        mutate("/api/cart/summary")
        setJustAdded(true)
        toast.success("Added to cart", { description: item.product.name })
      } catch {
        toast.error("Couldn't add this to your cart. Please try again.")
      }
    })
  }

  return (
    <MotionDiv
      style={style}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300",
        "hover:border-accent/40 hover:shadow-[0_0_0_1px_var(--accent),0_16px_40px_-12px_var(--glow)]",
        className,
      )}
    >
      <Link href={href} className="relative block aspect-[4/3] w-full overflow-hidden border-b border-border/60">
        {item.product.imageUrl ? (
          <Image
            src={item.product.imageUrl || "/placeholder.svg"}
            alt={item.product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <BrandThumbnail
            logoUrl={item.brand.logoUrl}
            brandColor={item.brand.brandColor ?? null}
            brandName={item.brand.name}
            className="transition-transform duration-500 group-hover:scale-[1.05]"
          />
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {maxDiscount > 0 && (
          <Badge className="absolute left-2.5 top-2.5 border-none bg-accent font-semibold text-accent-foreground shadow-sm shadow-accent/30">
            -{maxDiscount}%
          </Badge>
        )}
        {item.country?.code && (
          <span
            className={cn(
              "absolute top-2.5 flex h-6 items-center justify-center rounded-full bg-background/95 px-1.5 shadow-sm ring-1 ring-border/60",
              maxDiscount > 0 ? "left-16" : "left-2.5",
            )}
          >
            <FlagIcon code={item.country.code} className="h-3 w-4" />
          </span>
        )}
      </Link>
      <WishlistButton productId={item.product.id} className="absolute right-2.5 top-2.5 z-10" />

      <Link href={href} className="flex flex-1 flex-col gap-2 p-4 pb-3">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {item.brand.name}
        </span>
        <h3 className="-mt-1 line-clamp-2 text-sm font-medium leading-snug text-balance text-foreground transition-colors group-hover:text-accent">
          {item.product.name}
        </h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3 fill-accent text-accent" />
          <span className="font-medium text-foreground">{item.product.rating}</span>
          <span>({item.product.reviewCount.toLocaleString()})</span>
        </div>
      </Link>

      <div className="flex flex-col gap-3 border-t border-border/60 px-4 pb-4 pt-3">
        <div className="flex items-baseline gap-2">
          {hasMultipleOffers && (
            <span className="text-[11px] font-medium text-muted-foreground">From</span>
          )}
          <span className="font-display text-lg font-semibold text-foreground">
            <PriceDisplay usdAmount={Number.parseFloat(cheapest.priceUsd)} />
          </span>
          {Number.parseFloat(cheapest.faceValueUsd) > Number.parseFloat(cheapest.priceUsd) && (
            <span className="text-xs text-muted-foreground line-through">
              <PriceDisplay usdAmount={Number.parseFloat(cheapest.faceValueUsd)} />
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <MotionButton
            type="button"
            onClick={handleQuickAdd}
            disabled={isPending}
            aria-label="Add cheapest offer to cart"
            whileTap={{ scale: 0.96 }}
            className={cn(
              "relative flex h-9 flex-1 items-center justify-center gap-1.5 overflow-hidden whitespace-nowrap rounded-md px-2 text-[11px] font-semibold transition-colors disabled:opacity-70",
              justAdded
                ? "bg-success text-success-foreground"
                : "bg-accent text-accent-foreground shadow-sm shadow-accent/25 hover:bg-accent/90",
            )}
          >
            <AnimatePresence mode="wait" initial={false}>
              {isPending ? (
                <motion.span
                  key="loading"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  className="flex items-center gap-1.5"
                >
                  <Loader2 className="size-3.5 shrink-0 animate-spin" />
                  Adding
                </motion.span>
              ) : justAdded ? (
                <motion.span
                  key="added"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  className="flex items-center gap-1.5"
                >
                  <Check className="size-3.5 shrink-0" />
                  Added
                </motion.span>
              ) : (
                <motion.span
                  key="add"
                  initial={{ opacity: 0, scale: 0.85 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.85 }}
                  className="flex items-center gap-1.5"
                >
                  <ShoppingCart className="size-3.5 shrink-0" />
                  Add
                </motion.span>
              )}
            </AnimatePresence>
          </MotionButton>
          <Link
            href={href}
            className="flex h-9 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-border px-2 text-[11px] font-semibold text-foreground transition-colors hover:border-accent/40 hover:text-accent"
          >
            <Layers className="size-3.5 shrink-0" />
            {hasMultipleOffers ? `${item.variants.length} offers` : "View offer"}
          </Link>
        </div>
      </div>
    </MotionDiv>
  )
}

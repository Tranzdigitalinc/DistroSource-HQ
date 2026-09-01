"use client"

import { useTransition } from "react"
import Link from "next/link"
import { motion } from "motion/react"
import { toast } from "sonner"
import { mutate } from "swr"
import { Star, ShoppingCart, Layers } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PriceDisplay } from "@/components/price-display"
import { BrandThumbnail } from "@/components/product/brand-thumbnail"
import { WishlistButton } from "@/components/product/wishlist-button"
import { FlagIcon } from "@/components/flag-icon"
import { addToCart } from "@/lib/actions/cart"
import { cn } from "@/lib/utils"

const MotionDiv = motion.create("div")

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
  const cheapest = item.variants.reduce(
    (min, v) => (Number.parseFloat(v.priceUsd) < Number.parseFloat(min.priceUsd) ? v : min),
    item.variants[0],
  )
  const maxDiscount = Math.max(...item.variants.map((v) => v.discountPercent), 0)
  const hasMultipleOffers = item.variants.length > 1
  const href = `/products/${item.product.slug}`

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault()
    if (!cheapest.id || isPending) return
    startTransition(async () => {
      try {
        await addToCart(item.product.id, cheapest.id!, 1)
        mutate("/api/cart/summary")
        toast.success("Added to cart", { description: item.product.name })
      } catch {
        toast.error("Couldn't add this to your cart. Please try again.")
      }
    })
  }

  return (
    <MotionDiv
      style={style}
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors duration-300 hover:border-primary/25 hover:shadow-xl hover:shadow-black/5",
        className,
      )}
    >
      <Link href={href} className="relative block aspect-[4/3] w-full overflow-hidden border-b border-border/60">
        <BrandThumbnail
          logoUrl={item.brand.logoUrl}
          brandColor={item.brand.brandColor ?? null}
          brandName={item.brand.name}
          className="transition-transform duration-500 group-hover:scale-[1.04]"
        />
        {maxDiscount > 0 && (
          <Badge className="absolute left-2.5 top-2.5 border-none bg-accent font-semibold text-accent-foreground">
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
        <h3 className="-mt-1 line-clamp-2 text-sm font-medium leading-snug text-balance text-foreground/90">
          {item.product.name}
        </h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3 fill-accent text-accent" />
          <span className="font-medium text-foreground">{item.product.rating}</span>
          <span>({item.product.reviewCount.toLocaleString()})</span>
        </div>
      </Link>

      <div className="flex flex-col gap-2.5 border-t border-border/60 px-4 pb-4 pt-2.5">
        <div className="flex items-baseline gap-2">
          {hasMultipleOffers && (
            <span className="text-[11px] font-medium text-muted-foreground">From</span>
          )}
          <span className="font-display text-lg font-semibold">
            <PriceDisplay usdAmount={Number.parseFloat(cheapest.priceUsd)} />
          </span>
          {Number.parseFloat(cheapest.faceValueUsd) > Number.parseFloat(cheapest.priceUsd) && (
            <span className="text-xs text-muted-foreground line-through">
              <PriceDisplay usdAmount={Number.parseFloat(cheapest.faceValueUsd)} />
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleQuickAdd}
            disabled={isPending}
            aria-label="Add cheapest offer to cart"
            className="flex h-8 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-foreground px-2 text-[11px] font-semibold text-background transition-colors hover:bg-foreground/85 disabled:opacity-50"
          >
            <ShoppingCart className="size-3.5 shrink-0" />
            Add
          </button>
          <Link
            href={href}
            className="flex h-8 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border border-border px-2 text-[11px] font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
          >
            <Layers className="size-3.5 shrink-0" />
            {hasMultipleOffers ? `${item.variants.length} offers` : "View offer"}
          </Link>
        </div>
      </div>
    </MotionDiv>
  )
}

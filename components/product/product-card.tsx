"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PriceDisplay } from "@/components/price-display"
import { BrandThumbnail } from "@/components/product/brand-thumbnail"
import { WishlistButton } from "@/components/product/wishlist-button"
import { FlagIcon } from "@/components/flag-icon"
import { cn } from "@/lib/utils"

const MotionLink = motion.create(Link)

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
  variants: { priceUsd: string; faceValueUsd: string; discountPercent: number }[]
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
  const cheapest = item.variants.reduce(
    (min, v) => (Number.parseFloat(v.priceUsd) < Number.parseFloat(min.priceUsd) ? v : min),
    item.variants[0],
  )
  const maxDiscount = Math.max(...item.variants.map((v) => v.discountPercent), 0)

  return (
    <MotionLink
      href={`/products/${item.product.slug}`}
      style={style}
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={cn(
        "group flex flex-col overflow-hidden rounded-lg border border-border bg-card transition-colors duration-300 hover:border-primary/25 hover:shadow-xl hover:shadow-black/5",
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-border/60">
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
        <WishlistButton productId={item.product.id} className="absolute right-2.5 top-2.5" />
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
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
        <div className="mt-1 flex items-baseline gap-2 border-t border-border/60 pt-2.5">
          <span className="font-display text-lg font-semibold">
            <PriceDisplay usdAmount={Number.parseFloat(cheapest.priceUsd)} />
          </span>
          {Number.parseFloat(cheapest.faceValueUsd) > Number.parseFloat(cheapest.priceUsd) && (
            <span className="text-xs text-muted-foreground line-through">
              <PriceDisplay usdAmount={Number.parseFloat(cheapest.faceValueUsd)} />
            </span>
          )}
        </div>
      </div>
    </MotionLink>
  )
}

import Link from "next/link"
import { Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PriceDisplay } from "@/components/price-display"
import { BrandThumbnail } from "@/components/product/brand-thumbnail"
import { WishlistButton } from "@/components/product/wishlist-button"
import { FlagIcon } from "@/components/flag-icon"
import { cn } from "@/lib/utils"

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
    <Link
      href={`/products/${item.product.slug}`}
      style={style}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <BrandThumbnail
          logoUrl={item.brand.logoUrl}
          brandColor={item.brand.brandColor ?? null}
          brandName={item.brand.name}
          className="transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 py-2">
          <span className="font-display text-sm font-bold text-white drop-shadow-sm">{item.brand.name}</span>
        </div>
        {maxDiscount > 0 && (
          <Badge className="absolute left-2 top-2 bg-accent text-accent-foreground">-{maxDiscount}%</Badge>
        )}
        {item.country?.code && (
          <span
            className={cn(
              "absolute top-2 flex h-6 items-center justify-center rounded-full bg-background/90 px-1.5 shadow-sm",
              maxDiscount > 0 ? "left-14" : "left-2",
            )}
          >
            <FlagIcon code={item.country.code} className="h-3 w-4" />
          </span>
        )}
        <WishlistButton productId={item.product.id} className="absolute right-2 top-2" />
      </div>
      <div className="flex flex-1 flex-col gap-1.5 p-3.5">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-balance">{item.product.name}</h3>
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <Star className="size-3 fill-accent text-accent" />
          <span className="font-medium text-foreground">{item.product.rating}</span>
          <span>({item.product.reviewCount.toLocaleString()})</span>
        </div>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="font-display text-base font-bold">
            <PriceDisplay usdAmount={Number.parseFloat(cheapest.priceUsd)} />
          </span>
          {Number.parseFloat(cheapest.faceValueUsd) > Number.parseFloat(cheapest.priceUsd) && (
            <span className="text-xs text-muted-foreground line-through">
              <PriceDisplay usdAmount={Number.parseFloat(cheapest.faceValueUsd)} />
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

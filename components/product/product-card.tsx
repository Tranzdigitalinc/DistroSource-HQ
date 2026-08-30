import Link from "next/link"
import Image from "next/image"
import { Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PriceDisplay } from "@/components/price-display"
import { getCategoryImage } from "@/lib/category-icons"
import { cn } from "@/lib/utils"

export interface ProductCardData {
  product: {
    slug: string
    name: string
    imageUrl: string | null
    isDeal: boolean
    rating: string
    reviewCount: number
  }
  brand: { name: string; logoUrl: string | null }
  category: { slug: string }
  country?: { code: string; flagEmoji: string | null } | null
  variants: { priceUsd: string; faceValueUsd: string; discountPercent: number }[]
  minPrice?: number
}

export function ProductCard({ item, className }: { item: ProductCardData; className?: string }) {
  const cheapest = item.variants.reduce(
    (min, v) => (Number.parseFloat(v.priceUsd) < Number.parseFloat(min.priceUsd) ? v : min),
    item.variants[0],
  )
  const maxDiscount = Math.max(...item.variants.map((v) => v.discountPercent), 0)

  return (
    <Link
      href={`/products/${item.product.slug}`}
      className={cn(
        "group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5",
        className,
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-secondary">
        <Image
          src={item.product.imageUrl || getCategoryImage(item.category.slug)}
          alt={item.product.name}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          sizes="(max-width: 768px) 50vw, 25vw"
        />
        {item.brand.logoUrl && (
          <div className="absolute left-2 top-2 flex size-9 items-center justify-center rounded-lg bg-white p-1.5 shadow-sm">
            <Image
              src={item.brand.logoUrl || "/placeholder.svg"}
              alt={`${item.brand.name} logo`}
              width={28}
              height={28}
              className="size-full object-contain"
            />
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
          <span className="font-display text-sm font-bold text-white drop-shadow-sm">{item.brand.name}</span>
        </div>
        {maxDiscount > 0 && (
          <Badge className="absolute right-2 top-2 bg-accent text-accent-foreground">-{maxDiscount}%</Badge>
        )}
        {item.country?.flagEmoji && (
          <span className="absolute right-2 top-11 flex size-6 items-center justify-center rounded-full bg-background/90 text-sm shadow-sm">
            {item.country.flagEmoji}
          </span>
        )}
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

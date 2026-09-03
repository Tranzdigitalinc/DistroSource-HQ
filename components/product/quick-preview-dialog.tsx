"use client"

import Image from "next/image"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { PriceDisplay } from "@/components/price-display"
import { ImageOff, Star, ArrowRight } from "@/lib/storefront-icons"
import { getSourceTypeLabel } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { ProductCardData } from "@/components/product/product-card"

export function QuickPreviewDialog({
  item,
  open,
  onOpenChange,
}: {
  item: ProductCardData
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const image = item.product.thumbnailUrl ?? item.product.coverImageUrl ?? item.images[0]?.url ?? null
  const gallery = item.images.slice(0, 4)
  const isFree = item.product.isFree || item.startingPrice === 0
  const href = `/products/${item.product.slug}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl gap-0 overflow-hidden rounded-[4px] p-0">
        <div className="grid gap-0 sm:grid-cols-2">
          <div className="relative aspect-square w-full bg-secondary sm:aspect-auto">
            {image ? (
              <Image src={image || "/placeholder.svg"} alt={item.product.name} fill className="object-cover" sizes="(max-width: 640px) 100vw, 50vw" />
            ) : (
              <div className="flex h-full min-h-64 w-full items-center justify-center text-muted-foreground/40">
                <ImageOff className="size-10" />
              </div>
            )}
            {gallery.length > 1 && (
              <div className="absolute inset-x-3 bottom-3 flex gap-1.5">
                {gallery.map((img, i) => (
                  <div key={img.id} className={cn("h-1 flex-1 rounded-full", i === 0 ? "bg-background" : "bg-background/40")} />
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3 p-6">
            <DialogHeader className="gap-1.5 text-left">
              <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                {item.department ? `${item.department.name} / ${item.category.name}` : item.category.name}
              </span>
              <DialogTitle className="text-balance text-xl font-bold leading-snug">{item.product.name}</DialogTitle>
              {item.product.tagline && (
                <DialogDescription className="text-pretty text-sm text-muted-foreground">
                  {item.product.tagline}
                </DialogDescription>
              )}
            </DialogHeader>

            {item.reviewCount > 0 && (
              <div className="flex items-center gap-1 font-mono text-xs text-muted-foreground">
                <Star className="size-3.5 fill-accent text-accent" />
                <span className="font-semibold text-foreground">{item.avgRating.toFixed(1)}</span>
                <span>({item.reviewCount} reviews)</span>
              </div>
            )}

            <Badge variant="outline" className="w-fit rounded-none font-mono text-[10px] font-semibold uppercase tracking-[0.04em]">
              {getSourceTypeLabel(item.product.sourceType)}
            </Badge>

            {item.product.fileFormats.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {item.product.fileFormats.slice(0, 6).map((format) => (
                  <Badge key={format} variant="secondary" className="rounded-none font-mono text-[10px] uppercase tracking-[0.02em]">
                    {format}
                  </Badge>
                ))}
              </div>
            )}

            <div className="mt-auto flex items-baseline gap-2 border-t border-border pt-4 font-mono">
              <span className="text-2xl font-bold text-foreground">
                {isFree ? "Free" : <PriceDisplay usdAmount={item.startingPrice} />}
              </span>
              {item.product.compareAtPrice && Number.parseFloat(item.product.compareAtPrice) > item.startingPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  <PriceDisplay usdAmount={item.product.compareAtPrice} />
                </span>
              )}
            </div>

            <Link
              href={href}
              className="flex h-11 w-full items-center justify-center gap-1.5 rounded-[3px] bg-primary px-4 font-mono text-sm font-semibold uppercase tracking-[0.02em] text-primary-foreground transition-colors hover:bg-primary/90"
            >
              View full details
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

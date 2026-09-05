"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { mutate } from "swr"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PriceDisplay } from "@/components/price-display"
import { LicenseSelector } from "@/components/product/license-selector"
import { ArrowRight, Check, ImageOff, Loader2, ShoppingCart, Star, ICON_SIZE } from "@/lib/storefront-icons"
import { addToCart } from "@/lib/actions/cart"
import { getSourceTypeLabel } from "@/lib/format"
import { licenseLabel } from "@/lib/licenses"
import { cn } from "@/lib/utils"
import type { ProductCardData } from "@/components/product/product-card"

/**
 * Quick preview: gallery, essentials, licence choice and Add to cart without
 * leaving the grid. Uses the same LicenseSelector as the product page so the
 * two never disagree.
 */
export function QuickPreviewDialog({ item, open, onOpenChange }: { item: ProductCardData; open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter()
  const primary = item.product.thumbnailUrl ?? item.product.coverImageUrl ?? item.images[0]?.url ?? null
  const gallery = [primary, ...item.images.map((i) => i.url)].filter((u, i, arr): u is string => !!u && arr.indexOf(u) === i).slice(0, 5)
  const [active, setActive] = useState(0)
  const [licenseId, setLicenseId] = useState<number | undefined>(item.licenses[0]?.id)
  const [isPending, startTransition] = useTransition()
  const [justAdded, setJustAdded] = useState(false)

  // Reset transient state each time the dialog opens — derived from the
  // previous `open` value during render, not in an effect.
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setActive(0)
      setJustAdded(false)
    }
  }

  const isFree = item.product.isFree || item.startingPrice === 0
  const href = `/products/${item.product.slug}`
  const selected = item.licenses.find((l) => l.id === licenseId) ?? item.licenses[0]
  const price = selected ? Number.parseFloat(selected.price) : item.startingPrice
  const compareAt = item.product.compareAtPrice ? Number.parseFloat(item.product.compareAtPrice) : 0
  const current = gallery[active] ?? null
  const isOriginal = item.product.sourceType === "distrosource_original" && item.product.rightsStatus === "original"

  function handleAdd() {
    if (!selected) return
    startTransition(async () => {
      try {
        await addToCart(item.product.id, selected.id, 1)
        await mutate("/api/cart/summary")
        setJustAdded(true)
        toast.success("Added to cart", { description: `${item.product.name} · ${licenseLabel(selected.licenseType)} licence` })
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Couldn't add this to your cart.")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[calc(100%-2rem)] gap-0 overflow-hidden rounded-lg p-0 sm:max-w-3xl">
        <div className="grid gap-0 sm:grid-cols-[1.1fr_1fr]">
          <div className="flex flex-col bg-secondary">
            <div className="relative aspect-[4/3] w-full">
              {current ? (
                <Image src={current} alt={`${item.product.name} preview ${active + 1}`} fill className="object-cover" sizes="(max-width: 640px) 100vw, 55vw" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                  <ImageOff size={40} aria-hidden="true" />
                </div>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-1.5 border-t border-border/60 bg-card p-2" role="tablist" aria-label="Preview images">
                {gallery.map((url, i) => (
                  <button
                    key={url}
                    type="button"
                    role="tab"
                    aria-selected={i === active}
                    aria-label={`Preview ${i + 1}`}
                    onClick={() => setActive(i)}
                    className={cn("relative aspect-[4/3] w-14 overflow-hidden rounded-md border transition-colors", i === active ? "border-foreground" : "border-transparent hover:border-border-strong")}
                  >
                    <Image src={url} alt="" fill className="object-cover" sizes="56px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex max-h-[80vh] flex-col gap-3 overflow-y-auto p-5 sm:p-6">
            <DialogHeader className="gap-1 text-left">
              <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                {item.department ? `${item.department.name} / ${item.category.name}` : item.category.name}
              </span>
              <DialogTitle className="font-display text-balance text-lg font-bold leading-snug">{item.product.name}</DialogTitle>
              {item.product.tagline && <DialogDescription className="text-pretty text-sm leading-relaxed text-muted-foreground">{item.product.tagline}</DialogDescription>}
            </DialogHeader>

            {item.reviewCount > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star size={ICON_SIZE.sm} className="fill-primary text-primary" aria-hidden="true" />
                <span className="font-semibold text-foreground">{item.avgRating.toFixed(1)}</span>
                <span>({item.reviewCount} {item.reviewCount === 1 ? "review" : "reviews"})</span>
              </div>
            )}

            <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
              <dt className="text-muted-foreground">Source</dt>
              <dd className="font-medium text-foreground">{isOriginal ? "DistroSource Original" : getSourceTypeLabel(item.product.sourceType)}</dd>
              {item.product.fileFormats.length > 0 && (
                <>
                  <dt className="text-muted-foreground">Formats</dt>
                  <dd className="text-foreground">{item.product.fileFormats.slice(0, 6).map((f) => f.toUpperCase()).join(", ")}</dd>
                </>
              )}
              {item.product.softwareCompatibility?.length > 0 && (
                <>
                  <dt className="text-muted-foreground">Works with</dt>
                  <dd className="text-foreground">{item.product.softwareCompatibility.slice(0, 4).join(", ")}</dd>
                </>
              )}
            </dl>

            {!isFree && item.licenses.length > 0 && (
              <LicenseSelector licenses={item.licenses} value={selected?.id} onChange={setLicenseId} compact showCompareLink={false} />
            )}

            <div className="mt-auto flex items-baseline gap-2 border-t border-border pt-3">
              <span className="font-display text-2xl font-bold tabular-nums text-foreground">{isFree ? "Free" : <PriceDisplay usdAmount={price} />}</span>
              {compareAt > price && (
                <span className="text-sm text-muted-foreground line-through">
                  <PriceDisplay usdAmount={compareAt} />
                </span>
              )}
              {!isFree && selected && <span className="text-xs text-muted-foreground">{licenseLabel(selected.licenseType)} licence</span>}
            </div>

            <div className="flex gap-2">
              {!isFree && selected && (
                <Button onClick={handleAdd} disabled={isPending || justAdded} className={cn("h-11 flex-1 font-semibold", justAdded && "bg-success hover:bg-success")}>
                  {isPending ? <Loader2 size={ICON_SIZE.base} className="animate-spin" aria-hidden="true" /> : justAdded ? <Check size={ICON_SIZE.base} aria-hidden="true" /> : <ShoppingCart size={ICON_SIZE.base} aria-hidden="true" />}
                  {justAdded ? "Added" : "Add to cart"}
                </Button>
              )}
              <Button variant={isFree ? "default" : "outline"} render={<Link href={href} />} nativeButton={false} className={cn("h-11 font-semibold", isFree ? "flex-1" : "bg-transparent")}>
                View details
                <ArrowRight size={ICON_SIZE.base} aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

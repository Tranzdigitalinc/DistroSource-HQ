"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { mutate } from "swr"
import { Check, Eye, Gift, ImageOff, Loader2, ShieldCheck, ShoppingCart, Star } from "@/lib/storefront-icons"
import { PriceDisplay } from "@/components/price-display"
import { WishlistButton } from "@/components/product/wishlist-button"
import { QuickPreviewDialog } from "@/components/product/quick-preview-dialog"
import { addToCart } from "@/lib/actions/cart"
import { claimFreeProduct } from "@/lib/actions/free-products"
import { getSourceTypeLabel } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { getProducts } from "@/lib/queries/catalog"

export type ProductCardData = Awaited<ReturnType<typeof getProducts>>[number]

const NEW_WINDOW_DAYS = 30

function isRecentlyReleased(releaseDate: Date | string | null | undefined): boolean {
  if (!releaseDate) return false
  const released = new Date(releaseDate).getTime()
  if (Number.isNaN(released)) return false
  return Date.now() - released < NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000
}

export function ProductCard({
  item,
  className,
  style,
  variant = "default",
}: {
  item: ProductCardData
  className?: string
  style?: React.CSSProperties
  variant?: "default" | "featured"
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [justAdded, setJustAdded] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

  const cheapestLicense = item.licenses.length
    ? item.licenses.reduce((min, license) =>
        Number.parseFloat(license.price) < Number.parseFloat(min.price) ? license : min,
      item.licenses[0])
    : null
  const hasMultipleLicenses = item.licenses.length > 1
  const href = `/products/${item.product.slug}`
  const image = item.product.coverImageUrl ?? item.images[0]?.url ?? item.product.thumbnailUrl ?? null
  const isFree = item.product.isFree || item.startingPrice === 0
  const compareAt = item.product.compareAtPrice ? Number.parseFloat(item.product.compareAtPrice) : null
  const isOnSale = compareAt !== null && compareAt > item.startingPrice && !isFree
  const savingsPercent = isOnSale && compareAt ? Math.round(((compareAt - item.startingPrice) / compareAt) * 100) : 0
  const isNew = !isFree && (item.product.isNewRelease || isRecentlyReleased(item.product.releaseDate))
  const isOriginal = item.product.sourceType === "distrosource_original" && item.product.rightsStatus === "original"
  const featured = variant === "featured"

  const meta = [
    ...(item.product.softwareCompatibility?.slice(0, 1) ?? []),
    ...(item.product.fileFormats?.length ? [item.product.fileFormats.slice(0, 2).map((format) => format.toUpperCase()).join(", ")] : []),
  ].join(" · ")

  useEffect(() => {
    if (!justAdded) return
    const timeout = setTimeout(() => setJustAdded(false), 1600)
    return () => clearTimeout(timeout)
  }, [justAdded])

  function handlePrimaryAction(event: React.MouseEvent) {
    event.preventDefault()
    if (isPending) return
    startTransition(async () => {
      try {
        if (isFree) {
          const result = await claimFreeProduct(item.product.id)
          if (result.requiresSignIn) {
            router.push(`/sign-in?redirect=${encodeURIComponent(href)}`)
            return
          }
          setJustAdded(true)
          toast.success(result.alreadyOwned ? "Already in your library" : "Added to your library")
          router.refresh()
          return
        }
        if (!cheapestLicense) return
        await addToCart(item.product.id, cheapestLicense.id, 1)
        await mutate("/api/cart/summary")
        setJustAdded(true)
        toast.success("Added to cart", { description: item.product.name })
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.")
      }
    })
  }

  return (
    <>
      <article
        style={style}
        className={cn(
          "@container group relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border border-border/80 bg-card",
          "transition-[transform,border-color,box-shadow] duration-300 hover:-translate-y-1 hover:border-border-strong hover:shadow-[0_20px_60px_-32px_color-mix(in_oklch,var(--foreground)_30%,transparent)] motion-reduce:transform-none motion-reduce:transition-none",
          className,
        )}
      >
        <Link
          href={href}
          className={cn("relative block w-full overflow-hidden bg-secondary/50", featured ? "aspect-[16/10]" : "aspect-[4/3]")}
          tabIndex={-1}
          aria-hidden="true"
        >
          {image ? (
            <Image
              src={image}
              alt=""
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              sizes={featured ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-muted-foreground/35">
              <ImageOff size={featured ? 42 : 32} aria-hidden="true" />
            </span>
          )}

          <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3.5">
            <div className="flex flex-wrap gap-1.5">
              {isFree && <span className="rounded-full bg-navy px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-navy-foreground">Free</span>}
              {!isFree && isNew && <span className="rounded-full bg-background/92 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-foreground backdrop-blur">New</span>}
              {isOnSale && savingsPercent > 0 && <span className="rounded-full bg-primary px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-primary-foreground">−{savingsPercent}%</span>}
            </div>
          </div>

          <div className="pointer-events-none absolute inset-x-0 bottom-0 flex translate-y-2 justify-center pb-3 opacity-0 transition-[opacity,transform] duration-200 group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none">
            <span className="rounded-full border border-white/20 bg-black/55 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur-md">Quick preview</span>
          </div>
        </Link>

        <WishlistButton productId={item.product.id} className="absolute right-3 top-3 z-10 rounded-full" />

        <div className={cn("flex flex-1 flex-col", featured ? "p-5 sm:p-6" : "p-4")}> 
          <div className="flex min-w-0 items-center gap-2 font-mono text-[9px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            <span className="truncate">{item.category.name}</span>
            {isOriginal && (
              <span className="ml-auto inline-flex shrink-0 items-center gap-1 normal-case tracking-normal text-foreground">
                <ShieldCheck size={11} className="text-success" aria-hidden="true" /> Original
              </span>
            )}
          </div>

          <h3 className={cn("mt-2 font-display font-bold leading-snug tracking-[-0.02em] text-foreground", featured ? "text-xl sm:text-2xl" : "text-[15px]")}> 
            <Link href={href} className="line-clamp-2 transition-colors hover:text-primary focus-visible:outline-none">
              {item.product.name}
            </Link>
          </h3>

          {(featured || item.product.tagline) && (
            <p className={cn("mt-2 line-clamp-2 leading-relaxed text-muted-foreground", featured ? "text-sm" : "text-xs")}> 
              {item.product.tagline || meta}
            </p>
          )}

          <div className="mt-auto pt-4">
            <div className="flex min-h-5 items-center gap-2 text-[10px] text-muted-foreground">
              {item.reviewCount > 0 ? (
                <span className="flex items-center gap-1">
                  <Star size={12} className="fill-primary text-primary" aria-hidden="true" />
                  <strong className="text-foreground">{item.avgRating.toFixed(1)}</strong>
                  <span>({item.reviewCount})</span>
                </span>
              ) : (
                <span className="truncate">{meta || getSourceTypeLabel(item.product.sourceType)}</span>
              )}
            </div>

            <div className="mt-3 flex items-center justify-between gap-3 border-t border-border/70 pt-3.5">
              <div className="min-w-0">
                {hasMultipleLicenses && !isFree && <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">From</p>}
                <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                  <span className={cn("font-display font-black tracking-tight text-foreground", featured ? "text-2xl" : "text-lg")}> 
                    {isFree ? "Free" : <PriceDisplay usdAmount={item.startingPrice} />}
                  </span>
                  {isOnSale && compareAt && <span className="text-xs text-muted-foreground line-through"><PriceDisplay usdAmount={compareAt} /></span>}
                </div>
              </div>

              <div className="relative z-10 flex shrink-0 items-center gap-1.5">
                <button
                  type="button"
                  onClick={(event) => {
                    event.preventDefault()
                    setPreviewOpen(true)
                  }}
                  aria-label={`Quick preview of ${item.product.name}`}
                  className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <Eye size={15} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={handlePrimaryAction}
                  disabled={isPending || (!isFree && !cheapestLicense)}
                  aria-label={isFree ? `Get ${item.product.name} for free` : `Add ${item.product.name} to cart`}
                  className={cn(
                    "flex h-9 items-center justify-center gap-1.5 rounded-full px-3.5 text-xs font-bold transition-[background-color,transform] active:scale-[0.97] disabled:opacity-60 motion-reduce:transition-none",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                    justAdded ? "bg-success text-success-foreground" : "bg-foreground text-background hover:bg-primary hover:text-primary-foreground",
                  )}
                >
                  {isPending ? <Loader2 size={14} className="animate-spin" aria-hidden="true" /> : justAdded ? <Check size={14} aria-hidden="true" /> : isFree ? <Gift size={14} aria-hidden="true" /> : <ShoppingCart size={14} aria-hidden="true" />}
                  <span className="hidden @[220px]:inline">{isPending ? "Adding" : justAdded ? "Added" : isFree ? "Get" : "Add"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </article>

      <QuickPreviewDialog item={item} open={previewOpen} onOpenChange={setPreviewOpen} />
    </>
  )
}

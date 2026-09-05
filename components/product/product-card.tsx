"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { mutate } from "swr"
import { Check, Eye, Gift, ImageOff, Loader2, ShieldCheck, ShoppingCart, Star, ICON_SIZE } from "@/lib/storefront-icons"
import { PriceDisplay } from "@/components/price-display"
import { WishlistButton } from "@/components/product/wishlist-button"
import { QuickPreviewDialog } from "@/components/product/quick-preview-dialog"
import { addToCart } from "@/lib/actions/cart"
import { useCartDrawer } from "@/components/cart/cart-drawer"
import { claimFreeProduct } from "@/lib/actions/free-products"
import { getSourceTypeLabel } from "@/lib/format"
import { cn } from "@/lib/utils"
import type { getProducts } from "@/lib/queries/catalog"

export type ProductCardData = Awaited<ReturnType<typeof getProducts>>[number]

/** A product counts as new for 30 days after release. */
const NEW_WINDOW_DAYS = 30

function isRecentlyReleased(releaseDate: Date | string | null | undefined): boolean {
  if (!releaseDate) return false
  const released = new Date(releaseDate).getTime()
  if (Number.isNaN(released)) return false
  return Date.now() - released < NEW_WINDOW_DAYS * 24 * 60 * 60 * 1000
}

/**
 * The one product card used across the storefront (catalog, rails, related,
 * wishlist). Compact and product-first: preview, category, name, format /
 * software, source, price. Hover reveals Quick preview and Add to cart;
 * both stay reachable by keyboard and on touch via the action row.
 *
 * Badges are derived from database state only — NEW (release date),
 * SALE (compare-at price), Original (sourceType + rightsStatus). No
 * "best seller" / "popular" / synthetic stars.
 */
export function ProductCard({ item, className, style }: { item: ProductCardData; className?: string; style?: React.CSSProperties }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [justAdded, setJustAdded] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)
  const { openCart } = useCartDrawer()

  const cheapestLicense = item.licenses.length
    ? item.licenses.reduce((min, l) => (Number.parseFloat(l.price) < Number.parseFloat(min.price) ? l : min), item.licenses[0])
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

  const meta = [
    ...(item.product.softwareCompatibility?.slice(0, 1) ?? []),
    ...(item.product.fileFormats?.length ? [item.product.fileFormats.slice(0, 2).map((f) => f.toUpperCase()).join(", ")] : []),
  ].join(" • ")

  useEffect(() => {
    if (!justAdded) return
    const timeout = setTimeout(() => setJustAdded(false), 1600)
    return () => clearTimeout(timeout)
  }, [justAdded])

  function handlePrimaryAction(e: React.MouseEvent) {
    e.preventDefault()
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
        openCart()
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
          "@container group relative flex h-full flex-col overflow-hidden rounded-lg border border-border bg-card",
          "transition-[border-color,box-shadow] duration-200 hover:border-border-strong hover:shadow-[var(--shadow-e2)] motion-reduce:transition-none",
          "focus-within:border-border-strong",
          className,
        )}
      >
        <Link href={href} className="relative block aspect-[4/3] w-full overflow-hidden bg-secondary/60" tabIndex={-1} aria-hidden="true">
          {image ? (
            <Image
              src={image}
              alt=""
              fill
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-muted-foreground/40">
              <ImageOff size={32} aria-hidden="true" />
            </span>
          )}

          <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
            {isFree ? (
              <span className="rounded bg-navy px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-navy-foreground">Free</span>
            ) : isNew ? (
              <span className="rounded bg-navy px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-navy-foreground">New</span>
            ) : null}
            {isOnSale && savingsPercent > 0 && (
              <span className="rounded bg-primary px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-primary-foreground">Sale −{savingsPercent}%</span>
            )}
          </div>

          {/* Hover actions: pointer-only affordance; the real buttons live in the action row below for keyboard/touch. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-2.5 bottom-2.5 flex translate-y-1 justify-center gap-1.5 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none"
          >
            <span className="rounded-md bg-background/95 px-2.5 py-1.5 text-[11px] font-semibold text-foreground shadow-[var(--shadow-e2)]">Quick preview</span>
          </span>
        </Link>

        <WishlistButton productId={item.product.id} className="absolute right-2 top-2 z-10" />

        <div className="flex flex-1 flex-col gap-1.5 p-3.5">
          <p className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            <span className="truncate">{item.category.name}</span>
            {isOriginal && (
              <span className="ml-auto flex shrink-0 items-center gap-1 normal-case tracking-normal text-foreground">
                <ShieldCheck size={11} className="text-success" aria-hidden="true" />
                Original
              </span>
            )}
          </p>

          <h3 className="line-clamp-2 text-[13.5px] font-semibold leading-snug text-foreground">
            <Link href={href} className="transition-colors after:absolute after:inset-0 hover:text-primary focus-visible:outline-none">
              {item.product.name}
            </Link>
          </h3>

          <p className="mt-auto truncate pt-1 text-xs text-muted-foreground">
            {meta || item.product.tagline}
            {meta && !isOriginal ? ` · ${getSourceTypeLabel(item.product.sourceType)}` : ""}
          </p>

          {/* Rating renders only when real reviews exist. */}
          {item.reviewCount > 0 && (
            <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
              <Star size={12} className="fill-primary text-primary" aria-hidden="true" />
              <span className="font-semibold text-foreground">{item.avgRating.toFixed(1)}</span>({item.reviewCount})
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-1.5 border-t border-border px-3.5 py-2.5">
          <div className="flex min-w-0 items-baseline gap-1 overflow-hidden">
            {hasMultipleLicenses && !isFree && (
              <span className="hidden shrink-0 text-[10px] font-medium text-muted-foreground @[190px]:inline">From</span>
            )}
            <span className="truncate font-display text-base font-bold tabular-nums text-foreground">
              {isFree ? "Free" : <PriceDisplay usdAmount={item.startingPrice} />}
            </span>
            {isOnSale && compareAt && (
              <span className="hidden shrink-0 text-xs text-muted-foreground line-through @[230px]:inline">
                <PriceDisplay usdAmount={compareAt} />
              </span>
            )}
          </div>

          <div className="relative z-10 flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                setPreviewOpen(true)
              }}
              aria-label={`Quick preview of ${item.product.name}`}
              className="flex size-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Eye size={ICON_SIZE.sm} aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={handlePrimaryAction}
              disabled={isPending || (!isFree && !cheapestLicense)}
              aria-label={isFree ? `Get ${item.product.name} for free` : `Add ${item.product.name} to cart`}
              className={cn(
                "flex h-8 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-[background-color,transform] active:scale-[0.97] disabled:opacity-60 motion-reduce:transition-none",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                justAdded ? "bg-success text-success-foreground" : "bg-primary text-primary-foreground hover:bg-primary/90",
              )}
            >
              {isPending ? (
                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
              ) : justAdded ? (
                <Check size={14} aria-hidden="true" />
              ) : isFree ? (
                <Gift size={14} aria-hidden="true" />
              ) : (
                <ShoppingCart size={14} aria-hidden="true" />
              )}
              <span className="hidden @[210px]:inline">{isPending ? "Adding" : justAdded ? "Added" : isFree ? "Get" : "Add"}</span>
            </button>
          </div>
        </div>
      </article>

      <QuickPreviewDialog item={item} open={previewOpen} onOpenChange={setPreviewOpen} />
    </>
  )
}

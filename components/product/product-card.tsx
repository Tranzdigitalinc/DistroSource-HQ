"use client"
import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Check, Eye, Gift, ImageOff, Loader2, ShieldCheck, ShoppingBag, Star, ICON_SIZE } from "@/lib/storefront-icons"
import { PriceDisplay } from "@/components/price-display"
import { WishlistButton } from "@/components/product/wishlist-button"
import { QuickPreviewDialog } from "@/components/product/quick-preview-dialog"
import { openCartDrawer, refreshCart } from "@/components/cart/cart-drawer-provider"
import { addToCart } from "@/lib/actions/cart"
import { claimFreeProduct } from "@/lib/actions/free-products"
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
 * The one product card used across the storefront. Image-led and quiet:
 * a 16:10 preview, category, name, one line of meta and the price. On
 * hover the action row (Quick view, Add) lifts over the image; the same
 * buttons stay reachable by keyboard and on touch.
 *
 * Badges are derived from database state only — New (release date), Sale
 * (compare-at price), Free. No synthetic popularity.
 */
export function ProductCard({
  item,
  className,
  style,
  priority = false,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw",
}: {
  item: ProductCardData
  className?: string
  style?: React.CSSProperties
  priority?: boolean
  sizes?: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [justAdded, setJustAdded] = useState(false)
  const [previewOpen, setPreviewOpen] = useState(false)

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
  ].join(" · ")

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
        await refreshCart()
        setJustAdded(true)
        openCartDrawer()
        router.refresh()
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Something went wrong. Please try again.")
      }
    })
  }

  const actionBtn =
    "flex h-9 items-center justify-center gap-1.5 rounded-full text-xs font-semibold transition-[background-color,transform,color] active:scale-[0.97] disabled:opacity-60 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

  return (
    <>
      <article
        style={style}
        className={cn(
          "@container group relative flex h-full flex-col rounded-xl border border-border bg-card",
          "transition-[border-color,box-shadow,transform] duration-200 hover:-translate-y-0.5 hover:border-border-strong hover:shadow-[var(--shadow-e3)] motion-reduce:transition-none motion-reduce:hover:translate-y-0",
          "focus-within:border-border-strong",
          className,
        )}
      >
        <Link href={href} className="relative block aspect-[16/10] w-full overflow-hidden rounded-t-[calc(var(--radius)*1.25-1px)] bg-secondary/70" tabIndex={-1} aria-hidden="true">
          {image ? (
            <Image
              src={image}
              alt=""
              fill
              priority={priority}
              className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.035] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
              sizes={sizes}
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-muted-foreground/40">
              <ImageOff size={32} aria-hidden="true" />
            </span>
          )}
          <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-t-[calc(var(--radius)*1.25-1px)] ring-1 ring-inset ring-foreground/[0.06]" />

          <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5">
            {isFree ? (
              <span className="rounded-full bg-navy px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-navy-foreground">Free</span>
            ) : isNew ? (
              <span className="rounded-full bg-navy px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-navy-foreground">New</span>
            ) : null}
            {isOnSale && savingsPercent > 0 && (
              <span className="rounded-full bg-primary px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-primary-foreground">−{savingsPercent}%</span>
            )}
          </div>

          {/* Hover action row over the image (pointer only). The real
              controls live in the footer for keyboard and touch. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-3 bottom-3 hidden translate-y-2 justify-end gap-1.5 opacity-0 transition-all duration-200 group-hover:translate-y-0 group-hover:opacity-100 motion-reduce:transition-none @[220px]:flex"
          >
            <span className="rounded-full bg-background/95 px-3 py-1.5 text-[11px] font-semibold text-foreground shadow-[var(--shadow-e2)] backdrop-blur">Quick view</span>
          </span>
        </Link>

        <WishlistButton
          productId={item.product.id}
          className="absolute right-3 top-3 z-10 rounded-full opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 aria-pressed:opacity-100 max-md:opacity-100"
        />

        <div className="flex flex-1 flex-col gap-1 px-4 pb-3 pt-3.5">
          <p className="flex items-center gap-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            <span className="truncate">{item.category.name}</span>
            {isOriginal && (
              <span className="ml-auto flex shrink-0 items-center gap-1 normal-case tracking-normal text-foreground">
                <ShieldCheck size={11} className="text-success" aria-hidden="true" />
                Original
              </span>
            )}
          </p>

          <h3 className="line-clamp-2 text-[14px] font-semibold leading-snug text-foreground">
            <Link href={href} className="transition-colors after:absolute after:inset-0 after:rounded-xl hover:text-primary focus-visible:outline-none focus-visible:after:ring-2 focus-visible:after:ring-ring">
              {item.product.name}
            </Link>
          </h3>

          {(meta || item.product.tagline) && <p className="mt-auto truncate pt-1 text-xs text-muted-foreground">{meta || item.product.tagline}</p>}

          {item.reviewCount > 0 && (
            <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
              <Star size={12} className="fill-primary text-primary" aria-hidden="true" />
              <span className="font-semibold text-foreground">{item.avgRating.toFixed(1)}</span>({item.reviewCount})
            </span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 px-4 pb-4">
          <div className="flex min-w-0 items-baseline gap-1.5 overflow-hidden">
            {hasMultipleLicenses && !isFree && <span className="hidden shrink-0 text-[11px] text-muted-foreground @[200px]:inline">from</span>}
            <span className="truncate font-display text-[17px] font-bold tabular-nums tracking-tight text-foreground">
              {isFree ? "Free" : <PriceDisplay usdAmount={item.startingPrice} />}
            </span>
            {isOnSale && compareAt && (
              <span className="hidden shrink-0 text-xs text-muted-foreground line-through @[240px]:inline">
                <PriceDisplay usdAmount={compareAt} />
              </span>
            )}
          </div>

          <div className="relative z-10 flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                setPreviewOpen(true)
              }}
              aria-label={`Quick view of ${item.product.name}`}
              className={cn(actionBtn, "size-9 border border-border bg-background text-muted-foreground hover:border-border-strong hover:text-foreground")}
            >
              <Eye size={ICON_SIZE.sm} aria-hidden="true" />
            </button>

            <button
              type="button"
              onClick={handlePrimaryAction}
              disabled={isPending || (!isFree && !cheapestLicense)}
              aria-label={isFree ? `Get ${item.product.name} for free` : `Add ${item.product.name} to cart`}
              className={cn(
                actionBtn,
                "px-3",
                justAdded ? "bg-success text-success-foreground" : "bg-foreground text-background hover:bg-primary hover:text-primary-foreground",
              )}
            >
              {isPending ? (
                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
              ) : justAdded ? (
                <Check size={14} aria-hidden="true" />
              ) : isFree ? (
                <Gift size={14} aria-hidden="true" />
              ) : (
                <ShoppingBag size={14} aria-hidden="true" />
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

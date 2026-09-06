"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"
import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { mutate } from "swr"
import { PriceDisplay } from "@/components/price-display"
import { WishlistButton } from "@/components/product/wishlist-button"
import { QuickPreviewDialog } from "@/components/product/quick-preview-dialog"
import { addToCart } from "@/lib/actions/cart"
import { claimFreeProduct } from "@/lib/actions/free-products"
import { ArrowRight, Check, Eye, Gift, ImageOff, Loader2, ShoppingCart, Star } from "@/lib/storefront-icons"
import type { getProducts } from "@/lib/queries/catalog"
import { cn } from "@/lib/utils"

export type V4ProductCardData = Awaited<ReturnType<typeof getProducts>>[number]

export function V4ProductCard({
  item,
  variant = "standard",
  className,
}: {
  item: V4ProductCardData
  variant?: "standard" | "feature" | "compact"
  className?: string
}) {
  const router = useRouter()
  const [previewOpen, setPreviewOpen] = useState(false)
  const [justAdded, setJustAdded] = useState(false)
  const [isPending, startTransition] = useTransition()
  const image = item.product.coverImageUrl ?? item.images[0]?.url ?? item.product.thumbnailUrl ?? null
  const href = `/products/${item.product.slug}`
  const isFree = item.product.isFree || item.startingPrice === 0
  const compareAt = item.product.compareAtPrice ? Number.parseFloat(item.product.compareAtPrice) : null
  const isOnSale = compareAt !== null && compareAt > item.startingPrice && !isFree
  const cheapest = item.licenses.length
    ? item.licenses.reduce((best, current) =>
        Number.parseFloat(current.price) < Number.parseFloat(best.price) ? current : best,
      )
    : null

  function primaryAction(event: React.MouseEvent) {
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
        } else if (cheapest) {
          await addToCart(item.product.id, cheapest.id, 1)
          await mutate("/api/cart/summary")
          setJustAdded(true)
          toast.success("Added to cart", { description: item.product.name })
          router.refresh()
        }
        window.setTimeout(() => setJustAdded(false), 1600)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Something went wrong")
      }
    })
  }

  const feature = variant === "feature"
  const compact = variant === "compact"

  return (
    <>
      <motion.article
        layout
        whileHover={{ y: -5 }}
        transition={{ type: "spring", stiffness: 360, damping: 28 }}
        className={cn("group relative min-w-0", className)}
      >
        <div className={cn("relative overflow-hidden bg-secondary", feature ? "rounded-[30px]" : "rounded-[24px]")}> 
          <Link href={href} className={cn("relative block overflow-hidden", feature ? "aspect-[16/11]" : compact ? "aspect-[4/3]" : "aspect-[5/4]")}> 
            {image ? (
              <Image
                src={image}
                alt={item.product.name}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.045] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                sizes={feature ? "(max-width: 1024px) 92vw, 52vw" : "(max-width: 640px) 50vw, (max-width: 1100px) 33vw, 25vw"}
              />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-muted-foreground/35"><ImageOff size={32} /></span>
            )}

            <div className="absolute inset-0 bg-gradient-to-t from-black/42 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <div className="absolute left-3 top-3 flex gap-1.5">
              {isFree && <span className="rounded-full bg-background/92 px-2.5 py-1 font-mono text-[9px] font-black uppercase tracking-[0.08em] text-foreground backdrop-blur">Free</span>}
              {isOnSale && <span className="rounded-full bg-primary px-2.5 py-1 font-mono text-[9px] font-black uppercase tracking-[0.08em] text-primary-foreground">Sale</span>}
            </div>

            <div className="absolute right-3 top-3 z-10"><WishlistButton productId={item.product.id} /></div>

            <div className="absolute inset-x-3 bottom-3 z-10 flex translate-y-2 items-center gap-2 opacity-0 transition-[opacity,transform] duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus-within:translate-y-0 focus-within:opacity-100">
              <button
                type="button"
                onClick={(event) => {
                  event.preventDefault()
                  setPreviewOpen(true)
                }}
                className="flex size-11 shrink-0 items-center justify-center rounded-full bg-white text-black shadow-lg transition-transform hover:scale-105"
                aria-label={`Preview ${item.product.name}`}
              >
                <Eye size={17} />
              </button>
              <button
                type="button"
                onClick={primaryAction}
                disabled={isPending || (!isFree && !cheapest)}
                className="flex h-11 flex-1 items-center justify-center gap-2 rounded-full bg-white px-4 text-xs font-bold text-black shadow-lg transition-transform hover:scale-[1.015] disabled:opacity-60"
              >
                {isPending ? <Loader2 size={15} className="animate-spin" /> : justAdded ? <Check size={15} /> : isFree ? <Gift size={15} /> : <ShoppingCart size={15} />}
                {isPending ? "Adding…" : justAdded ? "Added" : isFree ? "Get free" : "Quick add"}
              </button>
            </div>
          </Link>
        </div>

        <div className={cn("pt-3", feature && "pt-4")}> 
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="truncate font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{item.category.name}</p>
              <h3 className={cn("mt-1 font-display font-black leading-tight tracking-[-0.035em] text-foreground", feature ? "text-2xl sm:text-3xl" : compact ? "text-sm" : "text-[16px]")}> 
                <Link href={href} className="transition-colors hover:text-primary">{item.product.name}</Link>
              </h3>
              {!compact && item.product.tagline && <p className={cn("mt-1.5 line-clamp-2 text-muted-foreground", feature ? "max-w-xl text-sm leading-6" : "text-xs leading-5")}>{item.product.tagline}</p>}
            </div>
            <Link href={href} className={cn("flex shrink-0 items-center justify-center rounded-full border border-border transition-[background-color,color,transform] hover:-rotate-6 hover:bg-foreground hover:text-background", feature ? "size-12" : "size-9")} aria-label={`Open ${item.product.name}`}>
              <ArrowRight size={feature ? 17 : 14} />
            </Link>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-baseline gap-2">
              {item.licenses.length > 1 && !isFree && <span className="text-[10px] text-muted-foreground">From</span>}
              <span className={cn("font-display font-black tracking-tight", feature ? "text-xl" : "text-base")}>{isFree ? "Free" : <PriceDisplay usdAmount={item.startingPrice} />}</span>
              {isOnSale && compareAt && <span className="text-xs text-muted-foreground line-through"><PriceDisplay usdAmount={compareAt} /></span>}
            </div>
            {item.reviewCount > 0 && (
              <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Star size={12} className="fill-primary text-primary" />
                <strong className="text-foreground">{item.avgRating.toFixed(1)}</strong>
                ({item.reviewCount})
              </span>
            )}
          </div>
        </div>
      </motion.article>

      <QuickPreviewDialog item={item} open={previewOpen} onOpenChange={setPreviewOpen} />
    </>
  )
}

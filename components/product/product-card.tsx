"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { motion } from "motion/react"
import { toast } from "sonner"
import { mutate } from "swr"
import { ShoppingCart, Loader2, Check, ImageOff, Star, Gift, Eye } from "@/lib/storefront-icons"
import { Badge } from "@/components/ui/badge"
import { PriceDisplay } from "@/components/price-display"
import { WishlistButton } from "@/components/product/wishlist-button"
import { QuickPreviewDialog } from "@/components/product/quick-preview-dialog"
import { addToCart } from "@/lib/actions/cart"
import { claimFreeProduct } from "@/lib/actions/free-products"
import { cn } from "@/lib/utils"
import type { getProducts } from "@/lib/queries/catalog"

const MotionDiv = motion.create("div")
const MotionButton = motion.create("button")

export type ProductCardData = Awaited<ReturnType<typeof getProducts>>[number]

export function ProductCard({
  item,
  className,
  style,
}: {
  item: ProductCardData
  className?: string
  style?: React.CSSProperties
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
  const image = item.product.thumbnailUrl ?? item.product.coverImageUrl ?? item.images[0]?.url ?? null
  const isFree = item.product.isFree || item.startingPrice === 0

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
          toast.success("Added to your library", { description: item.product.name })
          return
        }
        if (!cheapestLicense) return
        await addToCart(item.product.id, cheapestLicense.id, 1)
        await mutate("/api/cart/summary")
        setJustAdded(true)
        toast.success("Added to cart", { description: item.product.name })
      } catch {
        toast.error(isFree ? "Couldn't claim this right now. Please try again." : "Couldn't add this to your cart. Please try again.")
      }
    })
  }

  return (
    <>
      <MotionDiv
        style={style}
        className={cn(
          "group relative flex h-full flex-col border border-border bg-card transition-colors duration-200",
          "hover:border-primary/50",
          className,
        )}
      >
        <Link href={href} className="relative block aspect-[4/3] w-full overflow-hidden border-b border-border bg-secondary">
          {image ? (
            <Image
              src={image || "/placeholder.svg"}
              alt={item.product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
              <ImageOff className="size-8" />
            </div>
          )}
          {isFree && (
            <Badge className="absolute left-0 top-0 rounded-none border-none bg-primary font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-primary-foreground">
              Free
            </Badge>
          )}
          {item.product.isNewRelease && !isFree && (
            <Badge className="absolute left-0 top-0 rounded-none border-none bg-navy font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-navy-foreground">
              New
            </Badge>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              setPreviewOpen(true)
            }}
            aria-label={`Quick preview of ${item.product.name}`}
            className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
          >
            <Eye className="size-3.5" />
            Preview
          </button>
        </Link>
        <WishlistButton productId={item.product.id} className="absolute right-0 top-0 z-10" />

        <Link href={href} className="flex flex-col gap-1.5 p-3 pb-2.5">
          <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
            {item.department ? `${item.department.name} / ${item.category.name}` : item.category.name}
          </span>
          <h3 className="-mt-1 line-clamp-2 min-h-10 text-sm font-semibold leading-snug text-balance text-foreground transition-colors group-hover:text-primary">
            {item.product.name}
          </h3>
          {item.reviewCount > 0 && (
            <div className="flex items-center gap-1 font-mono text-[10.5px] text-muted-foreground">
              <Star className="size-3 fill-accent text-accent" />
              <span className="font-semibold text-foreground">{item.avgRating.toFixed(1)}</span>
              <span>({item.reviewCount})</span>
            </div>
          )}
        </Link>

        <div className="mt-auto flex flex-col gap-2 border-t border-border px-3 pb-3 pt-2.5">
          <div className="flex items-baseline gap-2 font-mono">
            {hasMultipleLicenses && <span className="text-[10.5px] font-medium text-muted-foreground">From</span>}
            <span className="text-lg font-bold text-foreground">
              {isFree ? "Free" : <PriceDisplay usdAmount={item.startingPrice} />}
            </span>
            {item.product.compareAtPrice && Number.parseFloat(item.product.compareAtPrice) > item.startingPrice && (
              <span className="text-xs text-muted-foreground line-through">
                <PriceDisplay usdAmount={item.product.compareAtPrice} />
              </span>
            )}
          </div>
          <MotionButton
            type="button"
            onClick={handlePrimaryAction}
            disabled={isPending || (!isFree && !cheapestLicense)}
            aria-label={isFree ? "Get for free" : "Add to cart"}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "relative flex h-9 w-full items-center justify-center gap-1.5 rounded-[3px] px-2 font-mono text-xs font-semibold uppercase tracking-[0.02em] transition-colors disabled:opacity-70",
              justAdded
                ? "bg-success text-success-foreground"
                : "bg-primary text-primary-foreground hover:bg-primary/90",
            )}
          >
            {isPending ? (
              <>
                <Loader2 className="size-3.5 shrink-0 animate-spin" />
                {isFree ? "Claiming" : "Adding"}
              </>
            ) : justAdded ? (
              <>
                <Check className="size-3.5 shrink-0" />
                {isFree ? "In your library" : "Added"}
              </>
            ) : isFree ? (
              <>
                <Gift className="size-4 shrink-0" />
                Get for free
              </>
            ) : (
              <>
                <ShoppingCart className="size-4 shrink-0" />
                Add to cart
              </>
            )}
          </MotionButton>
        </div>
      </MotionDiv>
      <QuickPreviewDialog item={item} open={previewOpen} onOpenChange={setPreviewOpen} />
    </>
  )
}

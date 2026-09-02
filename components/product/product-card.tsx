"use client"

import { useEffect, useState, useTransition } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "motion/react"
import { toast } from "sonner"
import { mutate } from "swr"
import { ShoppingCart, Loader2, Check, ImageOff } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PriceDisplay } from "@/components/price-display"
import { WishlistButton } from "@/components/product/wishlist-button"
import { addToCart } from "@/lib/actions/cart"
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
  const [isPending, startTransition] = useTransition()
  const [justAdded, setJustAdded] = useState(false)
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

  function handleQuickAdd(e: React.MouseEvent) {
    e.preventDefault()
    if (!cheapestLicense || isPending) return
    startTransition(async () => {
      try {
        await addToCart(item.product.id, cheapestLicense.id, 1)
        await mutate("/api/cart/summary")
        setJustAdded(true)
        toast.success("Added to cart", { description: item.product.name })
      } catch {
        toast.error("Couldn't add this to your cart. Please try again.")
      }
    })
  }

  return (
    <MotionDiv
      style={style}
      whileHover={{ y: -5 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-all duration-300",
        "hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg",
        className,
      )}
    >
      <Link href={href} className="relative block aspect-[4/3] w-full overflow-hidden border-b border-border/60 bg-secondary">
        {image ? (
          <Image
            src={image || "/placeholder.svg"}
            alt={item.product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-[1.05]"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
            <ImageOff className="size-8" />
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/90 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {isFree && (
          <Badge className="absolute left-2.5 top-2.5 border-none bg-accent font-semibold text-accent-foreground shadow-sm shadow-accent/30">
            Free
          </Badge>
        )}
        {item.product.isNewRelease && !isFree && (
          <Badge className="absolute left-2.5 top-2.5 border-none bg-primary font-semibold text-primary-foreground shadow-sm shadow-primary/30">
            New
          </Badge>
        )}
      </Link>
      <WishlistButton productId={item.product.id} className="absolute right-2.5 top-2.5 z-10" />

      <Link href={href} className="flex flex-col gap-1.5 p-3 pb-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
          {item.category.name}
        </span>
        <h3 className="-mt-1 line-clamp-2 min-h-10 text-sm font-medium leading-snug text-balance text-foreground transition-colors group-hover:text-primary">
          {item.product.name}
        </h3>
      </Link>

      <div className="mt-auto flex flex-col gap-2 border-t border-border/60 px-3 pb-3 pt-2.5">
        <div className="flex items-baseline gap-2">
          {hasMultipleLicenses && <span className="text-[11px] font-medium text-muted-foreground">From</span>}
          <span className="font-display text-lg font-semibold text-foreground">
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
          onClick={handleQuickAdd}
          disabled={isPending || !cheapestLicense}
          aria-label="Add to cart"
          whileTap={{ scale: 0.96 }}
          className={cn(
            "relative flex h-9 w-full items-center justify-center gap-1.5 overflow-hidden rounded-lg px-2 text-xs font-semibold transition-all disabled:opacity-70",
            justAdded
              ? "bg-success text-success-foreground"
              : "bg-accent text-accent-foreground shadow-sm shadow-accent/25 hover:bg-accent/90",
          )}
        >
          {isPending ? (
            <>
              <Loader2 className="size-3.5 shrink-0 animate-spin" />
              Adding
            </>
          ) : justAdded ? (
            <>
              <Check className="size-3.5 shrink-0" />
              Added
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
  )
}

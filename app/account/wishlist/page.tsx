import Link from "next/link"
import { ArrowRight, Heart, ICON_SIZE } from "@/lib/storefront-icons"
import { getWishlistItems } from "@/lib/actions/wishlist"
import { ProductGrid } from "@/components/catalog/product-grid"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/motion/reveal"

export const metadata = {
  title: "Wishlist — DistroSource",
}

export default async function AccountWishlistPage() {
  const items = await getWishlistItems()

  if (items.length === 0) {
    return (
      <Reveal className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-lg border border-border bg-card px-6 py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <Heart size={ICON_SIZE.feature} aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-display text-lg font-bold">Your wishlist is empty</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            Save products for later. Tap the heart on any product to keep it here.
          </p>
        </div>
        <Button render={<Link href="/products" />} nativeButton={false} className="font-semibold">
          Browse products
          <ArrowRight size={ICON_SIZE.base} aria-hidden="true" />
        </Button>
      </Reveal>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-xl font-bold tracking-tight">Wishlist</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {items.length} saved {items.length === 1 ? "product" : "products"}
        </p>
      </div>
      <ProductGrid items={items} />
    </div>
  )
}

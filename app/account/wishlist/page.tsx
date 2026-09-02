import Link from "next/link"
import { Heart } from "lucide-react"
import { getWishlistItems } from "@/lib/actions/wishlist"
import { ProductGrid } from "@/components/catalog/product-grid"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Wishlist — DistroSource",
}

export default async function AccountWishlistPage() {
  const items = await getWishlistItems()

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-secondary/30 py-16 text-center">
        <Heart className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Save products you love to find them here later.</p>
        <Button size="sm" render={<Link href="/products" />} nativeButton={false}>
          Browse products
        </Button>
      </div>
    )
  }

  return <ProductGrid items={items} />
}

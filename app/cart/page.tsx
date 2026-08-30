import Link from "next/link"
import { ShoppingBag } from "lucide-react"
import { getCartItems } from "@/lib/actions/cart"
import { CartLineItem } from "@/components/cart/cart-line-item"
import { CartSummary } from "@/components/cart/cart-summary"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { Reveal } from "@/components/motion/reveal"

export const metadata = {
  title: "Your Cart — RedeemCove",
}

export default async function CartPage() {
  const items = await getCartItems()
  const subtotal = items.reduce((sum, i) => sum + Number.parseFloat(i.variant.priceUsd) * i.cartItem.quantity, 0)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
          <h1 className="mb-6 font-display text-2xl font-bold md:text-3xl">Your cart</h1>

          {items.length === 0 ? (
            <Reveal className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-border py-20 text-center">
              <ShoppingBag className="size-10 text-muted-foreground" aria-hidden="true" />
              <div>
                <p className="font-semibold">Your cart is empty</p>
                <p className="text-sm text-muted-foreground">
                  Browse our marketplace to find gift cards and top-ups.
                </p>
              </div>
              <Button render={<Link href="/products" />} nativeButton={false}>
                Browse products
              </Button>
            </Reveal>
          ) : (
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
              <div className="rounded-xl border border-border bg-card px-5">
                {items.map((item) => (
                  <CartLineItem
                    key={item.cartItem.id}
                    cartItemId={item.cartItem.id}
                    productSlug={item.product.slug}
                    productName={item.product.name}
                    brandName={item.brand.name}
                    brandLogoUrl={item.brand.logoUrl}
                    brandColor={item.brand.brandColor}
                    denominationLabel={item.variant.denominationLabel}
                    imageUrl={item.product.imageUrl}
                    unitPriceUsd={item.variant.priceUsd}
                    quantity={item.cartItem.quantity}
                  />
                ))}
              </div>
              <CartSummary subtotal={Math.round(subtotal * 100) / 100} />
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

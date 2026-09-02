import Link from "next/link"
import { ShoppingBag, ArrowRight, Tag, Sparkles } from "@/lib/storefront-icons"
import { getCartItems } from "@/lib/actions/cart"
import { CartItemsList } from "@/components/cart/cart-items-list"
import { CartSummary } from "@/components/cart/cart-summary"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { Reveal } from "@/components/motion/reveal"

export const metadata = {
  title: "Your Cart — DistroSource",
}

export default async function CartPage() {
  const items = await getCartItems()
  const subtotal = items.reduce((sum, i) => sum + Number.parseFloat(i.license.price) * i.cartItem.quantity, 0)
  const totalItems = items.reduce((sum, i) => sum + i.cartItem.quantity, 0)

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-10 md:px-6 md:py-14">
          <div className="mb-8 flex flex-col gap-3 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                <Sparkles className="size-3.5" aria-hidden="true" /> Ready when you are
              </p>
              <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">Your cart</h1>
            </div>
            {items.length > 0 && (
              <span className="border border-primary/30 bg-primary/10 px-2.5 py-0.5 font-mono text-xs font-semibold text-primary">
                {totalItems} {totalItems === 1 ? "item" : "items"}
              </span>
            )}
          </div>

          {items.length === 0 ? (
            <Reveal className="flex flex-col items-center gap-5 border border-dashed border-border bg-card px-6 py-20 text-center shadow-sm">
              <div className="flex size-16 items-center justify-center border border-border bg-secondary">
                <ShoppingBag className="size-7 text-muted-foreground" aria-hidden="true" />
              </div>
              <div>
                <p className="font-display text-lg font-semibold">Your cart is empty</p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                  Browse our catalog to find templates, fonts, presentations, and other digital products.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Button render={<Link href="/products" />} nativeButton={false} className="rounded-[3px]">
                  Browse products
                  <ArrowRight className="size-4" />
                </Button>
                <Button
                  variant="outline"
                  render={<Link href="/products?free=true" />}
                  nativeButton={false}
                  className="rounded-[3px]"
                >
                  <Tag className="size-4" />
                  Free resources
                </Button>
              </div>
            </Reveal>
          ) : (
            <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px] lg:gap-8">
              <div className="border border-border bg-card px-5">
                <CartItemsList
                  items={items.map((item) => ({
                    cartItemId: item.cartItem.id,
                    productSlug: item.product.slug,
                    productName: item.product.name,
                    licenseType: item.license.licenseType,
                    imageUrl: item.imageUrl,
                    unitPriceUsd: item.license.price,
                    quantity: item.cartItem.quantity,
                  }))}
                />
              </div>
              <div className="lg:sticky lg:top-36 lg:self-start">
                <CartSummary subtotal={Math.round(subtotal * 100) / 100} itemCount={totalItems} />
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

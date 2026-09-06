import Link from "next/link"
import { ArrowRight, ShoppingBag } from "@/lib/storefront-icons"
import { getCartItems } from "@/lib/actions/cart"
import { CartItemsList } from "@/components/cart/cart-items-list"
import { CartSummary } from "@/components/cart/cart-summary"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { Reveal } from "@/components/motion/reveal"

export const metadata = { title: "Cart — DistroSource" }

export default async function CartPage() {
  const items = await getCartItems()
  const subtotal = items.reduce((sum, item) => sum + Number.parseFloat(item.license.price) * item.cartItem.quantity, 0)
  const totalItems = items.reduce((sum, item) => sum + item.cartItem.quantity, 0)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 pb-24 md:pb-0">
        <section className="border-b border-border/70 bg-secondary/18">
          <div className="mx-auto max-w-[86rem] px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-primary">Your selection</p>
            <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
              <h1 className="font-display text-4xl font-black tracking-[-0.05em] text-foreground sm:text-5xl">Shopping cart</h1>
              {items.length > 0 && <p className="text-sm text-muted-foreground">{totalItems} {totalItems === 1 ? "item" : "items"} ready to review</p>}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[86rem] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
          {items.length === 0 ? (
            <Reveal className="mx-auto flex max-w-lg flex-col items-center gap-5 py-20 text-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <ShoppingBag size={25} aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-2xl font-black tracking-tight text-foreground">Your cart is beautifully empty.</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Browse the catalog and add the products you want to keep moving with.</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <Button render={<Link href="/products" />} nativeButton={false} className="rounded-full px-5 font-bold">
                  Browse products <ArrowRight size={15} />
                </Button>
                <Button variant="outline" render={<Link href="/categories" />} nativeButton={false} className="rounded-full bg-transparent px-5 font-bold">Departments</Button>
              </div>
            </Reveal>
          ) : (
            <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-12 xl:grid-cols-[minmax(0,1fr)_25rem]">
              <div>
                <div className="overflow-hidden rounded-2xl border border-border/80 bg-card px-5 shadow-[0_18px_60px_-42px_color-mix(in_oklch,var(--foreground)_24%,transparent)] sm:px-7">
                  <CartItemsList
                    items={items.map((item) => ({
                      cartItemId: item.cartItem.id,
                      productId: item.product.id,
                      productSlug: item.product.slug,
                      productName: item.product.name,
                      tagline: item.product.tagline,
                      categoryName: item.categoryName,
                      sourceType: item.product.sourceType,
                      licenseId: item.license.id,
                      licenseType: item.license.licenseType,
                      licenseOptions: item.licenseOptions,
                      imageUrl: item.imageUrl,
                      fileFormats: item.product.fileFormats,
                      software: item.product.softwareCompatibility,
                      unitPriceUsd: item.license.price,
                      quantity: item.cartItem.quantity,
                    }))}
                  />
                </div>
                <Link href="/products" className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-muted-foreground hover:text-foreground">← Continue shopping</Link>
              </div>

              <div className="lg:sticky lg:top-24 lg:self-start">
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

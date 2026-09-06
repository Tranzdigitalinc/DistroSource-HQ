import Link from "next/link"
import { ArrowRight, ShoppingBag } from "@/lib/storefront-icons"
import { getCartItems } from "@/lib/actions/cart"
import { CartItemsList } from "@/components/cart/cart-items-list"
import { CartSummary } from "@/components/cart/cart-summary"
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
      <main className="flex-1">
        <section className="border-b border-border bg-secondary/25">
          <div className="mx-auto max-w-[1320px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-primary">Your selection</p>
            <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <h1 className="font-display text-[clamp(3.2rem,7vw,7rem)] font-black leading-[0.84] tracking-[-0.075em]">Cart.</h1>
              {items.length > 0 && <p className="pb-1 text-sm text-muted-foreground">{totalItems} {totalItems === 1 ? "item" : "items"} ready for review</p>}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1320px] px-4 pb-32 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pb-20 lg:pt-12">
          {items.length === 0 ? (
            <Reveal className="mx-auto flex min-h-[520px] max-w-xl flex-col items-center justify-center text-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-secondary text-muted-foreground"><ShoppingBag size={24} /></span>
              <h2 className="mt-6 font-display text-4xl font-black tracking-[-0.055em]">Your cart is wide open.</h2>
              <p className="mt-3 max-w-md text-sm leading-7 text-muted-foreground">Find something useful, add it once, and come back here when you&apos;re ready to check out.</p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
                <Link href="/products" className="group inline-flex h-12 items-center gap-3 rounded-full bg-foreground px-5 text-sm font-semibold text-background">
                  Explore products <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href="/categories" className="inline-flex h-12 items-center rounded-full border border-border px-5 text-sm font-semibold hover:bg-secondary">Browse departments</Link>
              </div>
            </Reveal>
          ) : (
            <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-14 xl:gap-20">
              <section aria-labelledby="cart-products-title">
                <div className="mb-2 flex items-center justify-between border-b border-border pb-4">
                  <h2 id="cart-products-title" className="font-display text-xl font-black tracking-[-0.03em]">Your products</h2>
                  <Link href="/products" className="text-xs font-semibold text-muted-foreground hover:text-foreground">Add more</Link>
                </div>
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
              </section>

              <aside className="lg:sticky lg:top-24">
                <CartSummary subtotal={Math.round(subtotal * 100) / 100} itemCount={totalItems} />
              </aside>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

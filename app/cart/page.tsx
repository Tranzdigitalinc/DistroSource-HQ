import Link from "next/link"
import { ArrowRight, ShoppingBag } from "@/lib/storefront-icons"
import { getCartItems } from "@/lib/actions/cart"
import { CartItemsList } from "@/components/cart/cart-items-list"
import { CartSummary } from "@/components/cart/cart-summary"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"

export const metadata = { title: "Cart — DistroSource" }

export default async function CartPage() {
  const items = await getCartItems()
  const subtotal = items.reduce((sum, item) => sum + Number.parseFloat(item.license.price) * item.cartItem.quantity, 0)
  const totalItems = items.reduce((sum, item) => sum + item.cartItem.quantity, 0)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-[#111827] text-white">
          <div className="mx-auto max-w-[1500px] px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
            <p className="font-mono text-[9px] font-black uppercase tracking-[0.14em] text-primary">Review your selection</p>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
              <h1 className="font-display text-[clamp(3.4rem,7vw,7rem)] font-black leading-[0.86] tracking-[-0.075em]">Your cart.</h1>
              {items.length > 0 && <p className="pb-1 text-sm text-white/45">{totalItems} {totalItems === 1 ? "item" : "items"}</p>}
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1500px] px-4 pb-28 pt-8 sm:px-6 lg:px-8 lg:pb-16 lg:pt-12">
          {items.length === 0 ? (
            <div className="mx-auto flex max-w-xl flex-col items-center py-20 text-center">
              <span className="flex size-16 items-center justify-center rounded-full bg-secondary text-muted-foreground"><ShoppingBag size={24} /></span>
              <h2 className="mt-6 font-display text-3xl font-black tracking-[-0.05em]">Nothing here yet.</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">Explore the catalog and build a toolkit around what you’re making next.</p>
              <Link href="/products" className="group mt-6 inline-flex h-12 items-center gap-2 bg-foreground px-5 text-sm font-bold text-background">Browse products <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></Link>
            </div>
          ) : (
            <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1.35fr)_minmax(340px,0.65fr)] lg:gap-16">
              <div>
                <div className="mb-5 flex items-center justify-between border-b border-border pb-4"><div><p className="font-mono text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground">Products</p><h2 className="mt-1 font-display text-2xl font-black tracking-[-0.04em]">Ready when you are.</h2></div><Link href="/products" className="text-xs font-semibold text-muted-foreground hover:text-foreground">Keep browsing</Link></div>
                <CartItemsList items={items.map((item) => ({
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
                }))} />
              </div>
              <div className="lg:sticky lg:top-24"><CartSummary subtotal={Math.round(subtotal * 100) / 100} itemCount={totalItems} /></div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

import Link from "next/link"
import { ArrowRight, ShoppingBag, ICON_SIZE } from "@/lib/storefront-icons"
import { getCartItems } from "@/lib/actions/cart"
import { getActiveMembership } from "@/lib/membership"
import { getOptionalOwnerId } from "@/lib/session"
import { CartItemsList } from "@/components/cart/cart-items-list"
import { CartSummary } from "@/components/cart/cart-summary"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { PageHeader } from "@/components/page-header"
import { Reveal } from "@/components/motion/reveal"

export const metadata = {
  title: "Cart — DistroSource",
}

export default async function CartPage() {
  const items = await getCartItems()
  const subtotal = items.reduce((sum, i) => sum + Number.parseFloat(i.license.price) * i.cartItem.quantity, 0)
  const totalItems = items.reduce((sum, i) => sum + i.cartItem.quantity, 0)

  const ownerId = await getOptionalOwnerId()
  const membership = ownerId ? await getActiveMembership(ownerId) : null

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-x pb-28 pt-10 md:pb-16 md:pt-12">
          <PageHeader
            eyebrow="Cart"
            title={items.length > 0 ? `${totalItems} ${totalItems === 1 ? "item" : "items"} ready` : "Your cart"}
            description={items.length > 0 ? "Change a licence, save something for later, or continue to secure checkout." : undefined}
            className="mb-8"
          />

          {items.length === 0 ? (
            <Reveal className="mx-auto flex max-w-md flex-col items-center gap-5 rounded-2xl border border-dashed border-border py-16 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <ShoppingBag size={ICON_SIZE.feature} aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-xl font-bold text-foreground">Nothing here yet.</h2>
                <p className="mt-1.5 text-sm text-muted-foreground">Anything you add will be kept here until checkout.</p>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Button render={<Link href="/products" />} nativeButton={false} className="h-10 rounded-full px-4 font-semibold">
                  Browse products
                  <ArrowRight size={ICON_SIZE.base} aria-hidden="true" />
                </Button>
                <Button variant="outline" render={<Link href="/categories" />} nativeButton={false} className="h-10 rounded-full bg-transparent px-4 font-semibold">
                  Explore departments
                </Button>
              </div>
            </Reveal>
          ) : (
            <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,65fr)_minmax(0,35fr)] lg:gap-12">
              <div className="rounded-2xl border border-border bg-card px-5 sm:px-6">
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

              <div className="lg:sticky lg:top-24 lg:self-start">
                <CartSummary
                  subtotal={Math.round(subtotal * 100) / 100}
                  itemCount={totalItems}
                  memberDiscountPercent={membership?.plan.discountPercent ?? 0}
                  memberPlanName={membership?.plan.name}
                />
              </div>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

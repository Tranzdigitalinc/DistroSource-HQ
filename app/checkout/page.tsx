import { redirect } from "next/navigation"
import Link from "next/link"
import { getCartItems } from "@/lib/actions/cart"
import { applyCouponPreview } from "@/lib/actions/checkout"
import { getSession } from "@/lib/session"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { CheckoutHeader } from "@/components/checkout/checkout-header"

export const metadata = {
  title: "Checkout — DistroSource",
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ coupon?: string }>
}) {
  const { coupon } = await searchParams

  // Abandoned-cart recovery restores items via /api/cart/recover, a Route
  // Handler — restoring here in the page's own render would try to create a
  // guest cookie mid-render, which Next.js disallows and crashes the page.

  const items = await getCartItems()
  if (items.length === 0) redirect("/cart")

  const subtotal =
    Math.round(items.reduce((sum, i) => sum + Number.parseFloat(i.license.price) * i.cartItem.quantity, 0) * 100) / 100

  let discountPercent = 0
  if (coupon) {
    const preview = await applyCouponPreview(coupon, subtotal)
    if (preview.valid) discountPercent = preview.discountPercent
  }

  const session = await getSession()

  const orderItems = items.map((item) => ({
    productId: item.product.id,
    licenseId: item.license.id,
    name: item.product.name,
    tagline: item.product.tagline,
    licenseType: item.license.licenseType,
    quantity: item.cartItem.quantity,
    unitPriceUsd: item.license.price,
    imageUrl: item.imageUrl,
    fileFormats: item.product.fileFormats,
    software: item.product.softwareCompatibility,
    categoryName: item.categoryName,
  }))

  return (
    // Minimal checkout chrome: no site header, no mega menu, no footer, no
    // product recommendations. The only exits are "back to cart" and the
    // legal links below.
    <div className="flex min-h-screen flex-col bg-background">
      {/* The wizard below owns progress (Account → Review → Payment), so the
          header does not show a second, coarser one. */}
      <CheckoutHeader currentStep="checkout" showSteps={false} showVerifyBanner={false} />

      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 pb-28 sm:px-6 lg:pb-12">
          <h1 className="sr-only">Checkout</h1>
          <CheckoutForm
            defaultEmail={session?.user?.email ?? ""}
            defaultName={session?.user?.name ?? ""}
            subtotal={subtotal}
            discountPercent={discountPercent}
            isGuest={!session?.user}
            orderItems={orderItems}
          />
        </div>
      </main>

      <footer className="border-t border-border py-6">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 text-xs text-muted-foreground sm:px-6">
          <span>© {new Date().getFullYear()} DistroSource</span>
          <Link href="/legal/terms" className="transition-colors hover:text-foreground">
            Terms
          </Link>
          <Link href="/legal/privacy" className="transition-colors hover:text-foreground">
            Privacy
          </Link>
          <Link href="/legal/refund-policy" className="transition-colors hover:text-foreground">
            Refund Policy
          </Link>
          <Link href="/account/support" className="transition-colors hover:text-foreground">
            Support
          </Link>
        </div>
      </footer>
    </div>
  )
}

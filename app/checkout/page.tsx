import { redirect } from "next/navigation"
import { getCartItems } from "@/lib/actions/cart"
import { applyCouponPreview } from "@/lib/actions/checkout"
import { getSession } from "@/lib/session"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"

export const metadata = {
  title: "Checkout — RedeemCove",
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ coupon?: string }>
}) {
  const { coupon } = await searchParams
  const items = await getCartItems()
  if (items.length === 0) redirect("/cart")

  const subtotal =
    Math.round(items.reduce((sum, i) => sum + Number.parseFloat(i.variant.priceUsd) * i.cartItem.quantity, 0) * 100) /
    100

  let discountPercent = 0
  if (coupon) {
    const preview = await applyCouponPreview(coupon, subtotal)
    if (preview.valid) discountPercent = preview.discountPercent
  }

  const session = await getSession()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-2xl px-4 py-8 md:px-6">
          <h1 className="mb-6 font-display text-2xl font-bold md:text-3xl">Checkout</h1>
          <CheckoutForm
            defaultEmail={session?.user?.email ?? ""}
            defaultName={session?.user?.name ?? ""}
            subtotal={subtotal}
            discountPercent={discountPercent}
            isGuest={!session?.user}
          />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

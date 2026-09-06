import { redirect } from "next/navigation"
import Link from "next/link"
import { getCartItems } from "@/lib/actions/cart"
import { applyCouponPreview } from "@/lib/actions/checkout"
import { getSession } from "@/lib/session"
import { CheckoutForm } from "@/components/checkout/checkout-form"
import { CheckoutHeader } from "@/components/checkout/checkout-header"

export const metadata = { title: "Checkout — DistroSource" }

export default async function CheckoutPage({ searchParams }: { searchParams: Promise<{ coupon?: string }> }) {
  const { coupon } = await searchParams
  const items = await getCartItems()
  if (items.length === 0) redirect("/cart")

  const subtotal = Math.round(items.reduce((sum, item) => sum + Number.parseFloat(item.license.price) * item.cartItem.quantity, 0) * 100) / 100
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
    <div className="flex min-h-screen flex-col bg-background">
      <CheckoutHeader currentStep="checkout" />
      <main className="flex-1">
        <section className="border-b border-border bg-secondary/25">
          <div className="mx-auto max-w-[1320px] px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-14">
            <p className="font-mono text-[9px] font-black uppercase tracking-[0.16em] text-primary">One screen · digital checkout</p>
            <h1 className="mt-3 font-display text-[clamp(2.8rem,6vw,5.8rem)] font-black leading-[0.88] tracking-[-0.065em]">Review. Choose. Pay.</h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">No shipping forms and no artificial steps. Confirm your contact details, review the products, then choose the available payment route.</p>
          </div>
        </section>

        <div className="mx-auto max-w-[1320px] px-4 pb-32 pt-8 sm:px-6 sm:pt-10 lg:px-8 lg:pb-16 lg:pt-12">
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
        <div className="mx-auto flex max-w-[1320px] flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 text-[11px] text-muted-foreground sm:px-6">
          <span>© {new Date().getFullYear()} DistroSource</span>
          <Link href="/legal/terms" className="hover:text-foreground">Terms</Link>
          <Link href="/legal/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/legal/refund-policy" className="hover:text-foreground">Refund policy</Link>
          <Link href="/account/support" className="hover:text-foreground">Support</Link>
        </div>
      </footer>
    </div>
  )
}

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

      <main className="flex-1 pb-24 lg:pb-0">
        <section className="border-b border-border/70 bg-secondary/18">
          <div className="mx-auto max-w-[86rem] px-4 py-9 sm:px-6 lg:px-8 lg:py-12">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-primary">One-page checkout</p>
            <h1 className="mt-2 font-display text-4xl font-black tracking-[-0.05em] text-foreground sm:text-5xl">Complete your order.</h1>
            <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">Review your products, confirm where the receipt goes, and choose payment. No shipping steps—everything here is digital.</p>
          </div>
        </section>

        <div className="mx-auto max-w-[86rem] px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
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

      <footer className="border-t border-border/70 py-6">
        <div className="mx-auto flex max-w-[86rem] flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 text-xs text-muted-foreground sm:px-6 lg:px-8">
          <span>© {new Date().getFullYear()} DistroSource</span>
          <Link href="/legal/terms" className="hover:text-foreground">Terms</Link>
          <Link href="/legal/privacy" className="hover:text-foreground">Privacy</Link>
          <Link href="/legal/refund-policy" className="hover:text-foreground">Refund Policy</Link>
          <Link href="/account/support" className="hover:text-foreground">Support</Link>
        </div>
      </footer>
    </div>
  )
}

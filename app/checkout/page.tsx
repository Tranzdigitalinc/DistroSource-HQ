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
        <div className="mx-auto max-w-[1440px] px-4 pb-28 pt-10 sm:px-6 sm:pt-14 lg:px-8 lg:pb-16 lg:pt-16">
          <div className="mb-10 max-w-4xl sm:mb-14">
            <p className="font-mono text-[9px] font-black uppercase tracking-[0.14em] text-primary">Final step</p>
            <h1 className="mt-3 font-display text-[clamp(3.2rem,6vw,6rem)] font-black leading-[0.86] tracking-[-0.07em]">Checkout, without the friction.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground">Confirm your details, review the order, and choose a secure payment method—all on one page.</p>
          </div>
          <CheckoutForm defaultEmail={session?.user?.email ?? ""} defaultName={session?.user?.name ?? ""} subtotal={subtotal} discountPercent={discountPercent} isGuest={!session?.user} orderItems={orderItems} />
        </div>
      </main>
      <footer className="border-t border-border py-6"><div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 text-xs text-muted-foreground sm:px-6 lg:px-8"><span>© {new Date().getFullYear()} DistroSource</span><Link href="/legal/terms" className="hover:text-foreground">Terms</Link><Link href="/legal/privacy" className="hover:text-foreground">Privacy</Link><Link href="/legal/refund-policy" className="hover:text-foreground">Refund Policy</Link><Link href="/account/support" className="hover:text-foreground">Support</Link></div></footer>
    </div>
  )
}

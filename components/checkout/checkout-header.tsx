import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"
import { VerifyEmailBanner } from "@/components/verify-email-banner"
import { ArrowLeft, Lock } from "@/lib/storefront-icons"

type Step = "cart" | "checkout" | "complete"

export function CheckoutHeader({ currentStep = "checkout" }: { currentStep?: Step }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/88 backdrop-blur-2xl">
      <VerifyEmailBanner />
      <div className="mx-auto flex h-[72px] max-w-[1320px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <BrandLogo href="/" heightClassName="h-8 sm:h-9" />
        <div className="mx-auto hidden items-center gap-2 rounded-full border border-border bg-secondary/35 px-3.5 py-2 text-[10px] font-semibold text-muted-foreground sm:flex">
          <Lock size={13} className="text-primary" />
          Secure digital checkout
          <span className="size-1 rounded-full bg-border" />
          {currentStep === "complete" ? "Complete" : currentStep === "cart" ? "Cart review" : "Payment"}
        </div>
        <Link href="/cart" className="ml-auto inline-flex h-10 items-center gap-2 rounded-full px-3 text-xs font-semibold text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground sm:ml-0">
          <ArrowLeft size={14} />
          Back to cart
        </Link>
      </div>
    </header>
  )
}

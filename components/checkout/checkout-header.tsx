import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"
import { VerifyEmailBanner } from "@/components/verify-email-banner"
import { ArrowLeft, Lock } from "@/lib/storefront-icons"

type Step = "cart" | "checkout" | "complete"

export function CheckoutHeader({ currentStep = "checkout" }: { currentStep?: Step }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/92 backdrop-blur-xl supports-[backdrop-filter]:bg-background/82">
      <VerifyEmailBanner />
      <div className="mx-auto flex h-[72px] max-w-[86rem] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <BrandLogo href="/" heightClassName="h-8 sm:h-9" />

        <div className="mx-auto hidden items-center gap-2 rounded-full bg-secondary/50 px-3 py-1.5 text-[11px] font-semibold text-muted-foreground sm:flex">
          <Lock size={12} aria-hidden="true" />
          {currentStep === "complete" ? "Order complete" : "Secure checkout"}
        </div>

        <Link href="/cart" className="ml-auto inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground sm:ml-0">
          <ArrowLeft size={14} aria-hidden="true" />
          <span className="hidden sm:inline">Back to cart</span>
          <span className="sm:hidden">Cart</span>
        </Link>
      </div>
    </header>
  )
}

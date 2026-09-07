import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"
import { VerifyEmailBanner } from "@/components/verify-email-banner"
import { ArrowLeft, Lock } from "@/lib/storefront-icons"

type Step = "cart" | "checkout" | "complete"

export function CheckoutHeader({ currentStep = "checkout" }: { currentStep?: Step }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur-xl">
      <VerifyEmailBanner />
      <div className="mx-auto flex h-[72px] max-w-[1440px] items-center gap-4 px-4 sm:px-6 lg:px-8">
        <BrandLogo href="/" heightClassName="h-8 sm:h-9" />
        <div className="mx-auto hidden items-center gap-2 font-mono text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground sm:flex"><Lock size={12} /> Secure checkout</div>
        <Link href="/cart" className="ml-auto inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-foreground"><ArrowLeft size={13} /> Back to cart</Link>
      </div>
    </header>
  )
}

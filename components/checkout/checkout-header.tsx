import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"
import { VerifyEmailBanner } from "@/components/verify-email-banner"
import { ArrowLeft, Lock } from "@/lib/storefront-icons"
import { ICON_SIZE } from "@/lib/storefront-icons"
import { cn } from "@/lib/utils"

type Step = "cart" | "checkout" | "complete"

const STEPS: { id: Step; label: string }[] = [
  { id: "cart", label: "Cart" },
  { id: "checkout", label: "Checkout" },
  { id: "complete", label: "Complete" },
]

/**
 * Minimal checkout chrome. Deliberately not the site header: during payment
 * the only navigation a customer needs is a way back to their cart. Removing
 * the departments menu, search and full footer measurably reduces the ways to
 * abandon a checkout, and keeps focus on the order.
 *
 * Server component — no interactivity, so it costs no client JS.
 */
export function CheckoutHeader({
  currentStep = "checkout",
  showSteps = true,
  showVerifyBanner = true,
}: {
  currentStep?: Step
  /**
   * The checkout page runs its own Account → Review → Payment wizard, so it
   * turns this off: two progress indicators on one screen disagree about
   * where the customer is. The confirmation page keeps it, where it is the
   * only progress shown.
   */
  showSteps?: boolean
  /**
   * Also off during payment. The banner is useful everywhere else, but an
   * unverified customer can pay, and a "verify your email" prompt beside a
   * payment form reads as a blocker that must be cleared first.
   */
  showVerifyBanner?: boolean
}) {
  const currentIndex = STEPS.findIndex((s) => s.id === currentStep)

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {showVerifyBanner && <VerifyEmailBanner />}

      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <BrandLogo href="/" heightClassName="h-9 sm:h-10" />

        {showSteps && (
        <nav aria-label="Checkout progress" className="mx-auto hidden sm:block">
          <ol className="flex items-center gap-1">
            {STEPS.map((step, index) => {
              const isComplete = index < currentIndex
              const isCurrent = index === currentIndex
              return (
                <li key={step.id} className="flex items-center gap-1">
                  {index > 0 && <span aria-hidden="true" className="mx-1 h-px w-6 bg-border" />}
                  <span
                    aria-current={isCurrent ? "step" : undefined}
                    className={cn(
                      "font-mono text-[11px] font-semibold uppercase tracking-[0.08em] transition-colors",
                      isCurrent && "text-foreground",
                      isComplete && "text-muted-foreground",
                      !isCurrent && !isComplete && "text-muted-foreground/50",
                    )}
                  >
                    {step.label}
                  </span>
                </li>
              )
            })}
          </ol>
        </nav>
        )}

        <div className="ml-auto flex items-center gap-3 sm:ml-0">
          <span className="hidden items-center gap-1.5 text-xs font-medium text-muted-foreground md:flex">
            <Lock size={ICON_SIZE.sm} aria-hidden="true" />
            Secure checkout
          </span>
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <ArrowLeft size={ICON_SIZE.sm} aria-hidden="true" />
            <span className="hidden sm:inline">Back to cart</span>
            <span className="sm:hidden">Cart</span>
          </Link>
        </div>
      </div>
    </header>
  )
}

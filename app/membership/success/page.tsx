import type { Metadata } from "next"
import Link from "next/link"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { Button } from "@/components/ui/button"
import { CheckCircle, ArrowRight, Gift, Tag, ICON_SIZE } from "@/lib/storefront-icons"

export const metadata: Metadata = {
  title: "Welcome to DistroSource Membership",
  robots: { index: false },
}

export default function MembershipSuccessPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-x flex flex-col items-center py-16 text-center md:py-24">
          <span className="flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle size={ICON_SIZE.feature} weight="duotone" aria-hidden="true" />
          </span>
          <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl text-balance">
            You&apos;re a member
          </h1>
          <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            Your membership is active. Your discount now applies automatically at checkout, and this cycle&apos;s
            download credits are ready to use.
          </p>

          <div className="mt-8 grid w-full max-w-lg grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left">
              <Tag size={ICON_SIZE.base} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">Your member discount is applied to every purchase — no code needed.</p>
            </div>
            <div className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-left">
              <Gift size={ICON_SIZE.base} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              <p className="text-sm text-muted-foreground">Spend this cycle&apos;s credits on eligible products, added straight to your library.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button render={<Link href="/account/membership" />} nativeButton={false} className="h-11 rounded-full px-5 font-semibold">
              Manage membership
              <ArrowRight size={ICON_SIZE.base} aria-hidden="true" />
            </Button>
            <Button variant="outline" render={<Link href="/products" />} nativeButton={false} className="h-11 rounded-full bg-transparent px-5 font-semibold">
              Start browsing
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

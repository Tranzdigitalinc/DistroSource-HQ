import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { ClaimAccountCard } from "@/components/checkout/claim-account-card"
import { Button } from "@/components/ui/button"
import { findGamingSubscription } from "@/lib/gaming/billing"
import { formatGamingPrice } from "@/lib/gaming/catalog/pricing"
import { getGamingProductBySlug } from "@/lib/gaming/queries"
import { getOptionalOwnerId, getSession } from "@/lib/session"
import { ArrowRight, CheckCircle, Clock, ICON_SIZE } from "@/lib/storefront-icons"

export const metadata: Metadata = {
  title: "Subscription confirmed — DistroSource Gaming",
  robots: { index: false },
}

/**
 * Where a paid Gaming checkout lands. Only the owner of the reference (the
 * account, or the guest cookie it was bought under) can open it. A guest is
 * offered an account here — just a password — which moves the subscription
 * onto it (lib/actions/claim-order.ts).
 */
export default async function GamingSubscribedPage({ searchParams }: { searchParams: Promise<{ ref?: string }> }) {
  const { ref } = await searchParams
  const ownerId = await getOptionalOwnerId()
  if (!ref || !ownerId) notFound()
  const row = await findGamingSubscription(ref, ownerId)
  if (!row) notFound()

  const session = await getSession()
  const isGuest = !session?.user
  const product = getGamingProductBySlug(row.productSlug)
  const title = product?.title ?? row.productSlug
  const active = row.status === "active"
  const price = `${formatGamingPrice(Number.parseFloat(row.priceUsd))} / ${row.interval === "year" ? "year" : "month"}`

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-x flex flex-col items-center py-16 text-center md:py-24">
          <span className="flex size-16 items-center justify-center rounded-full bg-success/15 text-success">
            {active ? (
              <CheckCircle size={ICON_SIZE.feature} weight="duotone" aria-hidden="true" />
            ) : (
              <Clock size={ICON_SIZE.feature} aria-hidden="true" />
            )}
          </span>
          <h1 className="mt-6 font-display text-3xl font-bold tracking-tight text-foreground text-balance sm:text-4xl">
            {active ? "You're subscribed" : "Payment received"}
          </h1>
          <p className="mt-3 max-w-md text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
            {active
              ? `${title} is active — ${price}, billed by Fungies to ${row.billingEmail}.`
              : `We're confirming your payment for ${title}. This page updates once Fungies confirms it.`}
          </p>
          <p className="mt-2 font-mono text-xs text-muted-foreground">{row.reference}</p>

          {isGuest ? (
            <div className="w-full max-w-lg text-left">
              <ClaimAccountCard kind="subscription" email={row.billingEmail} name={row.billingName ?? ""} />
            </div>
          ) : (
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button render={<Link href="/account/gaming" />} nativeButton={false} className="h-11 rounded-full px-5 font-semibold">
                Manage subscription
                <ArrowRight size={ICON_SIZE.base} aria-hidden="true" />
              </Button>
              <Button
                variant="outline"
                render={<Link href="/gaming/products" />}
                nativeButton={false}
                className="h-11 rounded-full bg-transparent px-5 font-semibold"
              >
                Back to Gaming
              </Button>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

import type { Metadata } from "next"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CancelGamingSubscriptionButton } from "@/components/account/gaming-subscriptions"
import { listGamingSubscriptions } from "@/lib/gaming/billing"
import { formatGamingPrice } from "@/lib/gaming/catalog/pricing"
import { getGamingProductBySlug } from "@/lib/gaming/queries"
import { formatDate } from "@/lib/format"
import { getOptionalUserId } from "@/lib/session"
import { ArrowRight, Refresh, ICON_SIZE } from "@/lib/storefront-icons"

export const metadata: Metadata = {
  title: "Gaming subscriptions — DistroSource",
}

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  active: { label: "Active", variant: "default" },
  past_due: { label: "Payment due", variant: "destructive" },
  canceled: { label: "Canceled", variant: "outline" },
  expired: { label: "Expired", variant: "outline" },
}

export default async function AccountGamingPage() {
  const userId = await getOptionalUserId()
  const rows = userId ? await listGamingSubscriptions(userId) : []

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-border py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Refresh size={ICON_SIZE.feature} aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">No Gaming subscriptions yet</h2>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            Subscribe to a FiveM, Minecraft or community plan and it will appear here, with its renewal date and cancellation.
          </p>
        </div>
        <Button render={<Link href="/gaming/products" />} nativeButton={false} className="h-11 rounded-full px-5 font-semibold">
          Browse Gaming plans
          <ArrowRight size={ICON_SIZE.base} aria-hidden="true" />
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="font-display text-xl font-bold text-foreground">Gaming subscriptions</h2>
        <p className="mt-1 text-sm text-muted-foreground">Billed by Fungies. Cancelling keeps your access until the period you paid for ends.</p>
      </div>
      <ul className="flex flex-col gap-3">
        {rows.map((row) => {
          const product = getGamingProductBySlug(row.productSlug)
          const title = product?.title ?? row.productSlug
          const isActive = row.status === "active"
          const status = STATUS_BADGE[row.status] ?? { label: row.status, variant: "outline" as const }
          const periodEndLabel = row.currentPeriodEnd ? formatDate(row.currentPeriodEnd) : null
          return (
            <li key={row.reference} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-border bg-card p-5">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {product ? (
                    <Link href={`/gaming/product/${product.slug}`} className="font-display text-base font-bold text-foreground hover:underline">
                      {title}
                    </Link>
                  ) : (
                    <span className="font-display text-base font-bold text-foreground">{title}</span>
                  )}
                  <Badge variant={status.variant}>{isActive && row.cancelAtPeriodEnd ? "Ends soon" : status.label}</Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {formatGamingPrice(Number.parseFloat(row.priceUsd))} / {row.interval === "year" ? "year" : "month"}
                  {periodEndLabel && (
                    <>
                      <span className="px-1.5" aria-hidden="true">·</span>
                      {isActive ? (row.cancelAtPeriodEnd ? `Access ends ${periodEndLabel}` : `Renews ${periodEndLabel}`) : `Ended ${periodEndLabel}`}
                    </>
                  )}
                </p>
                <p className="mt-1 font-mono text-[11px] text-muted-foreground">{row.reference}</p>
              </div>
              {isActive && !row.cancelAtPeriodEnd && (
                <CancelGamingSubscriptionButton reference={row.reference} title={title} periodEndLabel={periodEndLabel} />
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

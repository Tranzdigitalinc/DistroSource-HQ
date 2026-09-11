import type { Metadata } from "next"
import Link from "next/link"
import { getMembershipView } from "@/lib/membership"
import { getOptionalUserId } from "@/lib/session"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CancelMembershipButton } from "@/components/account/manage-membership"
import { PriceDisplay } from "@/components/price-display"
import { formatDate } from "@/lib/format"
import { ArrowRight, Check, Gift, Sparkles, ICON_SIZE } from "@/lib/storefront-icons"

export const metadata: Metadata = {
  title: "Membership — DistroSource",
}

const STATUS_BADGE: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  active: { label: "Active", variant: "default" },
  past_due: { label: "Payment due", variant: "destructive" },
  canceled: { label: "Canceled", variant: "outline" },
  expired: { label: "Expired", variant: "outline" },
  pending: { label: "Pending", variant: "secondary" },
}

export default async function AccountMembershipPage() {
  const userId = await getOptionalUserId()
  const view = await getMembershipView(userId)

  if (!view) {
    return (
      <div className="flex flex-col items-center gap-5 rounded-2xl border border-dashed border-border py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Sparkles size={ICON_SIZE.feature} weight="duotone" aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">You&apos;re not a member yet</h2>
          <p className="mt-1.5 max-w-sm text-sm text-muted-foreground">
            Unlock a store-wide discount on every purchase, monthly download credits, and members-only perks.
          </p>
        </div>
        <Button render={<Link href="/membership" />} nativeButton={false} className="h-11 rounded-full px-5 font-semibold">
          View membership plans
          <ArrowRight size={ICON_SIZE.base} aria-hidden="true" />
        </Button>
      </div>
    )
  }

  const { subscription, plan, remainingCredits, isActive } = view
  const status = STATUS_BADGE[subscription.status] ?? { label: subscription.status, variant: "outline" as const }
  const periodEndLabel = subscription.currentPeriodEnd ? formatDate(subscription.currentPeriodEnd) : null
  const creditsLabel = remainingCredits === null ? "Unlimited" : String(remainingCredits)
  const creditsTotal = plan.monthlyCredits

  return (
    <div className="flex flex-col gap-6">
      {/* Plan status */}
      <section className="overflow-hidden rounded-2xl border border-border bg-card">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles size={ICON_SIZE.base} weight="duotone" aria-hidden="true" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg font-bold text-foreground">{plan.name}</h2>
                <Badge variant={status.variant}>{status.label}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                <PriceDisplay usdAmount={Number.parseFloat(subscription.priceUsd)} /> / {subscription.interval === "year" ? "year" : "month"}
              </p>
            </div>
          </div>
          {isActive && <CancelMembershipButton periodEndLabel={periodEndLabel} />}
        </div>

        <dl className="grid grid-cols-1 gap-px bg-border sm:grid-cols-3">
          <div className="bg-card p-5">
            <dt className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">Store discount</dt>
            <dd className="mt-1 font-display text-2xl font-bold text-foreground">{plan.discountPercent}%</dd>
            <p className="mt-0.5 text-xs text-muted-foreground">Applied automatically at checkout</p>
          </div>
          <div className="bg-card p-5">
            <dt className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">Credits this cycle</dt>
            <dd className="mt-1 font-display text-2xl font-bold text-foreground">
              {creditsLabel}
              {creditsTotal !== null && <span className="text-base font-medium text-muted-foreground"> / {creditsTotal}</span>}
            </dd>
            <p className="mt-0.5 text-xs text-muted-foreground">{remainingCredits === null ? "No limit" : "Resets next billing period"}</p>
          </div>
          <div className="bg-card p-5">
            <dt className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">
              {subscription.cancelAtPeriodEnd ? "Access ends" : isActive ? "Renews" : "Ended"}
            </dt>
            <dd className="mt-1 font-display text-2xl font-bold text-foreground">{periodEndLabel ?? "—"}</dd>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {subscription.cancelAtPeriodEnd ? "Cancellation scheduled" : isActive ? "Auto-renews via Fungies" : "No longer active"}
            </p>
          </div>
        </dl>
      </section>

      {/* Benefits + spend credits */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-border bg-card p-6">
          <h3 className="font-display text-base font-bold text-foreground">Your benefits</h3>
          <ul className="mt-4 flex flex-col gap-2.5">
            {plan.perks.map((perk) => (
              <li key={perk} className="flex items-start gap-2.5 text-sm">
                <Check size={ICON_SIZE.sm} weight="bold" className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                <span className="text-muted-foreground">{perk}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col rounded-2xl border border-border bg-card p-6">
          <div className="flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Gift size={ICON_SIZE.base} weight="duotone" aria-hidden="true" />
            </span>
            <h3 className="font-display text-base font-bold text-foreground">Spend your credits</h3>
          </div>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground">
            {isActive
              ? remainingCredits === null
                ? "You have unlimited credits this cycle. Claim any eligible product free from its page — look for “Claim with membership credit”."
                : remainingCredits > 0
                  ? `You have ${remainingCredits} credit${remainingCredits === 1 ? "" : "s"} left this cycle. Claim eligible products free — look for “Claim with membership credit” on the product page.`
                  : "You've used this cycle's credits. They top up again next billing period."
              : "Reactivate your membership to start earning download credits again."}
          </p>
          <Button
            render={<Link href="/products" />}
            nativeButton={false}
            variant="outline"
            className="mt-4 h-10 self-start rounded-full bg-transparent font-semibold"
          >
            Browse eligible products
            <ArrowRight size={ICON_SIZE.base} aria-hidden="true" />
          </Button>
        </div>
      </section>

      {!isActive && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/30 bg-primary/5 p-5">
          <p className="text-sm text-muted-foreground">Your membership isn&apos;t active. Resubscribe to restore your discount and credits.</p>
          <Button render={<Link href="/membership" />} nativeButton={false} className="h-10 rounded-full px-5 font-semibold">
            Resubscribe
          </Button>
        </div>
      )}
    </div>
  )
}

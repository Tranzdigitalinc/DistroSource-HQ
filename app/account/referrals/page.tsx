import { headers } from "next/headers"
import { Gift, Users } from "lucide-react"
import { getOrCreateMyReferralCode, getMyReferralStats } from "@/lib/actions/referrals"
import { CopyReferralLink } from "@/components/account/copy-referral-link"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/format"

export const metadata = {
  title: "Referrals — DistroSource",
}

function maskName(name: string | null) {
  if (!name) return "A new customer"
  const [first, ...rest] = name.trim().split(" ")
  return rest.length > 0 ? `${first} ${rest[rest.length - 1][0]}.` : first
}

const STATUS_LABEL: Record<string, { label: string; variant: "secondary" | "default" | "outline" }> = {
  pending: { label: "Reward processing", variant: "secondary" },
  rewarded: { label: "Reward earned", variant: "default" },
}

export default async function AccountReferralsPage() {
  await getOrCreateMyReferralCode()
  const { referral, redemptions } = await getMyReferralStats()

  if (!referral) {
    return <p className="text-sm text-muted-foreground">Your referral link is being set up. Refresh in a moment.</p>
  }

  const requestHeaders = await headers()
  const host = requestHeaders.get("host") ?? "redeemcove.com"
  const protocol = host.startsWith("localhost") ? "http" : "https"
  const referralUrl = `${protocol}://${host}/?ref=${referral.code}`

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-primary/20 bg-gradient-to-br from-primary/10 via-card to-card p-6">
        <div className="flex items-center gap-2 text-primary">
          <Gift className="size-5" aria-hidden="true" />
          <h2 className="font-display text-lg font-bold text-foreground">Give {referral.refereeDiscountPercent}%, get {referral.rewardDiscountPercent}%</h2>
        </div>
        <p className="mt-1 max-w-xl text-sm text-muted-foreground">
          Share your link. When a friend signs up and completes their first order, they get{" "}
          {referral.refereeDiscountPercent}% off automatically, and you earn a {referral.rewardDiscountPercent}%
          off coupon for your next order.
        </p>
        <div className="mt-4">
          <CopyReferralLink referralUrl={referralUrl} />
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          Your referral code: <span className="font-mono font-semibold text-foreground">{referral.code}</span>
        </p>
      </div>

      <div>
        <div className="mb-3 flex items-center gap-2">
          <Users className="size-4 text-muted-foreground" aria-hidden="true" />
          <h3 className="text-sm font-semibold">
            {redemptions.length} referral{redemptions.length === 1 ? "" : "s"}
          </h3>
        </div>

        {redemptions.length === 0 ? (
          <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-border bg-secondary/30 py-12 text-center">
            <p className="text-sm text-muted-foreground">No referrals yet — share your link to start earning.</p>
          </div>
        ) : (
          <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
            {redemptions.map((r) => {
              const status = STATUS_LABEL[r.status] ?? { label: r.status, variant: "outline" as const }
              return (
                <div key={r.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-sm font-semibold">{maskName(r.refereeName)}</p>
                    <p className="text-xs text-muted-foreground">
                      Joined {formatDate(r.createdAt)}
                      {r.orderTotal ? ` · First order $${Number.parseFloat(r.orderTotal).toFixed(2)}` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {r.rewardCouponCode && (
                      <span className="font-mono text-xs text-muted-foreground">{r.rewardCouponCode}</span>
                    )}
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

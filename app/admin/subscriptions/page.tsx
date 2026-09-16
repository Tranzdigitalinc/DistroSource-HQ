import { redirect } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import { CreditCard, Info, Repeat } from "lucide-react"
import { auth } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin-emails"
import { countMappedPlans, findUnsellableActivePlans, listSyncablePlans } from "@/lib/membership-fungies-sync"
import { getCategories } from "@/lib/queries/catalog"
import { areSubscriptionClubsEnabled } from "@/lib/env"
import { SubscriptionPlansSync } from "@/components/admin/subscription-plans-sync"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Subscriptions | DistroSource Admin",
  description: "Scoped pick-and-keep subscription plans and their Fungies billing.",
}

// The Fungies sync runs as a server action on this page, in small batches.
export const maxDuration = 60

const KIND_LABEL: Record<string, string> = { club: "Club", bundle: "Bundle", "all-access": "All-Access" }

export default async function AdminSubscriptionsPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in?next=/admin/subscriptions")
  if (!isAdminEmail(session.user.email)) redirect("/")

  const [plans, { mapped, total }, unsellable, categories] = await Promise.all([
    listSyncablePlans(),
    countMappedPlans(),
    findUnsellableActivePlans(),
    getCategories(),
  ])
  const categoryName = new Map(categories.map((c) => [c.slug, c.name]))
  const published = plans.filter((p) => p.isActive).length
  const pageEnabled = areSubscriptionClubsEnabled()

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Billing</p>
          <h1 className="mt-2 flex items-center gap-2 font-display text-3xl font-semibold tracking-tight text-foreground">
            <Repeat className="size-7 text-primary" aria-hidden="true" />
            Subscriptions
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {total} plans &middot; {mapped} set up in Fungies &middot; {published} live on the storefront
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" render={<Link href="/admin" />} nativeButton={false}>
            Back to control center
          </Button>
          <Button variant="outline" size="sm" render={<Link href="/subscriptions" />} nativeButton={false}>
            View storefront
          </Button>
        </div>
      </header>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader className="flex-row items-start gap-3 space-y-0">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Info className="size-4.5" aria-hidden="true" />
          </span>
          <div>
            <CardTitle className="text-base font-semibold">Pick and keep</CardTitle>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Each plan grants claims every billing cycle. A claim adds the product to the member&apos;s library permanently at the
              personal licence; commercial and agency rights run while the subscription is active. A plan only claims from its own
              departments, up to its per-claim value. The three store-wide tiers live on{" "}
              <Link href="/membership" className="font-medium text-primary underline-offset-4 hover:underline">
                /membership
              </Link>{" "}
              and are billed through their own Fungies plans.
              {!pageEnabled && (
                <>
                  {" "}
                  The storefront page is currently hidden: set{" "}
                  <code className="rounded bg-background px-1 py-0.5 font-mono text-xs">SUBSCRIPTION_CLUBS_ENABLED=1</code> to show it.
                </>
              )}
            </p>
          </div>
        </CardHeader>
      </Card>

      {unsellable.length > 0 && (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="py-4 text-sm text-destructive">
            {unsellable.length} published plan{unsellable.length === 1 ? " has" : "s have"} no Fungies plan and cannot be checked out:{" "}
            {unsellable.map((p) => p.name).join(", ")}. Sync them, or unpublish.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex-row items-start gap-3 space-y-0">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
            <CreditCard className="size-4.5" aria-hidden="true" />
          </span>
          <div>
            <CardTitle className="text-base font-semibold">Fungies billing</CardTitle>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              Each plan becomes its own Fungies Subscription product with one plan inside it. Syncing creates whatever is missing and
              links it here. Prices are not synced: every subscriber gets a single-use recurring offer priced from the plan row, so
              changing a price here needs no work in Fungies.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <SubscriptionPlansSync mapped={mapped} total={total} published={published} />
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {plans.map((plan) => {
          const scope = (plan.scopeCategorySlugs ?? []).map((s) => categoryName.get(s) ?? s)
          return (
            <Card key={plan.id}>
              <CardContent className="flex flex-wrap items-start gap-4 p-4">
                <div className="min-w-64 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-foreground">{plan.name}</span>
                    <Badge variant={plan.isActive ? "default" : "outline"}>{plan.isActive ? "Live" : "Unlisted"}</Badge>
                    <Badge variant={plan.fungiesPlanId ? "secondary" : "outline"}>
                      {plan.fungiesPlanId ? "In Fungies" : "Not in Fungies"}
                    </Badge>
                    <Badge variant="secondary">{KIND_LABEL[plan.kind] ?? plan.kind}</Badge>
                  </div>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">/subscriptions · {plan.slug}</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {plan.monthlyCredits === null ? "Unlimited claims" : `${plan.monthlyCredits} claim${plan.monthlyCredits === 1 ? "" : "s"}`} per cycle
                    {" · "}
                    {plan.creditValueCapUsd === null ? "any price" : `up to $${Number.parseFloat(plan.creditValueCapUsd).toFixed(0)} per claim`}
                    {" · "}
                    {scope.length ? scope.join(", ") : "every department"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <p className="text-base font-semibold text-foreground">${Number.parseFloat(plan.monthlyPriceUsd).toFixed(0)}/mo</p>
                  <p className="text-xs text-muted-foreground">${Number.parseFloat(plan.annualPriceUsd).toFixed(0)}/yr</p>
                  {plan.discountPercent > 0 && <p className="text-xs text-muted-foreground">{plan.discountPercent}% store discount</p>}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </main>
  )
}

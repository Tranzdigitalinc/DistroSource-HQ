import { redirect } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { getAffiliateCodes, getAffiliateReport } from "@/lib/actions/affiliates"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CreateAffiliateDialog } from "@/components/admin/create-affiliate-dialog"
import { ToggleAffiliateButton } from "@/components/admin/toggle-affiliate-button"
import { formatUsd } from "@/lib/format"

export const metadata = {
  title: "Affiliates | RedeemCove Admin",
  description: "Manage affiliate partner codes and view attribution performance.",
}

export default async function AdminAffiliatesPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const userEmail = session?.user?.email?.trim().toLowerCase()
  if (!session?.user) redirect("/sign-in?next=/admin/affiliates")
  if (userEmail !== "info@corevalleyjo.com") redirect("/")

  const [codes, report] = await Promise.all([getAffiliateCodes(), getAffiliateReport()])
  const reportByCode = new Map(report.map((r) => [r.code, r]))

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Administration</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">Affiliates</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Issue partner codes, and track attributed orders and revenue.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" render={<Link href="/admin" />} nativeButton={false}>
            Back to control center
          </Button>
          <CreateAffiliateDialog />
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Partner codes</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {codes.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No affiliate codes yet. Create one to start tracking partner-referred orders.
            </p>
          ) : (
            codes.map((c) => {
              const stats = reportByCode.get(c.code)
              return (
                <div
                  key={c.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <p className="font-mono text-sm font-semibold text-foreground">{c.code}</p>
                      <Badge variant={c.isActive ? "secondary" : "outline"}>{c.isActive ? "active" : "disabled"}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {c.partnerName}
                      {c.contactEmail ? ` · ${c.contactEmail}` : ""} · {c.commissionPercent}% commission
                    </p>
                    {c.notes ? <p className="text-xs text-muted-foreground">{c.notes}</p> : null}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">{stats?.orderCount ?? 0} orders</p>
                      <p className="text-xs text-muted-foreground">{formatUsd(stats?.revenueUsd ?? "0")} attributed</p>
                    </div>
                    <ToggleAffiliateButton id={c.id} isActive={c.isActive} />
                  </div>
                </div>
              )
            })
          )}
        </CardContent>
      </Card>
    </main>
  )
}

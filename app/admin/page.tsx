import { redirect } from "next/navigation"
import Link from "next/link"
import { ReloadlySyncPanel } from "@/components/admin/reloadly-sync-panel"
import { ReloadlySyncHealth } from "@/components/admin/reloadly-sync-health"
import { OperationsPanel } from "@/components/admin/operations-panel"
import { AnalyticsSummary } from "@/components/admin/analytics-summary"
import { InventoryAlertsPanel } from "@/components/admin/inventory-alerts-panel"
import { FraudQueuePanel } from "@/components/admin/fraud-queue-panel"
import { Button } from "@/components/ui/button"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export const metadata = {
  title: "Admin | RedeemCove",
  description: "RedeemCove administration.",
}

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const userEmail = session?.user?.email?.trim().toLowerCase()
  const isAdmin = userEmail === "info@corevalleyjo.com"

  if (!session?.user) redirect("/sign-in?next=/admin")
  if (!isAdmin) redirect("/")

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Administration</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-foreground">Catalog control center</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Signed in as {session.user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" render={<Link href="/admin/affiliates" />} nativeButton={false}>
            Affiliates
          </Button>
          <Button variant="outline" size="sm" render={<Link href="/admin/orders" />} nativeButton={false}>
            Manage orders
          </Button>
        </div>
      </header>
      <AnalyticsSummary />
      <FraudQueuePanel />
      <InventoryAlertsPanel />
      <ReloadlySyncHealth />
      <ReloadlySyncPanel />
      <OperationsPanel />
    </main>
  )
}

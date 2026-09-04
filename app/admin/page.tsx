import { redirect } from "next/navigation"
import Link from "next/link"
import {
  Package,
  FolderTree,
  Layers,
  Users,
  Star,
  LayoutTemplate,
  Building2,
  ShieldAlert,
  Users2,
  Receipt,
  ScrollText,
} from "lucide-react"
import { OperationsPanel } from "@/components/admin/operations-panel"
import { AnalyticsSummary } from "@/components/admin/analytics-summary"
import { FraudQueuePanel } from "@/components/admin/fraud-queue-panel"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { isAdminEmail } from "@/lib/admin-emails"

export const metadata = {
  title: "Admin | DistroSource",
  description: "DistroSource administration.",
}

const catalogSections = [
  { href: "/admin/products", label: "Products", description: "Create and edit digital products, files, and pricing.", icon: Package },
  { href: "/admin/categories", label: "Categories", description: "Organize the catalog into browsable categories.", icon: FolderTree },
  { href: "/admin/collections", label: "Collections", description: "Bundle related products together.", icon: Layers },
  { href: "/admin/homepage", label: "Homepage", description: "Manage featured rails and merchandising.", icon: LayoutTemplate },
]

const operationsSections = [
  { href: "/admin/orders", label: "Orders", description: "Refunds, receipts, and fraud flags.", icon: Receipt },
  { href: "/admin/customers", label: "Customers", description: "Look up accounts and their purchase history.", icon: Users },
  { href: "/admin/reviews", label: "Reviews", description: "Moderate customer product reviews.", icon: Star },
  { href: "/admin/team-licensing", label: "Team licensing", description: "Respond to bulk seat requests.", icon: Building2 },
  { href: "/admin/affiliates", label: "Affiliates", description: "Manage affiliate partners and payouts.", icon: Users2 },
  { href: "/admin/visitors", label: "Visitors", description: "Live site traffic and device breakdown.", icon: ShieldAlert },
  { href: "/admin/audit", label: "Audit log", description: "Review administrative activity history.", icon: ScrollText },
]

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const isAdmin = isAdminEmail(session?.user?.email)

  if (!session?.user) redirect("/sign-in?next=/admin")
  if (!isAdmin) redirect("/")

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Administration</p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-foreground">Control center</h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">Signed in as {session.user.email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" render={<Link href="/admin/orders" />} nativeButton={false}>
            Manage orders
          </Button>
        </div>
      </header>

      <AnalyticsSummary />
      <section aria-labelledby="polar-integration-title">
        <Card>
          <CardHeader>
            <CardTitle id="polar-integration-title" className="text-base">Polar Integration</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3 text-sm sm:grid-cols-3">
            <div><p className="text-muted-foreground">Generic Polar Product</p><p className="font-semibold text-foreground">{process.env.POLAR_PRODUCT_ID ? "Connected" : "Missing"}</p></div>
            <div><p className="text-muted-foreground">Webhook</p><p className="font-semibold text-foreground">{process.env.POLAR_WEBHOOK_SECRET ? "Configured" : "Missing"}</p></div>
            <div><p className="text-muted-foreground">Server</p><p className="font-semibold text-foreground">{process.env.POLAR_SERVER === "production" ? "Production" : "Sandbox"}</p></div>
          </CardContent>
        </Card>
      </section>
      <FraudQueuePanel />

      <section aria-labelledby="catalog-title" className="flex flex-col gap-4">
        <h2 id="catalog-title" className="font-display text-lg font-semibold tracking-tight text-foreground">
          Catalog
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {catalogSections.map(({ href, label, description, icon: Icon }) => (
            <Link key={href} href={href} className="group">
              <Card className="h-full transition-colors group-hover:border-primary/40">
                <CardHeader className="flex-row items-start gap-3 space-y-0">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-4.5" aria-hidden="true" />
                  </span>
                  <div>
                    <CardTitle className="text-base font-semibold">{label}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="operations-title" className="flex flex-col gap-4">
        <h2 id="operations-title" className="font-display text-lg font-semibold tracking-tight text-foreground">
          Operations
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {operationsSections.map(({ href, label, description, icon: Icon }) => (
            <Link key={href} href={href} className="group">
              <Card className="h-full transition-colors group-hover:border-primary/40">
                <CardHeader className="flex-row items-start gap-3 space-y-0">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground">
                    <Icon className="size-4.5" aria-hidden="true" />
                  </span>
                  <div>
                    <CardTitle className="text-base font-semibold">{label}</CardTitle>
                    <p className="mt-1 text-sm text-muted-foreground">{description}</p>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <OperationsPanel />
    </main>
  )
}

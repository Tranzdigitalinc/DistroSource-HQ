import { redirect } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { searchOrders } from "@/lib/actions/order-management"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export const metadata = {
  title: "Orders | RedeemCove Admin",
  description: "Search and manage orders for refunds, replacements, and fraud review.",
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  const userEmail = session?.user?.email?.trim().toLowerCase()
  if (!session?.user) redirect("/sign-in?next=/admin/orders")
  if (userEmail !== "info@corevalleyjo.com") redirect("/")

  const params = await searchParams
  const query = params.q ?? ""
  const orders = await searchOrders(query)

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Administration</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">Orders</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Search by order number or billing email to refund, replace a code, or flag for fraud review.</p>
        </div>
        <Button variant="outline" size="sm" render={<Link href="/admin" />} nativeButton={false}>
          Back to control center
        </Button>
      </header>

      <form className="flex gap-2" action="/admin/orders">
        <Input type="search" name="q" defaultValue={query} placeholder="Order number or email" className="max-w-sm" />
        <Button type="submit" variant="outline">Search</Button>
      </form>

      <Card>
        <CardHeader>
          <CardTitle>{query ? `Results for "${query}"` : "Recent orders"}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {orders.length === 0 ? (
            <p className="text-sm text-muted-foreground">No orders found.</p>
          ) : (
            orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.orderNumber}`}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3 transition-colors hover:bg-secondary/30"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{order.orderNumber} — {order.billingName}</p>
                  <p className="truncate text-xs text-muted-foreground">{order.billingEmail} · {order.createdAt.toLocaleString()}</p>
                </div>
                <div className="flex shrink-0 items-center gap-3">
                  <span className="text-sm font-semibold">${order.totalUsd}</span>
                  <Badge variant={order.status === "refunded" ? "destructive" : "secondary"}>{order.status}</Badge>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>
    </main>
  )
}

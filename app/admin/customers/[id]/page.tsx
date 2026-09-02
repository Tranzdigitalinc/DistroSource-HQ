import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { headers as nextHeaders } from "next/headers"
import { auth } from "@/lib/auth"
import { getCustomerDetail } from "@/lib/actions/admin-customers"
import { isAdminEmail } from "@/lib/admin-emails"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"

export const metadata = {
  title: "Customer detail | DistroSource Admin",
}

export default async function AdminCustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await nextHeaders() })
  if (!session?.user || !isAdminEmail(session.user.email)) redirect("/sign-in")

  const { id } = await params
  const detail = await getCustomerDetail(id)
  if (!detail) notFound()

  const { customer, orders, entitlements, tickets } = detail

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Button variant="outline" size="sm" render={<Link href="/admin/customers" />} nativeButton={false}>
            <ArrowLeft className="h-4 w-4" />
            Customers
          </Button>
          <h1 className="mt-4 font-display text-2xl font-semibold tracking-tight text-foreground">{customer.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {customer.email} · Joined {customer.createdAt.toLocaleDateString()}
          </p>
        </div>
        <Badge variant={customer.role === "admin" ? "default" : "secondary"} className="capitalize">
          {customer.role}
        </Badge>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Orders ({orders.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {orders.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground">No orders yet.</p>
          ) : (
            orders.map((order) => (
              <Link
                key={order.id}
                href={`/admin/orders/${order.orderNumber}`}
                className="flex items-center justify-between gap-3 py-3 hover:text-primary"
              >
                <div>
                  <p className="text-sm font-medium">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">{order.createdAt.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">${Number.parseFloat(order.totalUsd).toFixed(2)}</span>
                  <Badge variant={order.status === "refunded" ? "destructive" : "secondary"} className="capitalize">
                    {order.status}
                  </Badge>
                </div>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active downloads ({entitlements.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {entitlements.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground">No active entitlements.</p>
          ) : (
            entitlements.map(({ entitlement, product }) => (
              <Link
                key={entitlement.id}
                href={`/admin/products/${product.id}`}
                className="flex items-center justify-between gap-3 py-3 hover:text-primary"
              >
                <p className="text-sm font-medium">{product.name}</p>
                <span className="text-xs text-muted-foreground">Granted {entitlement.createdAt.toLocaleDateString()}</span>
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Support tickets ({tickets.length})</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col divide-y divide-border">
          {tickets.length === 0 ? (
            <p className="py-2 text-sm text-muted-foreground">No support tickets.</p>
          ) : (
            tickets.map((ticket) => (
              <div key={ticket.id} className="flex items-center justify-between gap-3 py-3">
                <div>
                  <p className="text-sm font-medium">{ticket.subject}</p>
                  <p className="text-xs text-muted-foreground">{ticket.createdAt.toLocaleString()}</p>
                </div>
                <Badge variant={ticket.status === "open" ? "default" : "secondary"} className="capitalize">
                  {ticket.status}
                </Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </main>
  )
}

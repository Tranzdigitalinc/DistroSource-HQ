import { redirect, notFound } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { getOrderForAdmin } from "@/lib/actions/order-management"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RefundOrderButton } from "@/components/admin/refund-order-button"
import { ReplaceItemButton } from "@/components/admin/replace-item-button"
import { FraudFlagControl } from "@/components/admin/fraud-flag-control"
import { isAdminEmail } from "@/lib/admin-emails"

export const metadata = {
  title: "Order detail | RedeemCove Admin",
  description: "Manage refunds, replacements, and fraud flags for a single order.",
}

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in?next=/admin/orders")
  if (!isAdminEmail(session.user.email)) redirect("/")

  const { orderNumber } = await params
  const data = await getOrderForAdmin(orderNumber)
  if (!data) notFound()

  const { order, items, isFlagged } = data

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Administration</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">Order {order.orderNumber}</h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{order.billingName} · {order.billingEmail}</p>
        </div>
        <Button variant="outline" size="sm" render={<Link href="/admin/orders" />} nativeButton={false}>
          Back to orders
        </Button>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <Badge variant={order.status === "refunded" ? "destructive" : "secondary"}>{order.status}</Badge>
        {isFlagged ? <Badge variant="destructive">Flagged for fraud review</Badge> : null}
        <span className="text-sm text-muted-foreground">Placed {order.createdAt.toLocaleString()}</span>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Summary</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div><p className="text-xs text-muted-foreground">Subtotal</p><p className="text-sm font-medium">${order.subtotalUsd}</p></div>
          <div><p className="text-xs text-muted-foreground">Discount</p><p className="text-sm font-medium">${order.discountUsd}</p></div>
          <div><p className="text-xs text-muted-foreground">Total</p><p className="text-sm font-medium">${order.totalUsd}</p></div>
          <div><p className="text-xs text-muted-foreground">Payment method</p><p className="text-sm font-medium capitalize">{order.paymentMethod}</p></div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border p-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{item.productName} — {item.denominationLabel} {item.quantity > 1 ? `x${item.quantity}` : ""}</p>
                <p className="truncate font-mono text-xs text-muted-foreground">{item.redemptionCode}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {item.isVoided ? <Badge variant="destructive">Voided</Badge> : null}
                {!item.isVoided && order.status !== "refunded" ? <ReplaceItemButton orderItemId={item.id} /> : null}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          {order.status !== "refunded" ? (
            <RefundOrderButton orderId={order.id} orderNumber={order.orderNumber} totalUsd={order.totalUsd} />
          ) : (
            <Badge variant="secondary">Already refunded</Badge>
          )}
          <FraudFlagControl orderId={order.id} isFlagged={isFlagged} />
        </CardContent>
      </Card>
    </main>
  )
}

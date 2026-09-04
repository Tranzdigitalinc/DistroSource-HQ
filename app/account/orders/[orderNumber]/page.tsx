import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft, Download, ICON_SIZE } from "@/lib/storefront-icons"
import { getOrderByNumber } from "@/lib/actions/account"
import { OrderItemsList } from "@/components/order/order-items-list"
import { OrderStatusBadge } from "@/components/order/order-status-badge"
import { ResendConfirmationButton } from "@/components/order/resend-confirmation-button"
import { PriceDisplay } from "@/components/price-display"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Order detail — DistroSource",
}

const PAYMENT_LABEL: Record<string, string> = { polar: "Polar", paypal: "PayPal", free: "Free product", card: "Card" }

export default async function OrderDetailPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params
  const data = await getOrderByNumber(orderNumber)
  if (!data) notFound()

  const { order, items } = data
  const isPaid = order.status === "completed" || order.status === "partially_refunded"
  const refunded = order.polarRefundedAmount ? Number.parseFloat(order.polarRefundedAmount) : 0
  const paidAmount = order.polarPaidAmount ? Number.parseFloat(order.polarPaidAmount) : Number.parseFloat(order.totalUsd)

  const facts: [string, React.ReactNode][] = [
    ["Placed", new Date(order.createdAt).toLocaleDateString("en-US", { dateStyle: "long" })],
    ["Payment", PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod],
    ["Payment status", isPaid ? "Paid" : order.status === "pending_payment" ? "Awaiting confirmation" : "Not paid"],
    ...(refunded > 0
      ? ([["Refunded", <PriceDisplay key="r" usdAmount={refunded} />]] as [string, React.ReactNode][])
      : []),
    ["Billing", `${order.billingName} · ${order.billingEmail}`],
  ]

  return (
    <div className="flex flex-col gap-6">
      <Link href="/account/orders" className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
        <ChevronLeft size={ICON_SIZE.sm} aria-hidden="true" />
        All orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-mono text-lg font-semibold">{order.orderNumber}</h2>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {items.length} {items.length === 1 ? "item" : "items"} ·{" "}
            <PriceDisplay usdAmount={Number.parseFloat(order.totalUsd)} className="font-semibold text-foreground" />
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isPaid && (
            <Button size="sm" render={<Link href="/account/library" />} nativeButton={false} className="font-semibold">
              <Download size={ICON_SIZE.sm} aria-hidden="true" />
              Open in library
            </Button>
          )}
          <ResendConfirmationButton orderNumber={order.orderNumber} />
        </div>
      </div>

      {order.status === "pending_payment" && (
        <p className="rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
          Polar is still confirming this payment. Your products unlock automatically once it clears.
        </p>
      )}
      {(order.status === "refunded" || order.status === "partially_refunded") && (
        <p className="rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm text-muted-foreground">
          {order.status === "refunded"
            ? "This order was refunded in full and download access for its items has been revoked."
            : "This order was partially refunded. Access to the remaining items is unchanged."}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <section className="rounded-lg border border-border bg-card">
          <h3 className="border-b border-border px-5 py-3.5 font-display text-sm font-bold">Items</h3>
          <div className="px-5 py-2">
            <OrderItemsList items={items} />
          </div>
          <dl className="flex flex-col gap-1.5 border-t border-border px-5 py-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd><PriceDisplay usdAmount={Number.parseFloat(order.subtotalUsd)} /></dd>
            </div>
            {Number.parseFloat(order.discountUsd) > 0 && (
              <div className="flex justify-between text-success">
                <dt>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</dt>
                <dd>−<PriceDisplay usdAmount={Number.parseFloat(order.discountUsd)} /></dd>
              </div>
            )}
            <div className="flex justify-between border-t border-border pt-2 font-display text-base font-bold">
              <dt>{isPaid ? "Total paid" : "Total"}</dt>
              <dd><PriceDisplay usdAmount={isPaid ? paidAmount : Number.parseFloat(order.totalUsd)} /></dd>
            </div>
          </dl>
        </section>

        <aside className="h-fit rounded-lg border border-border bg-card">
          <h3 className="border-b border-border px-5 py-3.5 font-display text-sm font-bold">Details</h3>
          <dl className="divide-y divide-border">
            {facts.map(([k, v]) => (
              <div key={k} className="px-5 py-3">
                <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{k}</dt>
                <dd className="mt-0.5 break-words text-sm text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </div>
  )
}

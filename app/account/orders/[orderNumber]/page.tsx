import Link from "next/link"
import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import { getOrderByNumber } from "@/lib/actions/account"
import { OrderItemsList } from "@/components/order/order-items-list"
import { ResendConfirmationButton } from "@/components/order/resend-confirmation-button"
import { PriceDisplay } from "@/components/price-display"
import { Badge } from "@/components/ui/badge"

export const metadata = {
  title: "Order detail — DistroSource",
}

export default async function OrderDetailPage({ params }: { params: Promise<{ orderNumber: string }> }) {
  const { orderNumber } = await params
  const data = await getOrderByNumber(orderNumber)
  if (!data) notFound()

  const { order, items } = data

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/account/orders"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ChevronLeft className="size-4" aria-hidden="true" />
        Back to orders
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-mono text-lg font-semibold">{order.orderNumber}</h2>
            <Badge variant="secondary" className="capitalize">
              {order.status}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <ResendConfirmationButton orderNumber={order.orderNumber} />
      </div>

      <div className="rounded-xl border border-border bg-card p-6">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Items
        </h3>
        <OrderItemsList items={items} />
        <div className="mt-4 flex flex-col gap-1.5 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <PriceDisplay usdAmount={Number.parseFloat(order.subtotalUsd)} />
          </div>
          {Number.parseFloat(order.discountUsd) > 0 && (
            <div className="flex justify-between text-success">
              <span>Discount{order.couponCode ? ` (${order.couponCode})` : ""}</span>
              <span>
                -<PriceDisplay usdAmount={Number.parseFloat(order.discountUsd)} />
              </span>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-2 font-display text-base font-bold">
            <span>Total paid</span>
            <PriceDisplay usdAmount={Number.parseFloat(order.totalUsd)} />
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-secondary/40 p-5 text-sm text-muted-foreground">
        <p>
          Billing: {order.billingName} &middot; {order.billingEmail}
        </p>
        <p className="mt-1 capitalize">Payment method: {order.paymentMethod}</p>
      </div>
    </div>
  )
}

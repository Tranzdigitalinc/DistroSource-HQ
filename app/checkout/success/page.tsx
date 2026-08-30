import Link from "next/link"
import { notFound } from "next/navigation"
import { CheckCircle2 } from "lucide-react"
import { getOrderByNumber } from "@/lib/actions/account"
import { OrderItemsList } from "@/components/order/order-items-list"
import { PriceDisplay } from "@/components/price-display"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Order confirmed — RedeemCove",
}

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>
}) {
  const { order: orderNumber } = await searchParams
  if (!orderNumber) notFound()

  const data = await getOrderByNumber(orderNumber)
  if (!data) notFound()

  const { order, items } = data

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 md:px-6">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-success/15">
          <CheckCircle2 className="size-8 text-success" aria-hidden="true" />
        </div>
        <h1 className="font-display text-2xl font-bold md:text-3xl">Order confirmed</h1>
        <p className="text-sm text-muted-foreground">
          Order <span className="font-mono font-semibold text-foreground">{order.orderNumber}</span> — your codes
          are ready to reveal below and were also sent to {order.billingEmail}.
        </p>
      </div>

      <div className="mt-8 rounded-xl border border-border bg-card p-6">
        <OrderItemsList items={items} />
        <div className="mt-4 flex flex-col gap-1.5 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <PriceDisplay usdAmount={Number.parseFloat(order.subtotalUsd)} />
          </div>
          {Number.parseFloat(order.discountUsd) > 0 && (
            <div className="flex justify-between text-success">
              <span>Discount</span>
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

      <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
        <Button variant="outline" className="bg-transparent" render={<Link href="/account/orders" />} nativeButton={false}>
          View all orders
        </Button>
        <Button render={<Link href="/products" />} nativeButton={false}>
          Continue shopping
        </Button>
      </div>
    </div>
  )
}

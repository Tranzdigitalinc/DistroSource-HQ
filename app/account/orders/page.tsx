import Link from "next/link"
import { ArrowRight, Package, ICON_SIZE } from "@/lib/storefront-icons"
import { getUserOrderItems } from "@/lib/actions/account"
import { PriceDisplay } from "@/components/price-display"
import { Button } from "@/components/ui/button"
import { OrderStatusBadge } from "@/components/order/order-status-badge"
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal"

export const metadata = {
  title: "Your orders — DistroSource",
}

export default async function AccountOrdersPage() {
  const orderGroups = await getUserOrderItems()

  if (orderGroups.length === 0) {
    return (
      <Reveal className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-lg border border-border bg-card px-6 py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <Package size={ICON_SIZE.feature} aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-display text-lg font-bold">No orders yet</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">Orders appear here as soon as you place one.</p>
        </div>
        <Button render={<Link href="/products" />} nativeButton={false} className="font-semibold">
          Browse products
          <ArrowRight size={ICON_SIZE.base} aria-hidden="true" />
        </Button>
      </Reveal>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-xl font-bold tracking-tight">Orders</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {orderGroups.length} {orderGroups.length === 1 ? "order" : "orders"}
        </p>
      </div>

      <RevealGroup className="overflow-hidden rounded-lg border border-border bg-card" stagger={0.03}>
        {orderGroups.map(({ order, items }) => (
          <RevealItem key={order.id}>
            <Link
              href={`/account/orders/${order.orderNumber}`}
              className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 border-b border-border px-4 py-4 transition-colors last:border-0 hover:bg-secondary/40 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_auto_auto]"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-semibold text-foreground">{order.orderNumber}</span>
                  <OrderStatusBadge status={order.status} />
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  {new Date(order.createdAt).toLocaleDateString("en-US", { dateStyle: "medium" })}
                </p>
              </div>

              <p className="hidden truncate text-sm text-muted-foreground sm:block">
                {items.slice(0, 2).map((i) => i.productName).join(", ")}
                {items.length > 2 ? ` +${items.length - 2} more` : ""}
              </p>

              <div className="text-right">
                <PriceDisplay usdAmount={Number.parseFloat(order.totalUsd)} className="font-display text-base font-bold text-foreground" />
                <p className="text-[11px] text-muted-foreground">
                  {items.length} {items.length === 1 ? "item" : "items"}
                </p>
              </div>

              <span className="hidden text-xs font-medium text-muted-foreground sm:flex sm:items-center sm:gap-1">
                View
                <ArrowRight size={12} aria-hidden="true" />
              </span>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>
    </div>
  )
}

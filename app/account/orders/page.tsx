import Link from "next/link"
import { Package } from "lucide-react"
import { getUserOrderItems } from "@/lib/actions/account"
import { PriceDisplay } from "@/components/price-display"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Your orders — RedeemCove",
}

const statusVariant: Record<string, "default" | "secondary" | "outline"> = {
  completed: "secondary",
  processing: "outline",
  refunded: "outline",
  cancelled: "outline",
}

export default async function AccountOrdersPage() {
  const orderGroups = await getUserOrderItems()

  if (orderGroups.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-secondary/30 py-16 text-center">
        <Package className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">You haven&apos;t placed any orders yet.</p>
        <Button size="sm" render={<Link href="/products" />} nativeButton={false}>
          Browse products
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {orderGroups.map(({ order, items }) => (
        <Link
          key={order.id}
          href={`/account/orders/${order.orderNumber}`}
          className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <div className="flex items-center gap-2">
              <p className="font-mono text-sm font-semibold">{order.orderNumber}</p>
              <Badge variant={statusVariant[order.status] ?? "outline"} className="capitalize">
                {order.status}
              </Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(order.createdAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              })}{" "}
              · {items.length} {items.length === 1 ? "item" : "items"}
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              {items
                .slice(0, 2)
                .map((i) => i.productName)
                .join(", ")}
              {items.length > 2 ? ` +${items.length - 2} more` : ""}
            </p>
          </div>
          <PriceDisplay usdAmount={Number.parseFloat(order.totalUsd)} className="font-display text-lg font-bold" />
        </Link>
      ))}
    </div>
  )
}

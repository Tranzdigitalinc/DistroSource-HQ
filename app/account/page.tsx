import Link from "next/link"
import { Package, KeyRound, Heart, LifeBuoy, ArrowRight } from "lucide-react"
import { getUserOrderItems } from "@/lib/actions/account"
import { getWishlistItems } from "@/lib/actions/wishlist"
import { PriceDisplay } from "@/components/price-display"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Account overview — RedeemCove",
}

export default async function AccountOverviewPage() {
  const [orderGroups, wishlistItems] = await Promise.all([getUserOrderItems(), getWishlistItems()])

  const totalOrders = orderGroups.length
  const totalCodes = orderGroups.reduce((sum, g) => sum + g.items.length, 0)
  const totalSpent = orderGroups.reduce((sum, g) => sum + Number.parseFloat(g.order.totalUsd), 0)
  const recentOrders = orderGroups.slice(0, 3)

  const stats = [
    { label: "Orders placed", value: totalOrders, icon: Package, href: "/account/orders" },
    { label: "Codes owned", value: totalCodes, icon: KeyRound, href: "/account/codes" },
    { label: "Wishlist items", value: wishlistItems.length, icon: Heart, href: "/account/wishlist" },
  ]

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group flex flex-col gap-3 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40"
          >
            <div className="flex items-center justify-between">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <stat.icon className="size-4.5" aria-hidden="true" />
              </span>
              <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </div>
            <div>
              <p className="font-display text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Lifetime spend</h2>
        </div>
        <p className="mt-2 font-display text-3xl font-bold text-primary">
          <PriceDisplay usdAmount={totalSpent} />
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Across {totalOrders} completed orders</p>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Recent orders</h2>
          <Button variant="ghost" size="sm" render={<Link href="/account/orders" />} nativeButton={false}>
            View all
          </Button>
        </div>

        {recentOrders.length === 0 ? (
          <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-secondary/30 py-10 text-center">
            <p className="text-sm text-muted-foreground">You haven&apos;t placed any orders yet.</p>
            <Button size="sm" render={<Link href="/products" />} nativeButton={false}>
              Browse products
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {recentOrders.map(({ order, items }) => (
              <Link
                key={order.id}
                href={`/account/orders/${order.orderNumber}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40"
              >
                <div>
                  <p className="font-mono text-sm font-semibold">{order.orderNumber}</p>
                  <p className="text-xs text-muted-foreground">
                    {items.length} {items.length === 1 ? "item" : "items"} ·{" "}
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <PriceDisplay usdAmount={Number.parseFloat(order.totalUsd)} className="font-display font-semibold" />
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-secondary/40 p-5">
        <div className="flex items-center gap-3">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <LifeBuoy className="size-4.5" aria-hidden="true" />
          </span>
          <div className="flex-1">
            <p className="text-sm font-semibold">Need help with an order?</p>
            <p className="text-sm text-muted-foreground">Our support team responds to every ticket personally.</p>
          </div>
          <Button variant="outline" size="sm" className="bg-transparent shrink-0" render={<Link href="/account/support" />} nativeButton={false}>
            Contact support
          </Button>
        </div>
      </div>
    </div>
  )
}

import Link from "next/link"
import { Package, Library, Heart, LifeBuoy, ArrowRight } from "lucide-react"
import { getUserLibrary, getUserOrderItems } from "@/lib/actions/account"
import { getWishlistItems } from "@/lib/actions/wishlist"
import { getRecentlyViewed } from "@/lib/actions/recently-viewed"
import { ProductGrid } from "@/components/catalog/product-grid"
import { PriceDisplay } from "@/components/price-display"
import { Button } from "@/components/ui/button"
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal"

export const metadata = {
  title: "Account overview — DistroSource",
}

export default async function AccountOverviewPage() {
  const [orderGroups, library, wishlistItems, recentlyViewed] = await Promise.all([
    getUserOrderItems(),
    getUserLibrary(),
    getWishlistItems(),
    getRecentlyViewed(),
  ])

  const totalOrders = orderGroups.length
  const totalSpent = orderGroups.reduce((sum, g) => sum + Number.parseFloat(g.order.totalUsd), 0)
  const recentOrders = orderGroups.slice(0, 3)

  const stats = [
    { label: "Orders placed", value: totalOrders, icon: Package, href: "/account/orders" },
    { label: "Products owned", value: library.length, icon: Library, href: "/account/library" },
    { label: "Wishlist items", value: wishlistItems.length, icon: Heart, href: "/account/wishlist" },
  ]

  return (
    <div className="flex flex-col gap-8">
      <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-3" stagger={0.08}>
        {stats.map((stat) => (
          <RevealItem key={stat.label}>
            <Link
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
          </RevealItem>
        ))}
      </RevealGroup>

      <Reveal className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Lifetime spend</h2>
        </div>
        <p className="mt-2 font-display text-3xl font-bold text-primary">
          <PriceDisplay usdAmount={totalSpent} />
        </p>
        <p className="mt-1 text-sm text-muted-foreground">Across {totalOrders} completed orders</p>
      </Reveal>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Recent orders</h2>
          <Button variant="ghost" size="sm" render={<Link href="/account/orders" />} nativeButton={false}>
            View all
          </Button>
        </div>

        {recentOrders.length === 0 ? (
          <Reveal className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-secondary/30 py-10 text-center">
            <p className="text-sm text-muted-foreground">You haven&apos;t placed any orders yet.</p>
            <Button size="sm" render={<Link href="/products" />} nativeButton={false}>
              Browse products
            </Button>
          </Reveal>
        ) : (
          <RevealGroup className="flex flex-col gap-3" stagger={0.06}>
            {recentOrders.map(({ order, items }) => (
              <RevealItem key={order.id}>
                <Link
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
                  <PriceDisplay
                    usdAmount={Number.parseFloat(order.totalUsd)}
                    className="font-display font-semibold"
                  />
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        )}
      </div>

      {recentlyViewed.length > 0 && (
        <Reveal className="border-t border-border pt-8">
          <div className="mb-4 flex items-center justify-between"><h2 className="font-display text-lg font-semibold">Recently viewed</h2><Button variant="ghost" size="sm" render={<Link href="/products" />} nativeButton={false}>Keep browsing</Button></div>
          <ProductGrid items={recentlyViewed as any} />
        </Reveal>
      )}

      <Reveal className="rounded-xl border border-border bg-secondary/40 p-5">
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
      </Reveal>
    </div>
  )
}

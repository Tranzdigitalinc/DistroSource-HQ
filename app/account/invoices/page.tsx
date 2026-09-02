import Link from "next/link"
import { FileText, ChevronRight } from "lucide-react"
import { getUserInvoices } from "@/lib/actions/account"
import { formatDate } from "@/lib/format"
import { PriceDisplay } from "@/components/price-display"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal"

export const metadata = {
  title: "Invoices — DistroSource",
}

export default async function AccountInvoicesPage() {
  const invoices = await getUserInvoices()

  if (invoices.length === 0) {
    return (
      <Reveal className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-secondary/30 py-16 text-center">
        <FileText className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">You don&apos;t have any invoices yet.</p>
        <Button size="sm" render={<Link href="/products" />} nativeButton={false}>
          Browse products
        </Button>
      </Reveal>
    )
  }

  return (
    <RevealGroup className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card" stagger={0.04}>
      {invoices.map(({ order, items }) => (
        <RevealItem key={order.id}>
          <Link
            href={`/account/invoices/${order.orderNumber}`}
            className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:bg-secondary/40"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-mono text-sm font-semibold">{order.orderNumber}</p>
                <Badge variant="secondary" className="capitalize">
                  {order.status}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDate(order.createdAt)} &middot; {items.length} {items.length === 1 ? "item" : "items"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <PriceDisplay usdAmount={order.totalUsd} className="text-sm font-semibold" />
              <ChevronRight className="size-4 text-muted-foreground" aria-hidden="true" />
            </div>
          </Link>
        </RevealItem>
      ))}
    </RevealGroup>
  )
}

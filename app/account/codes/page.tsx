import Link from "next/link"
import { KeyRound } from "lucide-react"
import { getUserOrderItems } from "@/lib/actions/account"
import { RevealCode } from "@/components/order/reveal-code"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "My codes — RedeemCove",
}

export default async function AccountCodesPage() {
  const orderGroups = await getUserOrderItems()

  const codes = orderGroups.flatMap((group) =>
    group.items.map((item) => ({ ...item, orderNumber: group.order.orderNumber, orderDate: group.order.createdAt })),
  )

  if (codes.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-secondary/30 py-16 text-center">
        <KeyRound className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">You don&apos;t own any digital codes yet.</p>
        <Button size="sm" render={<Link href="/products" />} nativeButton={false}>
          Browse products
        </Button>
      </div>
    )
  }

  return (
    <div className="flex flex-col divide-y divide-border rounded-xl border border-border bg-card">
      {codes.map((item) => (
        <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="text-sm font-semibold">{item.productName}</p>
            <p className="text-xs text-muted-foreground">
              {item.denominationLabel} ·{" "}
              <Link href={`/account/orders/${item.orderNumber}`} className="font-mono hover:text-foreground hover:underline">
                {item.orderNumber}
              </Link>{" "}
              · {new Date(item.orderDate).toLocaleDateString()}
            </p>
          </div>
          <RevealCode orderItemId={item.id} isRevealed={item.isRevealed} />
        </div>
      ))}
    </div>
  )
}

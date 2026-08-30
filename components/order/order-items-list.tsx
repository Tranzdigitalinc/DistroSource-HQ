import { RevealCode } from "@/components/order/reveal-code"
import { PriceDisplay } from "@/components/price-display"

interface OrderItem {
  id: number
  productName: string
  denominationLabel: string
  unitPriceUsd: string
  quantity: number
  isRevealed: boolean
}

export function OrderItemsList({ items }: { items: OrderItem[] }) {
  return (
    <div className="flex flex-col divide-y divide-border">
      {items.map((item) => (
        <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <p className="text-sm font-semibold">{item.productName}</p>
            <p className="text-xs text-muted-foreground">
              {item.denominationLabel} · Qty {item.quantity} ·{" "}
              <PriceDisplay usdAmount={Number.parseFloat(item.unitPriceUsd) * item.quantity} />
            </p>
          </div>
          <RevealCode orderItemId={item.id} isRevealed={item.isRevealed} />
        </div>
      ))}
    </div>
  )
}

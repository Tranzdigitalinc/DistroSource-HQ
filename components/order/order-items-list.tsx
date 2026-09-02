import Link from "next/link"
import { Download } from "lucide-react"
import { PriceDisplay } from "@/components/price-display"
import { formatLicenseType } from "@/lib/format"

interface OrderItem {
  id: number
  productName: string
  licenseType: string
  unitPriceUsd: string
  quantity: number
}

export function OrderItemsList({ items }: { items: OrderItem[] }) {
  return (
    <div className="flex flex-col divide-y divide-border">
      {items.map((item) => (
        <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
          <div>
            <p className="text-sm font-semibold">{item.productName}</p>
            <p className="text-xs text-muted-foreground">
              {formatLicenseType(item.licenseType)} license · Qty {item.quantity} ·{" "}
              <PriceDisplay usdAmount={Number.parseFloat(item.unitPriceUsd) * item.quantity} />
            </p>
          </div>
          <Link
            href="/account/library"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-transparent px-2.5 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-secondary"
          >
            <Download className="size-3.5" />
            Download
          </Link>
        </div>
      ))}
    </div>
  )
}

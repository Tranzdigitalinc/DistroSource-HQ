import Image from "next/image"
import Link from "next/link"
import { Download, ImageOff, ICON_SIZE } from "@/lib/storefront-icons"
import { PriceDisplay } from "@/components/price-display"
import { licenseLabel } from "@/lib/licenses"

export interface OrderItemRow {
  id: number
  productName: string
  licenseType: string
  unitPriceUsd: string
  quantity: number
  productSlug?: string | null
  imageUrl?: string | null
}

/**
 * Purchased products on the success page and order detail. "Download" goes
 * to My Library, which is the only place the secure download route is
 * issued from — this list never links to a file directly.
 */
export function OrderItemsList({ items, showActions = true }: { items: OrderItemRow[]; showActions?: boolean }) {
  return (
    <ul className="flex flex-col divide-y divide-border">
      {items.map((item) => (
        <li key={item.id} className="grid grid-cols-[3.5rem_minmax(0,1fr)] items-center gap-3 py-3.5 first:pt-0 last:pb-0 sm:grid-cols-[4rem_minmax(0,1fr)_auto] sm:gap-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-border bg-secondary/40">
            {item.imageUrl ? (
              <Image src={item.imageUrl} alt="" fill sizes="64px" className="object-cover" />
            ) : (
              <span className="flex h-full items-center justify-center text-muted-foreground">
                <ImageOff size={ICON_SIZE.nav} aria-hidden="true" />
              </span>
            )}
          </div>
          <div className="min-w-0">
            {item.productSlug ? (
              <Link href={`/products/${item.productSlug}`} className="block truncate text-sm font-semibold text-foreground hover:text-primary">
                {item.productName}
              </Link>
            ) : (
              <p className="truncate text-sm font-semibold text-foreground">{item.productName}</p>
            )}
            <p className="mt-0.5 text-xs text-muted-foreground">
              {licenseLabel(item.licenseType)} licence
              {item.quantity > 1 ? ` × ${item.quantity}` : ""} ·{" "}
              <PriceDisplay usdAmount={Number.parseFloat(item.unitPriceUsd) * item.quantity} />
            </p>
          </div>
          {showActions && (
            <div className="col-span-2 flex items-center gap-2 sm:col-span-1">
              <Link
                href="/account/library"
                className="inline-flex h-9 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Download size={ICON_SIZE.sm} aria-hidden="true" />
                Download
              </Link>
              <Link
                href="/account/library"
                className="inline-flex h-9 items-center rounded-md border border-border px-3 text-xs font-semibold text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                View in My Library
              </Link>
            </div>
          )}
        </li>
      ))}
    </ul>
  )
}

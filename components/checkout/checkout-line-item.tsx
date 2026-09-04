import Image from "next/image"
import { PriceDisplay } from "@/components/price-display"
import { licenseLabel } from "@/lib/licenses"
import { ImageOff, ICON_SIZE } from "@/lib/storefront-icons"

export interface CheckoutItem {
  productId: number
  licenseId: number
  name: string
  tagline?: string | null
  licenseType: string
  unitPriceUsd: string
  quantity: number
  imageUrl?: string | null
  /** e.g. ["XLSX", "PDF"] — the deliverable format. */
  fileFormats?: string[]
  /** e.g. ["Excel", "Google Sheets"]. */
  software?: string[]
  categoryName?: string | null
}

/**
 * One line in the checkout order review: product, licence tier, format,
 * price. Quantity appears only when greater than one. Server component.
 */
export function CheckoutLineItem({ item }: { item: CheckoutItem }) {
  const lineTotal = Number.parseFloat(item.unitPriceUsd) * item.quantity
  const meta = [
    ...(item.software?.length ? [item.software[0]] : []),
    ...(item.fileFormats?.length ? [item.fileFormats.slice(0, 2).map((f) => f.toUpperCase()).join(", ")] : []),
  ].join(" • ")

  return (
    <li className="grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-start gap-3 py-3.5 first:pt-0 last:pb-0 sm:grid-cols-[4rem_minmax(0,1fr)_auto] sm:gap-4">
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
        <p className="truncate text-sm font-semibold leading-snug text-foreground">{item.name}</p>
        {(item.categoryName || meta) && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {[item.categoryName, meta].filter(Boolean).join(" · ")}
          </p>
        )}
        <p className="mt-1 text-xs font-medium text-foreground">
          {licenseLabel(item.licenseType)} licence
          {item.quantity > 1 && <span className="font-mono text-muted-foreground"> × {item.quantity}</span>}
        </p>
      </div>

      <PriceDisplay usdAmount={lineTotal} className="text-sm font-semibold tabular-nums text-foreground" />
    </li>
  )
}

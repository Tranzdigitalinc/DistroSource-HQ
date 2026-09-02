import Link from "next/link"
import { ShieldCheck } from "lucide-react"
import { getUserLicenses } from "@/lib/actions/account"
import { formatLicenseType, formatDate } from "@/lib/format"
import { PriceDisplay } from "@/components/price-display"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal"

export const metadata = {
  title: "My licenses — DistroSource",
}

export default async function AccountLicensesPage() {
  const licenses = await getUserLicenses()

  if (licenses.length === 0) {
    return (
      <Reveal className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-secondary/30 py-16 text-center">
        <ShieldCheck className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">You don&apos;t have any licenses yet.</p>
        <Button size="sm" render={<Link href="/products" />} nativeButton={false}>
          Browse products
        </Button>
      </Reveal>
    )
  }

  return (
    <RevealGroup className="flex flex-col gap-4" stagger={0.05}>
      {licenses.map((row) => (
        <RevealItem key={row.entitlement.id}>
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold">{row.product.name}</p>
                  <Badge variant="secondary">{formatLicenseType(row.license.licenseType)} license</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Issued {formatDate(row.entitlement.createdAt)} &middot; Order {row.order.orderNumber}
                </p>
              </div>
              <PriceDisplay usdAmount={row.license.price} className="text-sm font-semibold" />
            </div>
            {row.license.description ? (
              <p className="rounded-lg bg-secondary/40 p-3 text-xs leading-relaxed text-muted-foreground">
                {row.license.description}
              </p>
            ) : null}
            <div className="flex items-center gap-1.5 text-xs font-medium text-accent">
              <ShieldCheck className="size-3.5" aria-hidden="true" />
              Active — valid for this product&apos;s license terms
            </div>
          </div>
        </RevealItem>
      ))}
    </RevealGroup>
  )
}

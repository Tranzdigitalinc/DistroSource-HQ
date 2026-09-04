import Link from "next/link"
import { Sparkles, RefreshCw } from "@/lib/storefront-icons"
import { getUserProductUpdates } from "@/lib/actions/account"
import { formatDate } from "@/lib/format"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal"

export const metadata = {
  title: "Product updates — DistroSource",
}

export default async function AccountUpdatesPage() {
  const updates = await getUserProductUpdates()

  if (updates.length === 0) {
    return (
      <Reveal className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-secondary/30 py-16 text-center">
        <RefreshCw className="size-8 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">No version history yet for the products you own.</p>
        <Button size="sm" render={<Link href="/account/library" />} nativeButton={false}>
          Go to My Library
        </Button>
      </Reveal>
    )
  }

  return (
    <RevealGroup className="flex flex-col gap-4" stagger={0.05}>
      {updates.map((row) => (
        <RevealItem key={row.version.id}>
          <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Link href={`/products/${row.product.slug}`} className="text-sm font-semibold hover:text-accent">
                  {row.product.name}
                </Link>
                <Badge variant="secondary">v{row.version.version}</Badge>
                {row.isNewSincePurchase && (
                  <Badge className="gap-1 bg-accent text-accent-foreground">
                    <Sparkles className="size-3" aria-hidden="true" />
                    New since purchase
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{formatDate(row.version.releasedAt)}</p>
            </div>
            {row.version.changelog ? (
              <p className="text-sm leading-relaxed text-muted-foreground">{row.version.changelog}</p>
            ) : null}
          </div>
        </RevealItem>
      ))}
    </RevealGroup>
  )
}

"use client"

import { useMemo, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Download, FileText, ImageOff, LifeBuoy, Search, ShieldCheck, ICON_SIZE } from "@/lib/storefront-icons"
import { licenseLabel } from "@/lib/licenses"
import { cn } from "@/lib/utils"

export interface LibraryItem {
  entitlementId: number
  purchasedAt: string
  product: {
    id: number
    slug: string
    name: string
    imageUrl: string | null
    categoryName: string | null
    version: string
    fileFormats: string[]
    hasDocumentation: boolean
  }
  licenseType: string
  files: { id: number; name: string }[]
}

/**
 * The customer's owned products. Filtering is client-side over the rows the
 * server already authorised; downloads always go through
 * /api/downloads/[fileId], which re-verifies the entitlement per request.
 */
export function LibraryGrid({ items }: { items: LibraryItem[] }) {
  const [query, setQuery] = useState("")
  const [category, setCategory] = useState<string>("all")

  const categories = useMemo(
    () => [...new Set(items.map((i) => i.product.categoryName).filter((c): c is string => !!c))].sort(),
    [items],
  )

  const visible = items.filter((i) => {
    if (category !== "all" && i.product.categoryName !== category) return false
    const q = query.trim().toLowerCase()
    return !q || i.product.name.toLowerCase().includes(q) || (i.product.categoryName ?? "").toLowerCase().includes(q)
  })

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search size={ICON_SIZE.base} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search your library"
            aria-label="Search your library"
            className="h-10 w-full rounded-md border border-border bg-card pl-9 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        {categories.length > 1 && (
          <div className="-mx-4 flex gap-1.5 overflow-x-auto px-4 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" role="group" aria-label="Filter by category">
            {["all", ...categories].map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCategory(c)}
                aria-pressed={category === c}
                className={cn(
                  "shrink-0 whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  category === c ? "border-foreground bg-foreground text-background" : "border-border bg-card text-muted-foreground hover:text-foreground",
                )}
              >
                {c === "all" ? "All" : c}
              </button>
            ))}
          </div>
        )}
      </div>

      {visible.length === 0 ? (
        <p className="rounded-lg border border-border bg-card px-5 py-10 text-center text-sm text-muted-foreground">Nothing in your library matches that.</p>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {visible.map((row) => {
            const primaryFile = row.files[0]
            return (
              <li key={row.entitlementId} className="flex flex-col overflow-hidden rounded-lg border border-border bg-card">
                <div className="grid grid-cols-[6rem_minmax(0,1fr)] gap-4 p-4">
                  <Link href={`/products/${row.product.slug}`} className="relative aspect-[4/3] overflow-hidden rounded-md border border-border bg-secondary/40" aria-label={`View ${row.product.name}`}>
                    {row.product.imageUrl ? (
                      <Image src={row.product.imageUrl} alt="" fill className="object-cover" sizes="96px" />
                    ) : (
                      <span className="flex h-full items-center justify-center text-muted-foreground/40">
                        <ImageOff size={24} aria-hidden="true" />
                      </span>
                    )}
                  </Link>
                  <div className="min-w-0">
                    {row.product.categoryName && <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{row.product.categoryName}</p>}
                    <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-foreground">
                      <Link href={`/products/${row.product.slug}`} className="hover:text-primary">{row.product.name}</Link>
                    </h3>
                    <dl className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground">
                      <div className="flex gap-1">
                        <dt className="sr-only">Licence</dt>
                        <dd className="font-medium text-foreground">{licenseLabel(row.licenseType)} licence</dd>
                      </div>
                      <div className="flex gap-1">
                        <dt>v</dt>
                        <dd className="text-foreground">{row.product.version}</dd>
                      </div>
                      <div className="flex gap-1">
                        <dt>Purchased</dt>
                        <dd className="text-foreground">{new Date(row.purchasedAt).toLocaleDateString("en-US", { dateStyle: "medium" })}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="mt-auto flex flex-wrap items-center gap-2 border-t border-border px-4 py-3">
                  {primaryFile ? (
                    <Button size="sm" render={<a href={`/api/downloads/${primaryFile.id}`} />} nativeButton={false} className="h-9 font-semibold">
                      <Download size={ICON_SIZE.sm} aria-hidden="true" />
                      Download{row.files.length > 1 ? ` (${row.files.length} files)` : ""}
                    </Button>
                  ) : (
                    <span className="text-xs text-muted-foreground">Files not yet available</span>
                  )}
                  <div className="ml-auto flex items-center gap-0.5">
                    <IconLink href={`/products/${row.product.slug}`} label="View product" icon={Search} />
                    <IconLink href="/account/licenses" label="View licence" icon={ShieldCheck} />
                    {row.product.hasDocumentation && <IconLink href={`/products/${row.product.slug}#section-file-details`} label="Documentation" icon={FileText} />}
                    <IconLink href="/account/support" label="Support" icon={LifeBuoy} />
                  </div>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function IconLink({ href, label, icon: Icon }: { href: string; label: string; icon: React.ComponentType<{ size?: number; "aria-hidden"?: boolean | "true" }> }) {
  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Icon size={ICON_SIZE.sm} aria-hidden="true" />
    </Link>
  )
}

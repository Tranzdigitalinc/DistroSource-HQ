"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Filter, Star, X, ICON_SIZE } from "@/lib/storefront-icons"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { licenseLabel } from "@/lib/licenses"
import { getSourceTypeLabel } from "@/lib/format"
import { cn } from "@/lib/utils"

const priceOptions = [
  { label: "Under $10", value: "10" },
  { label: "Under $25", value: "25" },
  { label: "Under $50", value: "50" },
  { label: "Under $100", value: "100" },
]

const ratingOptions = [4, 3, 2]

export interface CatalogTypeCounts {
  free: number
  bundle: number
  deal: number
}

export interface CatalogFacet {
  value: string
  count: number
}

interface FiltersProps {
  formats?: { format: string; count: number }[]
  software?: { name: string; count: number }[]
  sources?: CatalogFacet[]
  licenses?: CatalogFacet[]
  /** Total reviews in the catalog. The rating filter is hidden at zero. */
  reviewCount?: number
  typeCounts?: CatalogTypeCounts
  /** Current result count, shown on the mobile drawer's confirm button. */
  resultCount?: number
}

/**
 * Catalog filters. Every option is data-driven: a group is offered only when
 * the catalog has products that match it, so no filter can return an empty
 * grid on first click. The active option is always kept so it can be cleared.
 *
 * Desktop renders a sticky sidebar; below `lg` the same controls open in a
 * bottom sheet, which keeps the product grid on screen instead of pushing it
 * below a long expanded panel.
 */
export function CatalogFilters(props: FiltersProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)

  const activeCount = ["maxPrice", "free", "bundle", "deal", "format", "software", "source", "license", "minRating"].filter((k) =>
    searchParams.get(k),
  ).length

  return (
    <>
      {/* ---- Mobile: bottom sheet ---- */}
      <div className="lg:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button variant="outline" className="w-full justify-between bg-transparent font-semibold" aria-label="Open filters" />
            }
          >
            <span className="flex items-center gap-2">
              <Filter size={ICON_SIZE.base} aria-hidden="true" />
              Filters
              {activeCount > 0 && (
                <span className="flex size-5 items-center justify-center rounded-full bg-foreground font-mono text-[10px] font-bold text-background">
                  {activeCount}
                </span>
              )}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {props.resultCount !== undefined ? `${props.resultCount.toLocaleString()} products` : "Refine"}
            </span>
          </SheetTrigger>

          <SheetContent side="bottom" className="flex max-h-[85vh] flex-col gap-0 rounded-t-xl p-0">
            <SheetHeader className="flex-row items-center justify-between border-b border-border px-5 py-4">
              <SheetTitle className="font-display text-base font-bold">Filters</SheetTitle>
              {activeCount > 0 && (
                <Link
                  href={pathname}
                  onClick={() => setOpen(false)}
                  className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                >
                  Clear all
                </Link>
              )}
            </SheetHeader>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <FilterGroups {...props} onNavigate={() => setOpen(false)} />
            </div>

            <div className="border-t border-border px-5 py-3">
              <Button size="lg" className="w-full font-semibold" onClick={() => setOpen(false)}>
                {props.resultCount !== undefined
                  ? `Show ${props.resultCount.toLocaleString()} ${props.resultCount === 1 ? "product" : "products"}`
                  : "Show results"}
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* ---- Desktop: sticky sidebar ---- */}
      <aside className="hidden w-60 shrink-0 lg:block">
        <div className="sticky top-24 rounded-lg border border-border bg-card">
          <div className="flex h-11 items-center justify-between border-b border-border px-4">
            <h2 className="text-sm font-semibold">Filters</h2>
            {activeCount > 0 && (
              <Link href={pathname} className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                <X size={12} aria-hidden="true" />
                Clear all
              </Link>
            )}
          </div>
          <div className="max-h-[calc(100vh-10rem)] overflow-y-auto p-4">
            <FilterGroups {...props} />
          </div>
        </div>
      </aside>
    </>
  )
}

function FilterGroups({
  formats = [],
  software = [],
  sources = [],
  licenses = [],
  reviewCount = 0,
  typeCounts,
  onNavigate,
}: FiltersProps & { onNavigate?: () => void }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function buildHref(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete("page")
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  const get = (k: string) => searchParams.get(k)
  const activeMaxPrice = get("maxPrice")
  const activeFormat = get("format")
  const activeSoftware = get("software")
  const activeSource = get("source")
  const activeLicense = get("license")
  const activeMinRating = get("minRating")

  const show = (n: number | undefined, active: boolean) => n === undefined || n > 0 || active
  const typeOptions = [
    { key: "free", label: "Free", active: get("free") === "true", count: typeCounts?.free },
    { key: "bundle", label: "Bundles", active: get("bundle") === "true", count: typeCounts?.bundle },
    { key: "deal", label: "On sale", active: get("deal") === "true", count: typeCounts?.deal },
  ].filter((o) => show(o.count, o.active))

  const licenseOptions = licenses.filter((l) => l.count > 0)
  const sourceOptions = sources.filter((s) => s.count > 0)

  return (
    <div className="flex flex-col gap-5">
      <FilterGroup title="Price">
        <FilterLink href={buildHref("maxPrice", null)} active={!activeMaxPrice} label="Any price" onNavigate={onNavigate} />
        {priceOptions.map((opt) => (
          <FilterLink key={opt.value} href={buildHref("maxPrice", opt.value)} active={activeMaxPrice === opt.value} label={opt.label} onNavigate={onNavigate} />
        ))}
      </FilterGroup>

      {typeOptions.length > 0 && (
        <FilterGroup title="Type">
          {typeOptions.map((opt) => (
            <FilterLink key={opt.key} href={buildHref(opt.key, opt.active ? null : "true")} active={opt.active} label={opt.label} onNavigate={onNavigate} />
          ))}
        </FilterGroup>
      )}

      {formats.length > 0 && (
        <FilterGroup title="Format">
          <FilterLink href={buildHref("format", null)} active={!activeFormat} label="All formats" onNavigate={onNavigate} />
          {formats.map((f) => (
            <FilterLink key={f.format} href={buildHref("format", f.format)} active={activeFormat === f.format} label={f.format.toUpperCase()} count={f.count} onNavigate={onNavigate} />
          ))}
        </FilterGroup>
      )}

      {software.length > 0 && (
        <FilterGroup title="Software">
          <FilterLink href={buildHref("software", null)} active={!activeSoftware} label="Any software" onNavigate={onNavigate} />
          {software.map((s) => (
            <FilterLink key={s.name} href={buildHref("software", s.name)} active={activeSoftware === s.name} label={s.name} count={s.count} onNavigate={onNavigate} />
          ))}
        </FilterGroup>
      )}

      {licenseOptions.length > 1 && (
        <FilterGroup title="Licence">
          <FilterLink href={buildHref("license", null)} active={!activeLicense} label="Any licence" onNavigate={onNavigate} />
          {licenseOptions.map((l) => (
            <FilterLink key={l.value} href={buildHref("license", l.value)} active={activeLicense === l.value} label={licenseLabel(l.value)} count={l.count} onNavigate={onNavigate} />
          ))}
        </FilterGroup>
      )}

      {sourceOptions.length > 1 && (
        <FilterGroup title="Source">
          <FilterLink href={buildHref("source", null)} active={!activeSource} label="Any source" onNavigate={onNavigate} />
          {sourceOptions.map((s) => (
            <FilterLink key={s.value} href={buildHref("source", s.value)} active={activeSource === s.value} label={getSourceTypeLabel(s.value)} count={s.count} onNavigate={onNavigate} />
          ))}
        </FilterGroup>
      )}

      {/* Hidden at zero reviews: a rating filter over an empty review set implies ratings exist. */}
      {reviewCount > 0 && (
        <FilterGroup title="Rating">
          <FilterLink href={buildHref("minRating", null)} active={!activeMinRating} label="Any rating" onNavigate={onNavigate} />
          {ratingOptions.map((stars) => (
            <FilterLink
              key={stars}
              href={buildHref("minRating", String(stars))}
              active={activeMinRating === String(stars)}
              label={`${stars}+ stars`}
              icon={<Star className="size-3.5 fill-current" />}
              onNavigate={onNavigate}
            />
          ))}
        </FilterGroup>
      )}
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="mb-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{title}</h3>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  )
}

function FilterLink({
  href,
  active,
  label,
  icon,
  count,
  onNavigate,
}: {
  href: string
  active: boolean
  label: string
  icon?: React.ReactNode
  count?: number
  onNavigate?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? "true" : undefined}
      className={cn(
        // min-h-9 on touch: filter rows are the most-tapped control in the catalog.
        "group flex min-h-9 items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors lg:min-h-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active ? "bg-secondary font-medium text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full transition-colors", active ? "bg-primary" : "bg-transparent group-hover:bg-border-strong")} aria-hidden="true" />
      {icon && <span className={cn("shrink-0", active ? "text-primary" : "text-muted-foreground")}>{icon}</span>}
      <span className="truncate">{label}</span>
      {count !== undefined && <span className="ml-auto font-mono text-[10px] tabular-nums text-muted-foreground/70">{count}</span>}
    </Link>
  )
}

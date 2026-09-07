"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useState, type ReactNode } from "react"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet"
import { Check, Close, Filter, Star, ICON_SIZE } from "@/lib/storefront-icons"
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

interface CatalogFiltersProps {
  formats?: { format: string; count: number }[]
  software?: { name: string; count: number }[]
  sources?: CatalogFacet[]
  licenses?: CatalogFacet[]
  /** Total reviews in the catalog. The rating filter is hidden at zero. */
  reviewCount?: number
  typeCounts?: CatalogTypeCounts
}

/**
 * Catalog filters. Every option is data-driven: a group is offered only
 * when the catalog has products that match it, so no filter can return an
 * empty grid on first click. Desktop: a sticky column. Mobile: a button
 * that opens the same groups in a bottom sheet.
 */
export function CatalogFilters(props: CatalogFiltersProps) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const searchParams = useSearchParams()
  const activeCount = ["maxPrice", "free", "bundle", "deal", "format", "software", "source", "license", "minRating"].filter((k) => searchParams.get(k)).length

  return (
    <>
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:border-border-strong lg:hidden"
      >
        <Filter size={ICON_SIZE.sm} aria-hidden="true" />
        Filters
        {activeCount > 0 && <span className="flex size-5 items-center justify-center rounded-full bg-foreground font-mono text-[10px] font-bold text-background">{activeCount}</span>}
      </button>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="bottom" showCloseButton={false} className="max-h-[85vh] gap-0 rounded-t-2xl border-t border-border bg-background p-0">
          <div className="flex h-14 items-center justify-between border-b border-border px-5">
            <SheetTitle className="font-display text-base font-bold">Filters</SheetTitle>
            <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close filters" className="flex size-9 items-center justify-center rounded-full hover:bg-secondary">
              <Close size={ICON_SIZE.base} aria-hidden="true" />
            </button>
          </div>
          <div className="overflow-y-auto px-5 py-4">
            <FilterGroups {...props} onNavigate={() => setMobileOpen(false)} />
          </div>
        </SheetContent>
      </Sheet>

      <aside className="hidden w-60 shrink-0 lg:block">
        <div className="sticky top-24 flex flex-col gap-6">
          <FilterGroups {...props} />
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
}: CatalogFiltersProps & { onNavigate?: () => void }) {
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
  const activeFree = get("free")
  const activeBundle = get("bundle")
  const activeDeal = get("deal")
  const activeFormat = get("format")
  const activeSoftware = get("software")
  const activeSource = get("source")
  const activeLicense = get("license")
  const activeMinRating = get("minRating")
  const hasActiveFilters = Boolean(
    activeMaxPrice || activeFree || activeBundle || activeDeal || activeFormat || activeSoftware || activeSource || activeLicense || activeMinRating,
  )

  const show = (n: number | undefined, active: boolean) => n === undefined || n > 0 || active
  const typeOptions = [
    { key: "free", label: "Free", active: activeFree === "true", count: typeCounts?.free },
    { key: "bundle", label: "Bundles", active: activeBundle === "true", count: typeCounts?.bundle },
    { key: "deal", label: "On sale", active: activeDeal === "true", count: typeCounts?.deal },
  ].filter((o) => show(o.count, o.active))
  const licenseOptions = licenses.filter((l) => l.count > 0)
  const sourceOptions = sources.filter((s) => s.count > 0)

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-sm font-bold">Filters</h2>
        {hasActiveFilters && (
          <Link href={pathname} onClick={onNavigate} className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
            <Close size={12} aria-hidden="true" />
            Clear all
          </Link>
        )}
      </div>

      <FilterGroup title="Price">
        <FilterLink href={buildHref("maxPrice", null)} active={!activeMaxPrice} label="Any price" onClick={onNavigate} />
        {priceOptions.map((opt) => (
          <FilterLink key={opt.value} href={buildHref("maxPrice", opt.value)} active={activeMaxPrice === opt.value} label={opt.label} onClick={onNavigate} />
        ))}
      </FilterGroup>

      {typeOptions.length > 0 && (
        <FilterGroup title="Type">
          {typeOptions.map((opt) => (
            <FilterLink key={opt.key} href={buildHref(opt.key, opt.active ? null : "true")} active={opt.active} label={opt.label} count={opt.count} onClick={onNavigate} />
          ))}
        </FilterGroup>
      )}

      {formats.length > 0 && (
        <FilterGroup title="Format">
          <FilterLink href={buildHref("format", null)} active={!activeFormat} label="All formats" onClick={onNavigate} />
          {formats.map((f) => (
            <FilterLink key={f.format} href={buildHref("format", f.format)} active={activeFormat === f.format} label={f.format.toUpperCase()} count={f.count} onClick={onNavigate} />
          ))}
        </FilterGroup>
      )}

      {software.length > 0 && (
        <FilterGroup title="Software">
          <FilterLink href={buildHref("software", null)} active={!activeSoftware} label="Any software" onClick={onNavigate} />
          {software.map((s) => (
            <FilterLink key={s.name} href={buildHref("software", s.name)} active={activeSoftware === s.name} label={s.name} count={s.count} onClick={onNavigate} />
          ))}
        </FilterGroup>
      )}

      {licenseOptions.length > 1 && (
        <FilterGroup title="Licence">
          <FilterLink href={buildHref("license", null)} active={!activeLicense} label="Any licence" onClick={onNavigate} />
          {licenseOptions.map((l) => (
            <FilterLink key={l.value} href={buildHref("license", l.value)} active={activeLicense === l.value} label={licenseLabel(l.value)} count={l.count} onClick={onNavigate} />
          ))}
        </FilterGroup>
      )}

      {sourceOptions.length > 1 && (
        <FilterGroup title="Source">
          <FilterLink href={buildHref("source", null)} active={!activeSource} label="Any source" onClick={onNavigate} />
          {sourceOptions.map((s) => (
            <FilterLink key={s.value} href={buildHref("source", s.value)} active={activeSource === s.value} label={getSourceTypeLabel(s.value)} count={s.count} onClick={onNavigate} />
          ))}
        </FilterGroup>
      )}

      {reviewCount > 0 && (
        <FilterGroup title="Rating">
          <FilterLink href={buildHref("minRating", null)} active={!activeMinRating} label="Any rating" onClick={onNavigate} />
          {ratingOptions.map((stars) => (
            <FilterLink
              key={stars}
              href={buildHref("minRating", String(stars))}
              active={activeMinRating === String(stars)}
              label={`${stars}+ stars`}
              icon={<Star className="size-3.5 fill-current" />}
              onClick={onNavigate}
            />
          ))}
        </FilterGroup>
      )}
    </div>
  )
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-t border-border pt-4 first-of-type:border-t-0 first-of-type:pt-0">
      <h3 className="mb-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{title}</h3>
      <div className="flex flex-col gap-px">{children}</div>
    </div>
  )
}

function FilterLink({ href, active, label, icon, count, onClick }: { href: string; active: boolean; label: string; icon?: ReactNode; count?: number; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      aria-current={active ? "true" : undefined}
      className={cn(
        "group -mx-2 flex items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13.5px] transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active ? "font-medium text-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      <span
        className={cn(
          "flex size-4 shrink-0 items-center justify-center rounded-[5px] border transition-colors",
          active ? "border-primary bg-primary text-primary-foreground" : "border-border-strong/70 bg-background group-hover:border-border-strong",
        )}
        aria-hidden="true"
      >
        {active && <Check size={11} strokeWidth={3} />}
      </span>
      {icon && <span className={cn("shrink-0", active ? "text-primary" : "text-muted-foreground")}>{icon}</span>}
      <span className="truncate">{label}</span>
      {count !== undefined && <span className="ml-auto font-mono text-[10px] tabular-nums text-muted-foreground/70">{count}</span>}
    </Link>
  )
}

"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Filter, Star, X, ICON_SIZE } from "@/lib/storefront-icons"
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

/**
 * Catalog filter sidebar. Every option is data-driven: a group is offered
 * only when the catalog has products that match it, so no filter can return
 * an empty grid on first click. The active option is always kept so it can
 * be cleared.
 */
export function CatalogFilters({
  formats = [],
  software = [],
  sources = [],
  licenses = [],
  reviewCount = 0,
  typeCounts,
}: {
  formats?: { format: string; count: number }[]
  software?: { name: string; count: number }[]
  sources?: CatalogFacet[]
  licenses?: CatalogFacet[]
  /** Total reviews in the catalog. The rating filter is hidden at zero. */
  reviewCount?: number
  typeCounts?: CatalogTypeCounts
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  // Collapsed by default on mobile. Always open on lg+.
  const [mobileOpen, setMobileOpen] = useState(false)

  function buildHref(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete("page")
    return `${pathname}?${params.toString()}`
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

  // Facets with only one value carry no information as a filter.
  const licenseOptions = licenses.filter((l) => l.count > 0)
  const sourceOptions = sources.filter((s) => s.count > 0)

  return (
    <aside className="flex w-full flex-col gap-3 lg:w-60">
      <button
        type="button"
        onClick={() => setMobileOpen((v) => !v)}
        aria-expanded={mobileOpen}
        aria-controls="catalog-filter-panel"
        className="flex h-11 items-center justify-between rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground transition-colors hover:bg-secondary lg:hidden"
      >
        <span className="flex items-center gap-2">
          <Filter size={ICON_SIZE.base} aria-hidden="true" />
          Filters
          {hasActiveFilters && <span className="rounded-full bg-foreground px-1.5 py-0.5 text-[10px] font-bold text-background">On</span>}
        </span>
        <span className="text-xs font-medium text-muted-foreground">{mobileOpen ? "Hide" : "Show"}</span>
      </button>

      <div id="catalog-filter-panel" className={cn("rounded-lg border border-border bg-card lg:sticky lg:top-24 lg:block", mobileOpen ? "block" : "hidden")}>
        <div className="flex h-11 items-center justify-between border-b border-border px-4">
          <h2 className="text-sm font-semibold">Filters</h2>
          {hasActiveFilters && (
            <Link href={pathname} className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
              <X size={12} aria-hidden="true" />
              Clear all
            </Link>
          )}
        </div>

        <div className="flex flex-col gap-5 p-4">
          <FilterGroup title="Price">
            <FilterLink href={buildHref("maxPrice", null)} active={!activeMaxPrice} label="Any price" />
            {priceOptions.map((opt) => (
              <FilterLink key={opt.value} href={buildHref("maxPrice", opt.value)} active={activeMaxPrice === opt.value} label={opt.label} />
            ))}
          </FilterGroup>

          {typeOptions.length > 0 && (
            <FilterGroup title="Type">
              {typeOptions.map((opt) => (
                <FilterLink key={opt.key} href={buildHref(opt.key, opt.active ? null : "true")} active={opt.active} label={opt.label} />
              ))}
            </FilterGroup>
          )}

          {formats.length > 0 && (
            <FilterGroup title="Format">
              <FilterLink href={buildHref("format", null)} active={!activeFormat} label="All formats" />
              {formats.map((f) => (
                <FilterLink key={f.format} href={buildHref("format", f.format)} active={activeFormat === f.format} label={f.format.toUpperCase()} count={f.count} />
              ))}
            </FilterGroup>
          )}

          {software.length > 0 && (
            <FilterGroup title="Software">
              <FilterLink href={buildHref("software", null)} active={!activeSoftware} label="Any software" />
              {software.map((s) => (
                <FilterLink key={s.name} href={buildHref("software", s.name)} active={activeSoftware === s.name} label={s.name} count={s.count} />
              ))}
            </FilterGroup>
          )}

          {licenseOptions.length > 1 && (
            <FilterGroup title="Licence">
              <FilterLink href={buildHref("license", null)} active={!activeLicense} label="Any licence" />
              {licenseOptions.map((l) => (
                <FilterLink key={l.value} href={buildHref("license", l.value)} active={activeLicense === l.value} label={licenseLabel(l.value)} count={l.count} />
              ))}
            </FilterGroup>
          )}

          {sourceOptions.length > 1 && (
            <FilterGroup title="Source">
              <FilterLink href={buildHref("source", null)} active={!activeSource} label="Any source" />
              {sourceOptions.map((s) => (
                <FilterLink key={s.value} href={buildHref("source", s.value)} active={activeSource === s.value} label={getSourceTypeLabel(s.value)} count={s.count} />
              ))}
            </FilterGroup>
          )}

          {/* Hidden at zero reviews: a rating filter over an empty review set implies ratings exist. */}
          {reviewCount > 0 && (
            <FilterGroup title="Rating">
              <FilterLink href={buildHref("minRating", null)} active={!activeMinRating} label="Any rating" />
              {ratingOptions.map((stars) => (
                <FilterLink
                  key={stars}
                  href={buildHref("minRating", String(stars))}
                  active={activeMinRating === String(stars)}
                  label={`${stars}+ stars`}
                  icon={<Star className="size-3.5 fill-current" />}
                />
              ))}
            </FilterGroup>
          )}
        </div>
      </div>
    </aside>
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

function FilterLink({ href, active, label, icon, count }: { href: string; active: boolean; label: string; icon?: React.ReactNode; count?: number }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
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

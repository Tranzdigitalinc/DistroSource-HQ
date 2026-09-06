"use client"

import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Close, Filter, Star } from "@/lib/storefront-icons"
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

export interface CatalogTypeCounts { free: number; bundle: number; deal: number }
export interface CatalogFacet { value: string; count: number }

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
  reviewCount?: number
  typeCounts?: CatalogTypeCounts
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    if (!mobileOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = previous }
  }, [mobileOpen])

  function buildHref(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete("page")
    return `${pathname}?${params.toString()}`
  }

  const get = (key: string) => searchParams.get(key)
  const state = {
    maxPrice: get("maxPrice"), free: get("free"), bundle: get("bundle"), deal: get("deal"),
    format: get("format"), software: get("software"), source: get("source"), license: get("license"), rating: get("minRating"),
  }
  const hasActive = Object.values(state).some(Boolean)
  const show = (count: number | undefined, active: boolean) => count === undefined || count > 0 || active
  const typeOptions = [
    { key: "free", label: "Free", active: state.free === "true", count: typeCounts?.free },
    { key: "bundle", label: "Bundles", active: state.bundle === "true", count: typeCounts?.bundle },
    { key: "deal", label: "On sale", active: state.deal === "true", count: typeCounts?.deal },
  ].filter((option) => show(option.count, option.active))
  const licenseOptions = licenses.filter((item) => item.count > 0)
  const sourceOptions = sources.filter((item) => item.count > 0)

  const panel = (
    <div className="space-y-8">
      <FilterGroup title="Price">
        <FilterChoice href={buildHref("maxPrice", null)} active={!state.maxPrice} label="Any price" />
        {priceOptions.map((option) => <FilterChoice key={option.value} href={buildHref("maxPrice", option.value)} active={state.maxPrice === option.value} label={option.label} />)}
      </FilterGroup>

      {typeOptions.length > 0 && (
        <FilterGroup title="Type">
          {typeOptions.map((option) => <FilterChoice key={option.key} href={buildHref(option.key, option.active ? null : "true")} active={option.active} label={option.label} count={option.count} />)}
        </FilterGroup>
      )}

      {formats.length > 0 && (
        <FilterGroup title="Format">
          <FilterChoice href={buildHref("format", null)} active={!state.format} label="All formats" />
          {formats.map((format) => <FilterChoice key={format.format} href={buildHref("format", format.format)} active={state.format === format.format} label={format.format.toUpperCase()} count={format.count} />)}
        </FilterGroup>
      )}

      {software.length > 0 && (
        <FilterGroup title="Software">
          <FilterChoice href={buildHref("software", null)} active={!state.software} label="Any software" />
          {software.map((item) => <FilterChoice key={item.name} href={buildHref("software", item.name)} active={state.software === item.name} label={item.name} count={item.count} />)}
        </FilterGroup>
      )}

      {licenseOptions.length > 1 && (
        <FilterGroup title="Licence">
          <FilterChoice href={buildHref("license", null)} active={!state.license} label="Any licence" />
          {licenseOptions.map((item) => <FilterChoice key={item.value} href={buildHref("license", item.value)} active={state.license === item.value} label={licenseLabel(item.value)} count={item.count} />)}
        </FilterGroup>
      )}

      {sourceOptions.length > 1 && (
        <FilterGroup title="Source">
          <FilterChoice href={buildHref("source", null)} active={!state.source} label="Any source" />
          {sourceOptions.map((item) => <FilterChoice key={item.value} href={buildHref("source", item.value)} active={state.source === item.value} label={getSourceTypeLabel(item.value)} count={item.count} />)}
        </FilterGroup>
      )}

      {reviewCount > 0 && (
        <FilterGroup title="Rating">
          <FilterChoice href={buildHref("minRating", null)} active={!state.rating} label="Any rating" />
          {ratingOptions.map((stars) => <FilterChoice key={stars} href={buildHref("minRating", String(stars))} active={state.rating === String(stars)} label={`${stars}+ stars`} icon={<Star size={12} className="fill-current" />} />)}
        </FilterGroup>
      )}
    </div>
  )

  return (
    <>
      <aside className="hidden w-[230px] shrink-0 lg:block">
        <div className="sticky top-24">
          <div className="mb-7 flex items-center justify-between">
            <h2 className="font-display text-lg font-black tracking-[-0.03em]">Refine</h2>
            {hasActive && <Link href={pathname} className="text-[11px] font-semibold text-muted-foreground hover:text-foreground">Clear</Link>}
          </div>
          {panel}
        </div>
      </aside>

      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        className="inline-flex h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold lg:hidden"
      >
        <Filter size={16} /> Filters
        {hasActive && <span className="size-2 rounded-full bg-primary" />}
      </button>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-[130] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" aria-label="Close filters" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-foreground/30 backdrop-blur-sm" />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Catalog filters"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 32 }}
              className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-hidden rounded-t-[32px] bg-background"
            >
              <div className="flex items-center justify-between border-b border-border px-5 py-4">
                <div>
                  <p className="font-display text-xl font-black tracking-[-0.03em]">Refine products</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">Filters update the catalog instantly.</p>
                </div>
                <button type="button" onClick={() => setMobileOpen(false)} className="flex size-10 items-center justify-center rounded-full border border-border" aria-label="Close filters"><Close size={17} /></button>
              </div>
              <div className="max-h-[calc(88vh-145px)] overflow-y-auto px-5 py-6">{panel}</div>
              <div className="flex gap-2 border-t border-border bg-background px-5 pb-[max(18px,env(safe-area-inset-bottom))] pt-3">
                {hasActive && <Link href={pathname} onClick={() => setMobileOpen(false)} className="flex h-12 items-center justify-center rounded-full border border-border px-5 text-sm font-semibold">Clear all</Link>}
                <button type="button" onClick={() => setMobileOpen(false)} className="flex h-12 flex-1 items-center justify-center rounded-full bg-foreground px-5 text-sm font-semibold text-background">Show products</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="mb-3 font-mono text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground">{title}</h3>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function FilterChoice({ href, active, label, icon, count }: { href: string; active: boolean; label: string; icon?: React.ReactNode; count?: number }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "group flex min-h-9 items-center gap-2.5 rounded-xl px-2.5 text-sm transition-[background-color,color,transform]",
        active ? "bg-foreground font-semibold text-background" : "text-muted-foreground hover:translate-x-0.5 hover:bg-secondary/65 hover:text-foreground",
      )}
    >
      <span className={cn("flex size-4 items-center justify-center rounded-full border", active ? "border-background/25 bg-background/12" : "border-border")}>{icon}</span>
      <span className="truncate">{label}</span>
      {count !== undefined && <span className={cn("ml-auto font-mono text-[9px]", active ? "text-background/55" : "text-muted-foreground/65")}>{count}</span>}
    </Link>
  )
}

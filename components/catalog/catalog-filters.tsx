"use client"

import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { usePathname, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Filter, Star, X } from "@/lib/storefront-icons"
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

export function CatalogFilters({ formats = [], software = [], sources = [], licenses = [], reviewCount = 0, typeCounts }: {
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

  function buildHref(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete("page")
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  const get = (key: string) => searchParams.get(key)
  const activeMaxPrice = get("maxPrice")
  const activeFree = get("free")
  const activeBundle = get("bundle")
  const activeDeal = get("deal")
  const activeFormat = get("format")
  const activeSoftware = get("software")
  const activeSource = get("source")
  const activeLicense = get("license")
  const activeMinRating = get("minRating")
  const hasActive = Boolean(activeMaxPrice || activeFree || activeBundle || activeDeal || activeFormat || activeSoftware || activeSource || activeLicense || activeMinRating)

  const show = (count: number | undefined, active: boolean) => count === undefined || count > 0 || active
  const typeOptions = [
    { key: "free", label: "Free", active: activeFree === "true", count: typeCounts?.free },
    { key: "bundle", label: "Bundles", active: activeBundle === "true", count: typeCounts?.bundle },
    { key: "deal", label: "On sale", active: activeDeal === "true", count: typeCounts?.deal },
  ].filter((option) => show(option.count, option.active))
  const licenseOptions = licenses.filter((item) => item.count > 0)
  const sourceOptions = sources.filter((item) => item.count > 0)

  const groups = (
    <div className="space-y-7">
      <FilterGroup title="Price">
        <FilterLink href={buildHref("maxPrice", null)} active={!activeMaxPrice} label="Any price" />
        {priceOptions.map((option) => <FilterLink key={option.value} href={buildHref("maxPrice", option.value)} active={activeMaxPrice === option.value} label={option.label} />)}
      </FilterGroup>

      {typeOptions.length > 0 && <FilterGroup title="Type">{typeOptions.map((option) => <FilterLink key={option.key} href={buildHref(option.key, option.active ? null : "true")} active={option.active} label={option.label} count={option.count} />)}</FilterGroup>}
      {formats.length > 0 && <FilterGroup title="Format"><FilterLink href={buildHref("format", null)} active={!activeFormat} label="All formats" />{formats.map((item) => <FilterLink key={item.format} href={buildHref("format", item.format)} active={activeFormat === item.format} label={item.format.toUpperCase()} count={item.count} />)}</FilterGroup>}
      {software.length > 0 && <FilterGroup title="Software"><FilterLink href={buildHref("software", null)} active={!activeSoftware} label="Any software" />{software.map((item) => <FilterLink key={item.name} href={buildHref("software", item.name)} active={activeSoftware === item.name} label={item.name} count={item.count} />)}</FilterGroup>}
      {licenseOptions.length > 1 && <FilterGroup title="Licence"><FilterLink href={buildHref("license", null)} active={!activeLicense} label="Any licence" />{licenseOptions.map((item) => <FilterLink key={item.value} href={buildHref("license", item.value)} active={activeLicense === item.value} label={licenseLabel(item.value)} count={item.count} />)}</FilterGroup>}
      {sourceOptions.length > 1 && <FilterGroup title="Source"><FilterLink href={buildHref("source", null)} active={!activeSource} label="Any source" />{sourceOptions.map((item) => <FilterLink key={item.value} href={buildHref("source", item.value)} active={activeSource === item.value} label={getSourceTypeLabel(item.value)} count={item.count} />)}</FilterGroup>}
      {reviewCount > 0 && <FilterGroup title="Rating"><FilterLink href={buildHref("minRating", null)} active={!activeMinRating} label="Any rating" />{ratingOptions.map((stars) => <FilterLink key={stars} href={buildHref("minRating", String(stars))} active={activeMinRating === String(stars)} label={`${stars}+ stars`} icon={<Star size={12} className="fill-current" />} />)}</FilterGroup>}
    </div>
  )

  return (
    <aside className="w-full lg:w-[250px]">
      <button type="button" onClick={() => setMobileOpen(true)} className="flex h-12 w-full items-center justify-between border border-border px-4 text-sm font-semibold lg:hidden">
        <span className="flex items-center gap-2"><Filter size={16} /> Refine results</span>
        {hasActive && <span className="font-mono text-[9px] font-black uppercase tracking-[0.08em] text-primary">Active</span>}
      </button>

      <div className="hidden lg:sticky lg:top-24 lg:block">
        <div className="mb-6 flex items-end justify-between border-b border-border pb-3">
          <div><p className="font-mono text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground">Refine</p><h2 className="mt-1 font-display text-lg font-black tracking-[-0.03em]">Filters</h2></div>
          {hasActive && <Link href={pathname} className="text-xs font-semibold text-muted-foreground hover:text-foreground">Clear</Link>}
        </div>
        {groups}
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-[100] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" aria-label="Close filters" onClick={() => setMobileOpen(false)} className="absolute inset-0 bg-black/35 backdrop-blur-[2px]" />
            <motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-x-0 bottom-0 max-h-[86vh] overflow-hidden rounded-t-[28px] bg-background shadow-[0_-30px_80px_-30px_rgba(0,0,0,.35)]">
              <div className="flex items-center justify-between border-b border-border px-5 py-4"><div><p className="font-mono text-[9px] font-black uppercase tracking-[0.12em] text-primary">Refine catalog</p><h2 className="mt-1 font-display text-xl font-black">Filters</h2></div><button type="button" onClick={() => setMobileOpen(false)} className="flex size-10 items-center justify-center rounded-full border border-border"><X size={16} /></button></div>
              <div className="max-h-[calc(86vh-76px)] overflow-y-auto px-5 py-6 pb-[max(28px,env(safe-area-inset-bottom))]">{groups}{hasActive && <Link href={pathname} onClick={() => setMobileOpen(false)} className="mt-8 flex h-12 items-center justify-center bg-foreground text-sm font-semibold text-background">Clear all filters</Link>}</div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </aside>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><h3 className="mb-2.5 font-mono text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground">{title}</h3><div className="space-y-0.5">{children}</div></div>
}

function FilterLink({ href, active, label, icon, count }: { href: string; active: boolean; label: string; icon?: React.ReactNode; count?: number }) {
  return (
    <Link href={href} aria-current={active ? "true" : undefined} className={cn("group flex min-h-9 items-center gap-2 border-b border-transparent py-2 text-sm transition-colors", active ? "font-semibold text-foreground" : "text-muted-foreground hover:text-foreground")}>
      <span className={cn("h-px w-4 shrink-0 transition-[width,background-color]", active ? "w-7 bg-primary" : "bg-border group-hover:w-6 group-hover:bg-foreground")} />
      {icon && <span className={active ? "text-primary" : "text-muted-foreground"}>{icon}</span>}
      <span className="truncate">{label}</span>
      {count !== undefined && <span className="ml-auto font-mono text-[9px] tabular-nums text-muted-foreground/60">{count}</span>}
    </Link>
  )
}

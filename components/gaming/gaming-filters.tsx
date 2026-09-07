"use client"

import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { usePathname, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Filter, X } from "@/lib/storefront-icons"
import { GAMING_CATEGORIES, GAMING_PLATFORMS, GAMING_PRICE_BANDS, GAMING_SORTS } from "@/lib/gaming/types"
import { cn } from "@/lib/utils"

interface Facets {
  platforms: Record<string, number>
  categories: Record<string, number>
  prices: Record<string, number>
}

export function GamingFilters({ facets, lockPlatform = false }: { facets: Facets; lockPlatform?: boolean }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)

  function href(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  const get = (key: string) => searchParams.get(key)
  const activeCount = ["platform", "category", "price"].filter((key) => get(key)).length

  const groups = (
    <div className="space-y-7">
      {!lockPlatform && <Group title="Platform"><Option href={href("platform", null)} active={!get("platform")} label="All platforms" />{GAMING_PLATFORMS.filter((item) => (facets.platforms[item.id] ?? 0) > 0).map((item) => <Option key={item.id} href={href("platform", item.id)} active={get("platform") === item.id} label={item.label} count={facets.platforms[item.id]} />)}</Group>}
      <Group title="Category"><Option href={href("category", null)} active={!get("category")} label="All categories" />{GAMING_CATEGORIES.filter((item) => (facets.categories[item.id] ?? 0) > 0).map((item) => <Option key={item.id} href={href("category", item.id)} active={get("category") === item.id} label={item.label} count={facets.categories[item.id]} />)}</Group>
      <Group title="Price"><Option href={href("price", null)} active={!get("price")} label="Any price" />{GAMING_PRICE_BANDS.filter((item) => (facets.prices[item.id] ?? 0) > 0).map((item) => <Option key={item.id} href={href("price", item.id)} active={get("price") === item.id} label={item.label} count={facets.prices[item.id]} />)}</Group>
      <Group title="Sort">{GAMING_SORTS.map((item) => <Option key={item.id} href={href("sort", item.id === "featured" ? null : item.id)} active={(get("sort") ?? "featured") === item.id} label={item.label} />)}</Group>
    </div>
  )

  return (
    <aside className="w-full lg:w-[250px]">
      <button type="button" onClick={() => setOpen(true)} className="flex h-12 w-full items-center justify-between border border-white/15 px-4 text-sm font-semibold text-white lg:hidden"><span className="flex items-center gap-2"><Filter size={16} /> Refine Gaming</span>{activeCount > 0 && <span className="font-mono text-[9px] font-black text-primary">{activeCount}</span>}</button>

      <div className="hidden lg:sticky lg:top-24 lg:block">
        <div className="mb-6 flex items-end justify-between border-b border-white/10 pb-3"><div><p className="font-mono text-[9px] font-black uppercase tracking-[0.12em] text-white/35">Refine</p><h2 className="mt-1 font-display text-lg font-black text-white">Gaming filters</h2></div>{activeCount > 0 && <Link href={pathname} className="text-xs font-semibold text-white/45 hover:text-white">Clear</Link>}</div>
        {groups}
      </div>

      <AnimatePresence>
        {open && <motion.div className="fixed inset-0 z-[120] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}><button type="button" aria-label="Close filters" onClick={() => setOpen(false)} className="absolute inset-0 bg-black/65 backdrop-blur-[2px]" /><motion.div initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }} transition={{ duration: 0.38, ease: [0.16, 1, 0.3, 1] }} className="absolute inset-x-0 bottom-0 max-h-[86vh] overflow-hidden rounded-t-[28px] bg-[#0b1523] text-white"><div className="flex items-center justify-between border-b border-white/10 px-5 py-4"><div><p className="font-mono text-[9px] font-black uppercase tracking-[0.12em] text-primary">Gaming catalog</p><h2 className="mt-1 font-display text-xl font-black">Refine</h2></div><button type="button" onClick={() => setOpen(false)} className="flex size-10 items-center justify-center border border-white/15"><X size={16} /></button></div><div className="max-h-[calc(86vh-76px)] overflow-y-auto px-5 py-6 pb-[max(28px,env(safe-area-inset-bottom))]">{groups}{activeCount > 0 && <Link href={pathname} onClick={() => setOpen(false)} className="mt-8 flex h-12 items-center justify-center bg-white text-sm font-black text-[#07111f]">Clear all filters</Link>}</div></motion.div></motion.div>}
      </AnimatePresence>
    </aside>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><h3 className="mb-2.5 font-mono text-[9px] font-black uppercase tracking-[0.12em] text-white/35">{title}</h3><div className="space-y-0.5">{children}</div></div>
}

function Option({ href, active, label, count }: { href: string; active: boolean; label: string; count?: number }) {
  return <Link href={href} aria-current={active ? "true" : undefined} className={cn("group flex min-h-9 items-center gap-2 py-2 text-sm transition-colors", active ? "font-semibold text-white" : "text-white/45 hover:text-white")}><span className={cn("h-px w-4 shrink-0 transition-all", active ? "w-7 bg-primary" : "bg-white/15 group-hover:w-6 group-hover:bg-white/60")} /><span className="truncate">{label}</span>{count !== undefined && <span className="ml-auto font-mono text-[9px] text-white/28">{count}</span>}</Link>
}

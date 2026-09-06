"use client"

import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState } from "react"
import { Close, Filter } from "@/lib/storefront-icons"
import { GAMING_CATEGORIES, GAMING_PLATFORMS, GAMING_PRICE_BANDS, GAMING_SORTS } from "@/lib/gaming/types"
import { cn } from "@/lib/utils"

interface Facets {
  platforms: Record<string, number>
  categories: Record<string, number>
  prices: Record<string, number>
}

export function GamingFilters({
  facets,
  lockPlatform = false,
  tone = "default",
}: {
  facets: Facets
  lockPlatform?: boolean
  tone?: "default" | "dark"
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)
  const dark = tone === "dark"

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.body.style.overflow = previous }
  }, [open])

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
    <div className="space-y-8">
      {!lockPlatform && (
        <Group title="Platform" dark={dark}>
          <Option href={href("platform", null)} active={!get("platform")} label="All platforms" dark={dark} />
          {GAMING_PLATFORMS.filter((platform) => (facets.platforms[platform.id] ?? 0) > 0).map((platform) => (
            <Option key={platform.id} href={href("platform", platform.id)} active={get("platform") === platform.id} label={platform.label} count={facets.platforms[platform.id]} dark={dark} />
          ))}
        </Group>
      )}

      <Group title="Category" dark={dark}>
        <Option href={href("category", null)} active={!get("category")} label="All categories" dark={dark} />
        {GAMING_CATEGORIES.filter((category) => (facets.categories[category.id] ?? 0) > 0).map((category) => (
          <Option key={category.id} href={href("category", category.id)} active={get("category") === category.id} label={category.label} count={facets.categories[category.id]} dark={dark} />
        ))}
      </Group>

      <Group title="Price" dark={dark}>
        <Option href={href("price", null)} active={!get("price")} label="Any price" dark={dark} />
        {GAMING_PRICE_BANDS.filter((band) => (facets.prices[band.id] ?? 0) > 0).map((band) => (
          <Option key={band.id} href={href("price", band.id)} active={get("price") === band.id} label={band.label} count={facets.prices[band.id]} dark={dark} />
        ))}
      </Group>

      <Group title="Sort" dark={dark}>
        {GAMING_SORTS.map((sort) => (
          <Option key={sort.id} href={href("sort", sort.id === "featured" ? null : sort.id)} active={(get("sort") ?? "featured") === sort.id} label={sort.label} dark={dark} />
        ))}
      </Group>
    </div>
  )

  return (
    <>
      <aside className="hidden w-[230px] shrink-0 lg:block">
        <div className="sticky top-24">
          <div className="mb-7 flex items-center justify-between">
            <h2 className={cn("font-display text-lg font-black tracking-[-0.03em]", dark ? "text-white" : "text-foreground")}>Refine</h2>
            {activeCount > 0 && <Link href={pathname} className={cn("text-[11px] font-semibold", dark ? "text-white/40 hover:text-white" : "text-muted-foreground hover:text-foreground")}>Clear</Link>}
          </div>
          {groups}
        </div>
      </aside>

      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn("inline-flex h-11 items-center gap-2 rounded-full border px-4 text-sm font-semibold lg:hidden", dark ? "border-white/12 text-white" : "border-border text-foreground")}
      >
        <Filter size={16} /> Filters
        {activeCount > 0 && <span className="flex size-5 items-center justify-center rounded-full bg-primary font-mono text-[9px] font-black text-primary-foreground">{activeCount}</span>}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div className="fixed inset-0 z-[140] lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <button type="button" onClick={() => setOpen(false)} aria-label="Close filters" className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 280, damping: 32 }}
              className={cn("absolute inset-x-0 bottom-0 max-h-[88vh] overflow-hidden rounded-t-[32px]", dark ? "bg-[oklch(0.12_0.018_255)] text-white" : "bg-background text-foreground")}
            >
              <div className={cn("flex items-center justify-between border-b px-5 py-4", dark ? "border-white/10" : "border-border")}>
                <div><p className="font-display text-xl font-black tracking-[-0.03em]">Refine gaming</p><p className={cn("mt-0.5 text-xs", dark ? "text-white/40" : "text-muted-foreground")}>Platform, category, price and order.</p></div>
                <button type="button" onClick={() => setOpen(false)} className={cn("flex size-10 items-center justify-center rounded-full border", dark ? "border-white/12" : "border-border")} aria-label="Close filters"><Close size={16} /></button>
              </div>
              <div className="max-h-[calc(88vh-145px)] overflow-y-auto px-5 py-6">{groups}</div>
              <div className={cn("flex gap-2 border-t px-5 pb-[max(18px,env(safe-area-inset-bottom))] pt-3", dark ? "border-white/10" : "border-border")}>
                {activeCount > 0 && <Link href={pathname} onClick={() => setOpen(false)} className={cn("flex h-12 items-center justify-center rounded-full border px-5 text-sm font-semibold", dark ? "border-white/12" : "border-border")}>Clear</Link>}
                <button type="button" onClick={() => setOpen(false)} className={cn("flex h-12 flex-1 items-center justify-center rounded-full px-5 text-sm font-semibold", dark ? "bg-white text-black" : "bg-foreground text-background")}>Show products</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

function Group({ title, children, dark }: { title: string; children: React.ReactNode; dark: boolean }) {
  return <div><h3 className={cn("mb-3 font-mono text-[9px] font-black uppercase tracking-[0.14em]", dark ? "text-white/35" : "text-muted-foreground")}>{title}</h3><div className="space-y-1">{children}</div></div>
}

function Option({ href, active, label, count, dark }: { href: string; active: boolean; label: string; count?: number; dark: boolean }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "group flex min-h-9 items-center gap-2.5 rounded-xl px-2.5 text-sm transition-[background-color,color,transform]",
        active
          ? dark ? "bg-white font-semibold text-black" : "bg-foreground font-semibold text-background"
          : dark ? "text-white/48 hover:translate-x-0.5 hover:bg-white/[0.06] hover:text-white" : "text-muted-foreground hover:translate-x-0.5 hover:bg-secondary/65 hover:text-foreground",
      )}
    >
      <span className={cn("size-4 rounded-full border", active ? dark ? "border-black/15 bg-black/10" : "border-background/25 bg-background/12" : dark ? "border-white/15" : "border-border")} />
      <span className="truncate">{label}</span>
      {count !== undefined && <span className={cn("ml-auto font-mono text-[9px]", active ? dark ? "text-black/45" : "text-background/55" : dark ? "text-white/25" : "text-muted-foreground/65")}>{count}</span>}
    </Link>
  )
}

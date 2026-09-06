"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { useState } from "react"
import { Filter, X, ICON_SIZE } from "@/lib/storefront-icons"
import { GAMING_CATEGORIES, GAMING_PLATFORMS, GAMING_PRICE_BANDS, GAMING_SORTS } from "@/lib/gaming/types"
import { cn } from "@/lib/utils"

interface Facets {
  platforms: Record<string, number>
  categories: Record<string, number>
  prices: Record<string, number>
}

/**
 * Gaming catalogue filters. Every option is a link, so filtering works
 * without JavaScript and each combination is a shareable URL. Options that
 * would return nothing are not offered — a filter that always yields an
 * empty grid reads as a broken store.
 *
 * `lockPlatform` is set on the FiveM and Minecraft pages, where the platform
 * is the route rather than a filter the visitor can change.
 */
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

  const get = (k: string) => searchParams.get(k)
  const activeCount = ["platform", "category", "price"].filter((k) => get(k)).length

  const groups = (
    <div className="flex flex-col gap-5">
      {!lockPlatform && (
        <Group title="Platform">
          <Option href={href("platform", null)} active={!get("platform")} label="All platforms" />
          {GAMING_PLATFORMS.filter((p) => (facets.platforms[p.id] ?? 0) > 0).map((p) => (
            <Option
              key={p.id}
              href={href("platform", p.id)}
              active={get("platform") === p.id}
              label={p.label}
              count={facets.platforms[p.id]}
            />
          ))}
        </Group>
      )}

      <Group title="Category">
        <Option href={href("category", null)} active={!get("category")} label="All categories" />
        {GAMING_CATEGORIES.filter((c) => (facets.categories[c.id] ?? 0) > 0).map((c) => (
          <Option
            key={c.id}
            href={href("category", c.id)}
            active={get("category") === c.id}
            label={c.label}
            count={facets.categories[c.id]}
          />
        ))}
      </Group>

      <Group title="Price">
        <Option href={href("price", null)} active={!get("price")} label="Any price" />
        {GAMING_PRICE_BANDS.filter((b) => (facets.prices[b.id] ?? 0) > 0).map((b) => (
          <Option key={b.id} href={href("price", b.id)} active={get("price") === b.id} label={b.label} count={facets.prices[b.id]} />
        ))}
      </Group>

      <Group title="Sort">
        {GAMING_SORTS.map((s) => (
          <Option
            key={s.id}
            href={href("sort", s.id === "featured" ? null : s.id)}
            active={(get("sort") ?? "featured") === s.id}
            label={s.label}
          />
        ))}
      </Group>
    </div>
  )

  return (
    <aside className="flex w-full flex-col gap-3 lg:w-60">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="gaming-filter-panel"
        className="flex h-11 items-center justify-between rounded-lg border border-border bg-card px-4 text-sm font-semibold transition-colors hover:bg-secondary lg:hidden"
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
        <span className="text-xs font-medium text-muted-foreground">{open ? "Hide" : "Show"}</span>
      </button>

      <div
        id="gaming-filter-panel"
        className={cn("rounded-lg border border-border bg-card lg:sticky lg:top-24 lg:block", open ? "block" : "hidden")}
      >
        <div className="flex h-11 items-center justify-between border-b border-border px-4">
          <h2 className="text-sm font-semibold">Filters</h2>
          {activeCount > 0 && (
            <Link href={pathname} className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground">
              <X size={12} aria-hidden="true" />
              Clear
            </Link>
          )}
        </div>
        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto p-4">{groups}</div>
      </div>
    </aside>
  )
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <h3 className="mb-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{title}</h3>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  )
}

function Option({ href, active, label, count }: { href: string; active: boolean; label: string; count?: number }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "group flex min-h-9 items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors lg:min-h-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active ? "bg-secondary font-medium text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
      )}
    >
      <span className={cn("size-1.5 shrink-0 rounded-full", active ? "bg-primary" : "bg-transparent group-hover:bg-border-strong")} aria-hidden="true" />
      <span className="truncate">{label}</span>
      {count !== undefined && <span className="ml-auto font-mono text-[10px] tabular-nums text-muted-foreground/70">{count}</span>}
    </Link>
  )
}

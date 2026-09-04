"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { ArrowRight, Clock, Close, ImageOff, Loader2, Search, Tag, ICON_SIZE } from "@/lib/storefront-icons"
import { PriceDisplay } from "@/components/price-display"
import { cn } from "@/lib/utils"

type CategorySuggestion = { id: number; slug: string; name: string; department: string | null; isDepartment: boolean }
type ProductSuggestion = {
  id: number
  slug: string
  name: string
  image: string | null
  categoryName: string
  isFree: boolean
  price: string
  compareAtPrice: string | null
  fileFormats?: string[]
}
type SuggestionsResponse = { categories: CategorySuggestion[]; products: ProductSuggestion[] }

const fetcher = (url: string) => fetch(url).then((r) => r.json() as Promise<SuggestionsResponse>)

const RECENT_KEY = "ds:recent-searches"
const RECENT_MAX = 5

/** Real departments only — slugs verified against the catalog. */
const QUICK_LINKS = [
  { label: "Business & Office", href: "/categories/business-office" },
  { label: "Web & Development", href: "/categories/web-development" },
  { label: "Design Resources", href: "/categories/design-resources" },
  { label: "Fonts & Typography", href: "/categories/fonts-typography" },
  { label: "Deals", href: "/deals" },
  { label: "New arrivals", href: "/products?sort=newest" },
]

function readRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY)
    return raw ? (JSON.parse(raw) as string[]).slice(0, RECENT_MAX) : []
  } catch {
    return []
  }
}
function writeRecent(list: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, RECENT_MAX)))
  } catch {
    /* storage unavailable — recents are a convenience only */
  }
}

export function HeaderSearch({ className, size = "default" }: { className?: string; size?: "default" | "lg" }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [debounced, setDebounced] = useState("")
  const [open, setOpen] = useState(false)
  // The highlighted row is scoped to the current query/open state: any
  // change to either implicitly resets it, with no effect required.
  const [active, setActive] = useState<{ key: string; index: number }>({ key: "", index: -1 })
  const [recent, setRecent] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 200)
    return () => clearTimeout(t)
  }, [query])

  // Close on outside click; onBlur alone races with option clicks.
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [open])

  const hasQuery = debounced.length >= 2
  const { data, isLoading } = useSWR(hasQuery ? `/api/search/suggestions?q=${encodeURIComponent(debounced)}` : null, fetcher, {
    keepPreviousData: true,
    dedupingInterval: 5000,
  })

  const categories = hasQuery ? (data?.categories ?? []) : []
  const products = hasQuery ? (data?.products ?? []) : []

  // One flat, keyboard-navigable list regardless of which panel is showing.
  type Row =
    | { kind: "recent"; label: string }
    | { kind: "quick"; label: string; href: string }
    | { kind: "category"; item: CategorySuggestion }
    | { kind: "product"; item: ProductSuggestion }
    | { kind: "all" }
  const rows: Row[] = hasQuery
    ? [
        ...categories.map((item) => ({ kind: "category" as const, item })),
        ...products.map((item) => ({ kind: "product" as const, item })),
        ...(categories.length + products.length > 0 ? [{ kind: "all" as const }] : []),
      ]
    : [...recent.map((label) => ({ kind: "recent" as const, label })), ...QUICK_LINKS.map((q) => ({ kind: "quick" as const, ...q }))]

  const activeKey = `${debounced}|${open ? 1 : 0}`
  const activeIndex = active.key === activeKey ? active.index : -1
  const setActiveIndex = useCallback(
    (next: number | ((i: number) => number)) =>
      setActive((prev) => {
        const current = prev.key === activeKey ? prev.index : -1
        return { key: activeKey, index: typeof next === "function" ? next(current) : next }
      }),
    [activeKey],
  )

  const remember = useCallback(
    (term: string) => {
      const next = [term, ...recent.filter((r) => r.toLowerCase() !== term.toLowerCase())]
      setRecent(next)
      writeRecent(next)
    },
    [recent],
  )

  // Memoised handlers must not capture `inputRef`: the React compiler lint
  // treats a ref-capturing function passed around in JSX as a potential
  // render-time ref read. Dropping focus via the active element avoids it.
  const submitSearch = useCallback(
    (term: string) => {
      const t = term.trim()
      if (!t) return
      remember(t)
      router.push(`/products?q=${encodeURIComponent(t)}`)
      setOpen(false)
      if (document.activeElement instanceof HTMLElement) document.activeElement.blur()
    },
    [remember, router],
  )

  const activate = useCallback(
    (row: Row) => {
      setOpen(false)
      if (row.kind === "recent") return submitSearch(row.label)
      if (row.kind === "quick") return router.push(row.href)
      if (row.kind === "category") return router.push(`/categories/${row.item.slug}`)
      if (row.kind === "product") {
        remember(query.trim() || row.item.name)
        return router.push(`/products/${row.item.slug}`)
      }
      return submitSearch(query)
    },
    [query, remember, router, submitSearch],
  )

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      setOpen(false)
      inputRef.current?.blur()
      return
    }
    if (!open || rows.length === 0) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => (i + 1) % rows.length)
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => (i <= 0 ? rows.length - 1 : i - 1))
    } else if (e.key === "Enter" && activeIndex >= 0) {
      e.preventDefault()
      activate(rows[activeIndex])
    }
  }

  const isLarge = size === "lg"
  const showPanel = open && (hasQuery || rows.length > 0)
  const optionClass = (i: number) =>
    cn(
      "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors",
      "focus-visible:outline-none",
      activeIndex === i ? "bg-secondary text-foreground" : "hover:bg-secondary/70",
    )

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (activeIndex >= 0 && rows[activeIndex]) activate(rows[activeIndex])
        else submitSearch(query)
      }}
      className={className}
      role="search"
    >
      <div ref={rootRef} className="relative w-full">
        <Search
          size={isLarge ? ICON_SIZE.nav : ICON_SIZE.base}
          className={cn("pointer-events-none absolute top-1/2 -translate-y-1/2 transition-colors", isLarge ? "left-4" : "left-3", open ? "text-foreground" : "text-muted-foreground")}
          aria-hidden="true"
        />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            // Recents live in localStorage: read them when the panel is
            // actually opened, in the event handler, not on mount.
            setRecent(readRecent())
            setOpen(true)
          }}
          onKeyDown={onKeyDown}
          placeholder="Search templates, dashboards, UI kits, graphics…"
          aria-label="Search products"
          role="combobox"
          aria-expanded={showPanel}
          aria-controls="search-panel"
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `search-option-${activeIndex}` : undefined}
          className={cn(
            "w-full rounded-md border bg-secondary/60 text-foreground placeholder:text-muted-foreground",
            "transition-[background-color,border-color,box-shadow] focus:outline-none",
            isLarge ? "h-12 pl-11 pr-24 text-base" : "h-10 pl-9 pr-20 text-sm",
            open ? "border-border-strong bg-background shadow-[var(--shadow-e1)] ring-2 ring-ring/25" : "border-border",
          )}
        />
        <div className={cn("absolute top-1/2 flex -translate-y-1/2 items-center gap-1", isLarge ? "right-2" : "right-1.5")}>
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery("")
                inputRef.current?.focus()
              }}
              aria-label="Clear search"
              className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <Close size={14} aria-hidden="true" />
            </button>
          )}
          <button
            type="submit"
            aria-label="Search"
            className={cn(
              "flex items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90",
              isLarge ? "h-9 px-3" : "size-7",
            )}
          >
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        </div>

        {showPanel && (
          <div
            id="search-panel"
            role="listbox"
            aria-label={hasQuery ? "Search results" : "Search shortcuts"}
            className={cn(
              "absolute inset-x-0 z-50 max-h-[70vh] overflow-y-auto rounded-lg border border-border bg-card p-1.5 shadow-[var(--shadow-e3)]",
              isLarge ? "top-14" : "top-12",
            )}
          >
            {/* ---- Empty-query panel ---- */}
            {!hasQuery && (
              <>
                {recent.length > 0 && (
                  <div className="pb-1">
                    <div className="flex items-center justify-between px-3 pb-1 pt-2">
                      <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Recent</p>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          setRecent([])
                          writeRecent([])
                        }}
                        className="text-[11px] font-medium text-muted-foreground hover:text-foreground"
                      >
                        Clear
                      </button>
                    </div>
                    {rows.map((row, i) =>
                      row.kind === "recent" ? (
                        <button
                          key={`r-${row.label}`}
                          id={`search-option-${i}`}
                          type="button"
                          role="option"
                          aria-selected={activeIndex === i}
                          onMouseDown={(e) => e.preventDefault()}
                          onMouseEnter={() => setActiveIndex(i)}
                          onClick={() => activate(row)}
                          className={optionClass(i)}
                        >
                          <Clock size={ICON_SIZE.sm} className="shrink-0 text-muted-foreground" aria-hidden="true" />
                          <span className="truncate">{row.label}</span>
                        </button>
                      ) : null,
                    )}
                  </div>
                )}
                <div className="pt-1">
                  <p className="px-3 pb-1 pt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Suggestions</p>
                  <div className="grid grid-cols-2 gap-0.5">
                    {rows.map((row, i) =>
                      row.kind === "quick" ? (
                        <button
                          key={`q-${row.href}`}
                          id={`search-option-${i}`}
                          type="button"
                          role="option"
                          aria-selected={activeIndex === i}
                          onMouseDown={(e) => e.preventDefault()}
                          onMouseEnter={() => setActiveIndex(i)}
                          onClick={() => activate(row)}
                          className={optionClass(i)}
                        >
                          <Tag size={ICON_SIZE.sm} className="shrink-0 text-muted-foreground" aria-hidden="true" />
                          <span className="truncate">{row.label}</span>
                        </button>
                      ) : null,
                    )}
                  </div>
                </div>
              </>
            )}

            {/* ---- Results panel ---- */}
            {hasQuery && isLoading && rows.length === 0 && (
              <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                <Loader2 size={ICON_SIZE.sm} className="animate-spin" aria-hidden="true" />
                Searching…
              </div>
            )}
            {hasQuery && !isLoading && rows.length === 0 && (
              <div className="px-3 py-8 text-center">
                <p className="text-sm font-medium text-foreground">No matches for “{debounced}”</p>
                <p className="mt-1 text-xs text-muted-foreground">Try a shorter term or browse a department.</p>
              </div>
            )}

            {hasQuery && categories.length > 0 && (
              <div className="pb-1">
                <p className="px-3 pb-1 pt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Categories</p>
                {rows.map((row, i) =>
                  row.kind === "category" ? (
                    <button
                      key={`c-${row.item.id}`}
                      id={`search-option-${i}`}
                      type="button"
                      role="option"
                      aria-selected={activeIndex === i}
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => activate(row)}
                      className={optionClass(i)}
                    >
                      <Tag size={ICON_SIZE.sm} className="shrink-0 text-muted-foreground" aria-hidden="true" />
                      <span className="truncate font-medium">
                        {row.item.department ? `${row.item.department} / ${row.item.name}` : row.item.name}
                      </span>
                      <span className="ml-auto shrink-0 font-mono text-[10px] uppercase text-muted-foreground">
                        {row.item.isDepartment ? "Department" : "Category"}
                      </span>
                    </button>
                  ) : null,
                )}
              </div>
            )}

            {hasQuery && products.length > 0 && (
              <div className="pt-1">
                <p className="px-3 pb-1 pt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">Products</p>
                {rows.map((row, i) =>
                  row.kind === "product" ? (
                    <button
                      key={`p-${row.item.id}`}
                      id={`search-option-${i}`}
                      type="button"
                      role="option"
                      aria-selected={activeIndex === i}
                      onMouseDown={(e) => e.preventDefault()}
                      onMouseEnter={() => setActiveIndex(i)}
                      onClick={() => activate(row)}
                      className={optionClass(i)}
                    >
                      <span className="relative size-10 shrink-0 overflow-hidden rounded-md border border-border bg-secondary/50">
                        {row.item.image ? (
                          <Image src={row.item.image} alt="" fill className="object-cover" sizes="40px" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-muted-foreground/50">
                            <ImageOff size={ICON_SIZE.sm} aria-hidden="true" />
                          </span>
                        )}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-medium">{row.item.name}</span>
                        <span className="truncate text-[11px] text-muted-foreground">
                          {row.item.categoryName}
                          {row.item.fileFormats?.length ? ` · ${row.item.fileFormats.slice(0, 3).map((f) => f.toUpperCase()).join(", ")}` : ""}
                        </span>
                      </span>
                      <span className="shrink-0 text-xs font-semibold text-foreground">
                        {row.item.isFree ? "Free" : <PriceDisplay usdAmount={row.item.price} />}
                      </span>
                    </button>
                  ) : null,
                )}
              </div>
            )}

            {hasQuery &&
              rows.map((row, i) =>
                row.kind === "all" ? (
                  <button
                    key="all"
                    id={`search-option-${i}`}
                    type="button"
                    role="option"
                    aria-selected={activeIndex === i}
                    onMouseDown={(e) => e.preventDefault()}
                    onMouseEnter={() => setActiveIndex(i)}
                    onClick={() => activate(row)}
                    className={cn(
                      "mt-1 flex w-full items-center justify-center gap-1.5 rounded-md border-t border-border px-3 py-2.5 text-xs font-semibold text-primary transition-colors",
                      activeIndex === i ? "bg-secondary" : "hover:bg-secondary/70",
                    )}
                  >
                    See all results for “{query.trim()}”
                    <ArrowRight size={12} aria-hidden="true" />
                  </button>
                ) : null,
              )}
          </div>
        )}
      </div>
    </form>
  )
}

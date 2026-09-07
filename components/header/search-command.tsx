"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import useSWR from "swr"
import { Command as CommandPrimitive } from "cmdk"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PriceDisplay } from "@/components/price-display"
import { ArrowRight, Clock, GameController, ImageOff, Loader2, Search, Sparkles, Tag, ICON_SIZE } from "@/lib/storefront-icons"
import { cn } from "@/lib/utils"

/* ---------------------------------------------------------------- types */

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
type GamingSuggestion = { id: string; slug: string; name: string; platform: string; price: number }
type SuggestionsResponse = { categories: CategorySuggestion[]; products: ProductSuggestion[]; gaming?: GamingSuggestion[] }

const fetcher = (url: string) => fetch(url).then((r) => r.json() as Promise<SuggestionsResponse>)

const RECENT_KEY = "ds:recent-searches"
const RECENT_MAX = 5

/** Real departments only — slugs verified against the catalog. */
const QUICK_LINKS = [
  { label: "Business & Office", href: "/categories/business-office" },
  { label: "Web & Development", href: "/categories/web-development" },
  { label: "Design Resources", href: "/categories/design-resources" },
  { label: "Fonts & Typography", href: "/categories/fonts-typography" },
  { label: "Gaming", href: "/gaming" },
  { label: "Deals", href: "/deals" },
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

/* -------------------------------------------------------------- context */

const SearchContext = createContext<{ open: boolean; setOpen: (v: boolean) => void } | null>(null)

/**
 * One search dialog for the whole storefront. Any trigger (header pill,
 * hero, 404 page, mobile icon) opens the same instance; ⌘K / Ctrl+K and `/`
 * open it from anywhere.
 */
export function SearchProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      const typing = target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((v) => !v)
      } else if (e.key === "/" && !typing) {
        e.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const value = useMemo(() => ({ open, setOpen }), [open])
  return (
    <SearchContext.Provider value={value}>
      {children}
      <SearchCommand open={open} onOpenChange={setOpen} />
    </SearchContext.Provider>
  )
}

export function useSearch() {
  const ctx = useContext(SearchContext)
  if (!ctx) throw new Error("useSearch must be used inside SearchProvider")
  return ctx
}

/* -------------------------------------------------------------- trigger */

/** The header's search affordance: a quiet pill that reads as a field. */
export function SearchTrigger({ className, size = "default", placeholder = "Search the catalog" }: { className?: string; size?: "default" | "lg" | "icon"; placeholder?: string }) {
  const { setOpen } = useSearch()
  if (size === "icon") {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search"
        className={cn(
          "flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
      >
        <Search size={ICON_SIZE.nav} aria-hidden="true" />
      </button>
    )
  }
  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(
        "group flex w-full items-center gap-3 rounded-full border border-border bg-card text-left text-muted-foreground transition-[border-color,box-shadow,background-color] hover:border-border-strong hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        size === "lg" ? "h-13 px-5 text-base" : "h-10 px-4 text-sm",
        className,
      )}
    >
      <Search size={size === "lg" ? ICON_SIZE.nav : ICON_SIZE.base} className="shrink-0 text-muted-foreground transition-colors group-hover:text-foreground" aria-hidden="true" />
      <span className="flex-1 truncate">{placeholder}</span>
      <kbd className="hidden shrink-0 items-center gap-0.5 rounded-md border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground sm:flex">
        <span className="text-[11px]">⌘</span>K
      </kbd>
    </button>
  )
}

/* --------------------------------------------------------------- dialog */

function SearchCommand({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [debounced, setDebounced] = useState("")
  const [recent, setRecent] = useState<string[]>([])

  useEffect(() => {
    const t = setTimeout(() => setDebounced(query.trim()), 160)
    return () => clearTimeout(t)
  }, [query])

  // Reset per open; read recents in the handler, not on mount.
  const [prevOpen, setPrevOpen] = useState(open)
  if (open !== prevOpen) {
    setPrevOpen(open)
    if (open) {
      setQuery("")
      setDebounced("")
      setRecent(readRecent())
    }
  }

  const hasQuery = debounced.length >= 2
  const { data, isLoading } = useSWR(hasQuery ? `/api/search/suggestions?q=${encodeURIComponent(debounced)}` : null, fetcher, {
    keepPreviousData: true,
    dedupingInterval: 5000,
  })
  const categories = hasQuery ? (data?.categories ?? []) : []
  const products = hasQuery ? (data?.products ?? []) : []
  const gaming = hasQuery ? (data?.gaming ?? []) : []
  const total = categories.length + products.length + gaming.length

  const remember = useCallback((term: string) => {
    const next = [term, ...readRecent().filter((r) => r.toLowerCase() !== term.toLowerCase())]
    writeRecent(next)
  }, [])

  const go = useCallback(
    (href: string, term?: string) => {
      if (term) remember(term)
      onOpenChange(false)
      router.push(href)
    },
    [onOpenChange, remember, router],
  )

  const submit = useCallback(() => {
    const t = query.trim()
    if (!t) return
    go(`/products?q=${encodeURIComponent(t)}`, t)
  }, [go, query])

  const item =
    "group/item flex cursor-pointer select-none items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground outline-none data-[selected=true]:bg-secondary"
  const heading = "px-3 pb-1 pt-3 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader className="sr-only">
        <DialogTitle>Search</DialogTitle>
        <DialogDescription>Search products, categories and DistroSource Gaming</DialogDescription>
      </DialogHeader>
      <DialogContent
        showCloseButton={false}
        className="top-[8vh] w-[calc(100%-1.5rem)] max-w-2xl translate-y-0 gap-0 overflow-hidden rounded-2xl border border-border bg-popover p-0 ring-0 shadow-[var(--shadow-e4)] sm:top-[12vh] sm:max-w-2xl"
      >
        <CommandPrimitive shouldFilter={false} loop label="Search" className="flex flex-col">
          <div className="flex h-14 items-center gap-3 border-b border-border px-4">
            {isLoading && hasQuery ? (
              <Loader2 size={ICON_SIZE.base} className="shrink-0 animate-spin text-muted-foreground" aria-hidden="true" />
            ) : (
              <Search size={ICON_SIZE.base} className="shrink-0 text-muted-foreground" aria-hidden="true" />
            )}
            <CommandPrimitive.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search templates, dashboards, fonts, gaming resources…"
              autoFocus
              className="h-full flex-1 bg-transparent text-base text-foreground placeholder:text-muted-foreground focus:outline-none sm:text-sm"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !hasQuery) {
                  e.preventDefault()
                  submit()
                }
              }}
            />
            <kbd className="hidden rounded-md border border-border bg-secondary px-1.5 py-0.5 font-mono text-[10px] font-semibold text-muted-foreground sm:block">Esc</kbd>
          </div>

          <CommandPrimitive.List className="max-h-[min(60vh,28rem)] overflow-y-auto p-2">
            {!hasQuery && (
              <>
                {recent.length > 0 && (
                  <CommandPrimitive.Group heading="Recent" className={cn("[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pb-1 [&_[cmdk-group-heading]]:pt-2", `[&_[cmdk-group-heading]]:${heading.split(" ").join(" [&_[cmdk-group-heading]]:")}`)}>
                    {recent.map((r) => (
                      <CommandPrimitive.Item key={`r-${r}`} value={`recent ${r}`} onSelect={() => go(`/products?q=${encodeURIComponent(r)}`, r)} className={item}>
                        <Clock size={ICON_SIZE.sm} className="shrink-0 text-muted-foreground" aria-hidden="true" />
                        <span className="truncate">{r}</span>
                      </CommandPrimitive.Item>
                    ))}
                  </CommandPrimitive.Group>
                )}
                <p className={heading}>Jump to</p>
                <div className="grid grid-cols-2 gap-0.5">
                  {QUICK_LINKS.map((q) => (
                    <CommandPrimitive.Item key={q.href} value={`quick ${q.label}`} onSelect={() => go(q.href)} className={item}>
                      {q.href === "/gaming" ? (
                        <GameController size={ICON_SIZE.sm} className="shrink-0 text-muted-foreground" aria-hidden="true" />
                      ) : q.href === "/deals" ? (
                        <Tag size={ICON_SIZE.sm} className="shrink-0 text-muted-foreground" aria-hidden="true" />
                      ) : (
                        <Sparkles size={ICON_SIZE.sm} className="shrink-0 text-muted-foreground" aria-hidden="true" />
                      )}
                      <span className="truncate">{q.label}</span>
                    </CommandPrimitive.Item>
                  ))}
                </div>
              </>
            )}

            {hasQuery && !isLoading && total === 0 && (
              <div className="px-3 py-10 text-center">
                <p className="text-sm font-medium text-foreground">No matches for “{debounced}”</p>
                <p className="mt-1 text-xs text-muted-foreground">Try a shorter term, or press Enter to search the whole catalog.</p>
              </div>
            )}

            {hasQuery && categories.length > 0 && (
              <>
                <p className={heading}>Categories</p>
                {categories.map((c) => (
                  <CommandPrimitive.Item key={`c-${c.id}`} value={`category ${c.id}`} onSelect={() => go(`/categories/${c.slug}`)} className={item}>
                    <Tag size={ICON_SIZE.sm} className="shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="truncate font-medium">{c.department ? `${c.department} / ${c.name}` : c.name}</span>
                    <span className="ml-auto shrink-0 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{c.isDepartment ? "Department" : "Category"}</span>
                  </CommandPrimitive.Item>
                ))}
              </>
            )}

            {hasQuery && products.length > 0 && (
              <>
                <p className={heading}>Products</p>
                {products.map((p) => (
                  <CommandPrimitive.Item key={`p-${p.id}`} value={`product ${p.id}`} onSelect={() => go(`/products/${p.slug}`, query.trim() || p.name)} className={item}>
                    <span className="relative aspect-[16/10] w-14 shrink-0 overflow-hidden rounded-md border border-border bg-secondary/50">
                      {p.image ? (
                        <Image src={p.image} alt="" fill className="object-cover" sizes="56px" />
                      ) : (
                        <span className="flex h-full w-full items-center justify-center text-muted-foreground/50">
                          <ImageOff size={ICON_SIZE.sm} aria-hidden="true" />
                        </span>
                      )}
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-medium">{p.name}</span>
                      <span className="truncate text-[11px] text-muted-foreground">
                        {p.categoryName}
                        {p.fileFormats?.length ? ` · ${p.fileFormats.slice(0, 3).map((f) => f.toUpperCase()).join(", ")}` : ""}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs font-semibold tabular-nums">{p.isFree ? "Free" : <PriceDisplay usdAmount={p.price} />}</span>
                  </CommandPrimitive.Item>
                ))}
              </>
            )}

            {hasQuery && gaming.length > 0 && (
              <>
                <p className={heading}>DistroSource Gaming</p>
                {gaming.map((g) => (
                  <CommandPrimitive.Item key={`g-${g.id}`} value={`gaming ${g.id}`} onSelect={() => go(`/gaming/product/${g.slug}`)} className={item}>
                    <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-navy text-navy-foreground">
                      <GameController size={ICON_SIZE.sm} aria-hidden="true" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-medium">{g.name}</span>
                      <span className="truncate text-[11px] text-muted-foreground">{g.platform}</span>
                    </span>
                    <span className="shrink-0 text-xs font-semibold tabular-nums">
                      <PriceDisplay usdAmount={g.price} />
                    </span>
                  </CommandPrimitive.Item>
                ))}
              </>
            )}

            {hasQuery && total > 0 && (
              <CommandPrimitive.Item value="see-all" onSelect={submit} className={cn(item, "mt-1 justify-center border-t border-border pt-3 text-xs font-semibold text-primary")}>
                See all results for “{query.trim()}”
                <ArrowRight size={12} aria-hidden="true" />
              </CommandPrimitive.Item>
            )}
          </CommandPrimitive.List>

          <div className="flex items-center gap-4 border-t border-border bg-secondary/40 px-4 py-2 font-mono text-[10px] text-muted-foreground">
            <span><kbd className="rounded border border-border bg-background px-1">↑↓</kbd> navigate</span>
            <span><kbd className="rounded border border-border bg-background px-1">↵</kbd> open</span>
            <span className="ml-auto hidden sm:inline">Typo-tolerant search across {QUICK_LINKS.length - 2} departments and Gaming</span>
          </div>
        </CommandPrimitive>
      </DialogContent>
    </Dialog>
  )
}

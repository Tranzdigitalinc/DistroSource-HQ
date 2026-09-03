"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import useSWR from "swr"
import { Search, ArrowRight, Loader2, Tag, ImageOff } from "@/lib/storefront-icons"
import { Input } from "@/components/ui/input"
import { PriceDisplay } from "@/components/price-display"
import { cn } from "@/lib/utils"

type CategorySuggestion = {
  id: number
  slug: string
  name: string
  department: string | null
  isDepartment: boolean
}

type ProductSuggestion = {
  id: number
  slug: string
  name: string
  image: string | null
  categoryName: string
  isFree: boolean
  price: string
  compareAtPrice: string | null
}

type SuggestionsResponse = { categories: CategorySuggestion[]; products: ProductSuggestion[] }

const fetcher = (url: string) => fetch(url).then((res) => res.json() as Promise<SuggestionsResponse>)

export function HeaderSearch({
  className,
  size = "default",
}: {
  className?: string
  size?: "default" | "lg"
}) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [focused, setFocused] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)

  // Debounce the network lookup — waits for typing to pause instead of
  // firing a request on every keystroke.
  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedQuery(query.trim()), 220)
    return () => clearTimeout(timeout)
  }, [query])

  const shouldFetch = debouncedQuery.length >= 2
  const { data, isLoading } = useSWR(
    shouldFetch ? `/api/search/suggestions?q=${encodeURIComponent(debouncedQuery)}` : null,
    fetcher,
    { keepPreviousData: true, dedupingInterval: 5000 },
  )

  const categorySuggestions = shouldFetch ? data?.categories ?? [] : []
  const productSuggestions = shouldFetch ? data?.products ?? [] : []
  const flatResults = [
    ...categorySuggestions.map((c) => ({ type: "category" as const, item: c })),
    ...productSuggestions.map((p) => ({ type: "product" as const, item: p })),
  ]
  const showDropdown = focused && shouldFetch && (isLoading || flatResults.length > 0 || !isLoading)

  useEffect(() => {
    setActiveIndex(-1)
  }, [debouncedQuery])

  function goToCategory(category: CategorySuggestion) {
    router.push(`/categories/${category.slug}`)
    setFocused(false)
  }

  function goToProduct(product: ProductSuggestion) {
    router.push(`/products/${product.slug}`)
    setFocused(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (activeIndex >= 0 && flatResults[activeIndex]) {
      const result = flatResults[activeIndex]
      if (result.type === "category") goToCategory(result.item)
      else goToProduct(result.item)
      return
    }
    if (!query.trim()) return
    router.push(`/products?q=${encodeURIComponent(query.trim())}`)
    setFocused(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown || flatResults.length === 0) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => (i + 1 >= flatResults.length ? 0 : i + 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 < 0 ? flatResults.length - 1 : i - 1))
    } else if (e.key === "Escape") {
      setFocused(false)
    }
  }

  const isLarge = size === "lg"

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div ref={containerRef} className={cn("relative w-full transition-all duration-200", focused && "scale-[1.01]")}>
        <Search
          className={cn(
            "pointer-events-none absolute top-1/2 -translate-y-1/2 transition-colors",
            isLarge ? "left-4 size-5" : "left-3 size-4",
            focused ? "text-accent" : "text-muted-foreground",
          )}
        />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setTimeout(() => setFocused(false), 120)}
          onKeyDown={handleKeyDown}
          placeholder="Search templates, fonts, UI kits, presentations..."
          className={cn(
            "w-full transition-all",
            isLarge
              ? "h-14 rounded-[4px] border-border-strong bg-card pl-12 pr-14 text-base shadow-sm"
              : "h-10 rounded-full bg-secondary pl-9 pr-10 text-sm",
            focused && (isLarge ? "ring-2 ring-accent/25" : "bg-secondary/80 ring-2 ring-accent/25"),
          )}
          aria-label="Search products"
          role="combobox"
          aria-expanded={showDropdown}
          aria-autocomplete="list"
          aria-activedescendant={activeIndex >= 0 ? `search-suggestion-${activeIndex}` : undefined}
        />
        {query.trim() && (
          <button
            type="submit"
            className={cn(
              "absolute top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform hover:scale-110",
              isLarge ? "right-3 size-9" : "right-2 size-6",
            )}
            aria-label="Search"
          >
            <ArrowRight className={isLarge ? "size-4" : "size-3"} />
          </button>
        )}

        {showDropdown && (
          <div
            className={cn(
              "absolute inset-x-0 z-50 max-h-[70vh] overflow-y-auto rounded-2xl border border-border bg-card p-1.5 shadow-xl",
              isLarge ? "top-16" : "top-12",
            )}
            role="listbox"
            aria-label="Search suggestions"
          >
            {isLoading && flatResults.length === 0 && (
              <div className="flex items-center justify-center gap-2 py-6 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Searching…
              </div>
            )}

            {!isLoading && flatResults.length === 0 && (
              <div className="px-3 py-6 text-center text-sm text-muted-foreground">
                No matches for &ldquo;{debouncedQuery}&rdquo;
              </div>
            )}

            {categorySuggestions.length > 0 && (
              <div className="pb-1">
                <p className="px-3 pb-1 pt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  Categories
                </p>
                {categorySuggestions.map((category, i) => {
                  const flatIndex = i
                  return (
                    <button
                      key={`cat-${category.id}`}
                      id={`search-suggestion-${flatIndex}`}
                      type="button"
                      role="option"
                      aria-selected={activeIndex === flatIndex}
                      className={cn(
                        "flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-secondary",
                        activeIndex === flatIndex && "bg-secondary",
                      )}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseEnter={() => setActiveIndex(flatIndex)}
                      onClick={() => goToCategory(category)}
                    >
                      <Tag className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate font-medium">
                        {category.department ? `${category.department} / ${category.name}` : category.name}
                      </span>
                      <span className="ml-auto shrink-0 text-[11px] text-muted-foreground">
                        {category.isDepartment ? "Department" : "Category"}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {productSuggestions.length > 0 && (
              <div className="pt-1">
                <p className="px-3 pb-1 pt-2 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                  Products
                </p>
                {productSuggestions.map((product, i) => {
                  const flatIndex = categorySuggestions.length + i
                  return (
                    <button
                      key={`prod-${product.id}`}
                      id={`search-suggestion-${flatIndex}`}
                      type="button"
                      role="option"
                      aria-selected={activeIndex === flatIndex}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-secondary",
                        activeIndex === flatIndex && "bg-secondary",
                      )}
                      onMouseDown={(event) => event.preventDefault()}
                      onMouseEnter={() => setActiveIndex(flatIndex)}
                      onClick={() => goToProduct(product)}
                    >
                      <span className="relative size-9 shrink-0 overflow-hidden rounded-lg bg-secondary">
                        {product.image ? (
                          <Image src={product.image || "/placeholder.svg"} alt="" fill className="object-cover" sizes="36px" />
                        ) : (
                          <span className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                            <ImageOff className="size-4" />
                          </span>
                        )}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="truncate font-medium">{product.name}</span>
                        <span className="truncate text-[11px] text-muted-foreground">{product.categoryName}</span>
                      </span>
                      <span className="shrink-0 font-mono text-xs font-semibold text-foreground">
                        {product.isFree ? "Free" : <PriceDisplay usdAmount={product.price} />}
                      </span>
                    </button>
                  )
                })}
              </div>
            )}

            {flatResults.length > 0 && (
              <button
                type="button"
                className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-center font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-primary transition-colors hover:bg-secondary"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => {
                  router.push(`/products?q=${encodeURIComponent(query.trim())}`)
                  setFocused(false)
                }}
              >
                See all results for &ldquo;{query.trim()}&rdquo;
                <ArrowRight className="size-3" />
              </button>
            )}
          </div>
        )}
      </div>
    </form>
  )
}

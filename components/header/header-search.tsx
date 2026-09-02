"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Search, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type SearchItem = { slug: string; name: string }

export function HeaderSearch({ className, categories = [] }: { className?: string; categories?: SearchItem[] }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)
  const suggestions =
    query.trim().length < 2
      ? []
      : categories
          .filter((item) => item.name.toLowerCase().includes(query.trim().toLowerCase()))
          .slice(0, 6)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`/products?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className={cn(
        "relative w-full transition-all duration-200",
        focused && "scale-[1.02]"
      )}>
        <Search className={cn(
          "pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 transition-colors",
          focused ? "text-accent" : "text-muted-foreground"
        )} />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search templates, fonts, presentations..."
          className={cn(
            "h-10 w-full rounded-full bg-secondary pl-9 pr-10 text-sm transition-all",
            focused && "bg-secondary/80 ring-2 ring-accent/25"
          )}
          aria-label="Search products"
        />
        {query.trim() && (
          <button
            type="submit"
            className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-accent-foreground transition-transform hover:scale-110"
            aria-label="Search"
          >
            <ArrowRight className="size-3" />
          </button>
        )}
        {focused && suggestions.length > 0 && (
          <div className="absolute inset-x-0 top-12 z-50 overflow-hidden rounded-2xl border border-border bg-card p-1.5 shadow-xl" role="listbox" aria-label="Search suggestions">
            {suggestions.map((item) => (
              <button
                key={item.slug}
                type="button"
                role="option"
                className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition-colors hover:bg-secondary"
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => router.push(`/categories/${item.slug}`)}
              >
                <span className="truncate font-medium">{item.name}</span>
                <span className="ml-3 shrink-0 text-[11px] text-muted-foreground">Category</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </form>
  )
}

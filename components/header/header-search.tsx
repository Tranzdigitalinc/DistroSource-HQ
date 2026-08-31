"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Search, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export function HeaderSearch({ className }: { className?: string }) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [focused, setFocused] = useState(false)

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
          focused ? "text-primary" : "text-muted-foreground"
        )} />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search gift cards, games, top-ups..."
          className={cn(
            "h-10 w-full rounded-full bg-secondary pl-9 pr-10 text-sm transition-all",
            focused && "bg-secondary/80 ring-2 ring-primary/20"
          )}
          aria-label="Search products"
        />
        {query.trim() && (
          <button
            type="submit"
            className="absolute right-2 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-110"
            aria-label="Search"
          >
            <ArrowRight className="size-3" />
          </button>
        )}
      </div>
    </form>
  )
}

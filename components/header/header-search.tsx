"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"

export function HeaderSearch({ className }: { className?: string }) {
  const router = useRouter()
  const [query, setQuery] = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`/products?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <form onSubmit={handleSubmit} className={className}>
      <div className="relative w-full">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search gift cards, games, top-ups..."
          className="h-10 w-full rounded-full bg-secondary pl-9 pr-4 text-sm"
          aria-label="Search products"
        />
      </div>
    </form>
  )
}

"use client"

import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "rating", label: "Highest rated" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
]

export function CatalogToolbar({ resultCount }: { resultCount: number }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get("sort") ?? "featured"

  function setSort(value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "featured") {
      params.set("sort", value)
    } else {
      params.delete("sort")
    }
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
      <p className="text-sm text-muted-foreground">
        <span className="font-semibold text-foreground">{resultCount}</span> {resultCount === 1 ? "result" : "results"}
      </p>
      <Select value={currentSort} onValueChange={setSort}>
        <SelectTrigger className="w-48">
          <SelectValue placeholder="Sort by" />
        </SelectTrigger>
        <SelectContent>
          {sortOptions.map((opt) => (
            <SelectItem key={opt.value} value={opt.value}>
              {opt.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

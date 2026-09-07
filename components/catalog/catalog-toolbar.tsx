"use client"

import Link from "next/link"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Close } from "@/lib/storefront-icons"
import { licenseLabel } from "@/lib/licenses"
import { getSourceTypeLabel } from "@/lib/format"

const sortOptions = [
  { value: "featured", label: "Recommended" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
]

const FILTER_LABELS: Record<string, (value: string) => string> = {
  category: (value) => value.replace(/-/g, " "),
  maxPrice: (value) => `Under $${value}`,
  format: (value) => value.toUpperCase(),
  software: (value) => value,
  source: (value) => getSourceTypeLabel(value),
  license: (value) => `${licenseLabel(value)} licence`,
  free: () => "Free",
  bundle: () => "Bundles",
  deal: () => "On sale",
  minRating: (value) => `${value}+ stars`,
  q: (value) => `“${value}”`,
}

export function CatalogToolbar({ resultCount, showRatingSort = false }: { resultCount: number; showRatingSort?: boolean }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get("sort") ?? "featured"
  const active = [...searchParams.entries()].filter(([key, value]) => key in FILTER_LABELS && value)

  function setSort(value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value && value !== "featured") params.set("sort", value)
    else params.delete("sort")
    params.delete("page")
    const qs = params.toString()
    router.push(qs ? `${pathname}?${qs}` : pathname)
  }

  function removeFilter(key: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(key)
    params.delete("page")
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  const options = showRatingSort ? [...sortOptions.slice(0, 2), { value: "rating", label: "Highest rated" }, ...sortOptions.slice(2)] : sortOptions

  return (
    <div className="border-b border-border pb-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.1em] text-muted-foreground" aria-live="polite"><span className="text-foreground">{resultCount.toLocaleString()}</span> {resultCount === 1 ? "product" : "products"}</p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="hidden sm:inline">Sort by</span>
          <Select items={options} value={currentSort} onValueChange={setSort}>
            <SelectTrigger className="h-10 min-w-44 rounded-none border-x-0 border-t-0 bg-transparent px-0 shadow-none" aria-label="Sort products"><SelectValue placeholder="Sort" /></SelectTrigger>
            <SelectContent>{options.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
          </Select>
        </div>
      </div>

      {active.length > 0 && (
        <div className="mt-4 flex flex-wrap items-center gap-2" aria-label="Active filters">
          {active.map(([key, value]) => (
            <Link key={key} href={removeFilter(key)} className="group inline-flex items-center gap-2 border border-border px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-foreground" aria-label={`Remove filter ${FILTER_LABELS[key](value)}`}>
              {FILTER_LABELS[key](value)} <Close size={11} className="text-muted-foreground group-hover:text-foreground" />
            </Link>
          ))}
          <Link href={pathname} className="ml-1 text-xs font-semibold text-muted-foreground hover:text-foreground">Clear all</Link>
        </div>
      )}
    </div>
  )
}

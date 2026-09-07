"use client"

import Link from "next/link"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Close } from "@/lib/storefront-icons"
import { licenseLabel } from "@/lib/licenses"
import { getSourceTypeLabel } from "@/lib/format"

// "Recommended" is the catalog's curated order (isFeatured, then recency).
// There is no "Best selling" until real sales data supports it.
const sortOptions = [
  { value: "featured", label: "Recommended" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
]

/** Human labels for every filter param that can appear in the URL. */
const FILTER_LABELS: Record<string, (v: string) => string> = {
  category: (v) => v.replace(/-/g, " "),
  maxPrice: (v) => `Under $${v}`,
  format: (v) => v.toUpperCase(),
  software: (v) => v,
  source: (v) => getSourceTypeLabel(v),
  license: (v) => `${licenseLabel(v)} licence`,
  free: () => "Free",
  bundle: () => "Bundles",
  deal: () => "On sale",
  minRating: (v) => `${v}+ stars`,
  q: (v) => `“${v}”`,
}

export function CatalogToolbar({ resultCount, showRatingSort = false, leading }: { resultCount: number; showRatingSort?: boolean; leading?: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentSort = searchParams.get("sort") ?? "featured"

  const active = [...searchParams.entries()].filter(([k, v]) => k in FILTER_LABELS && v)

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
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {leading}
          <p className="text-sm text-muted-foreground" aria-live="polite">
            <span className="font-semibold tabular-nums text-foreground">{resultCount.toLocaleString()}</span> {resultCount === 1 ? "product" : "products"}
          </p>
        </div>
        <Select items={options} value={currentSort} onValueChange={setSort}>
          <SelectTrigger className="h-10 w-48 rounded-full border-border bg-card px-4 text-sm" aria-label="Sort products">
            <span className="text-muted-foreground">Sort:</span>
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {options.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {active.length > 0 && (
        <div className="flex flex-wrap items-center gap-2" aria-label="Active filters">
          {active.map(([key, value]) => (
            <Link
              key={key}
              href={removeFilter(key)}
              className="group inline-flex items-center gap-1.5 rounded-full bg-foreground py-1.5 pl-3 pr-2 text-xs font-medium text-background transition-colors hover:bg-primary hover:text-primary-foreground"
              aria-label={`Remove filter ${FILTER_LABELS[key](value)}`}
            >
              {FILTER_LABELS[key](value)}
              <Close size={12} aria-hidden="true" />
            </Link>
          ))}
          <Link href={pathname} className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
            Clear all
          </Link>
        </div>
      )}
    </div>
  )
}

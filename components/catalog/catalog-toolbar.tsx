"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Close } from "@/lib/storefront-icons"
import { licenseLabel } from "@/lib/licenses"
import { getSourceTypeLabel } from "@/lib/format"

const sortOptions = [
  { value: "featured", label: "Recommended" },
  { value: "newest", label: "Newest first" },
  { value: "price-asc", label: "Price · low to high" },
  { value: "price-desc", label: "Price · high to low" },
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
    router.push(`${pathname}?${params.toString()}`)
  }

  function removeFilter(key: string) {
    const params = new URLSearchParams(searchParams.toString())
    params.delete(key)
    params.delete("page")
    return `${pathname}?${params.toString()}`
  }

  const options = showRatingSort
    ? [...sortOptions.slice(0, 2), { value: "rating", label: "Highest rated" }, ...sortOptions.slice(2)]
    : sortOptions

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-5">
      <div className="flex min-h-11 flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          <strong className="font-display text-base font-black tracking-tight text-foreground">{resultCount.toLocaleString()}</strong>{" "}
          {resultCount === 1 ? "product" : "products"}
        </p>

        <Select items={options} value={currentSort} onValueChange={setSort}>
          <SelectTrigger className="h-11 w-[190px] rounded-full border-border bg-background px-4 shadow-none" aria-label="Sort products">
            <SelectValue placeholder="Sort products" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl">
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
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
              className="group inline-flex h-9 items-center gap-2 rounded-full bg-foreground px-3.5 text-[11px] font-semibold text-background transition-transform hover:-translate-y-0.5"
              aria-label={`Remove filter ${FILTER_LABELS[key](value)}`}
            >
              {FILTER_LABELS[key](value)}
              <Close size={11} className="text-background/55 transition-colors group-hover:text-background" />
            </Link>
          ))}
          <Link href={pathname} className="inline-flex h-9 items-center px-2 text-[11px] font-semibold text-muted-foreground hover:text-foreground">
            Clear all
          </Link>
        </div>
      )}
    </div>
  )
}

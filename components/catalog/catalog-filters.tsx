"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { X } from "lucide-react"
import { getCategoryIcon } from "@/lib/category-icons"
import { FlagIcon } from "@/components/flag-icon"
import { cn } from "@/lib/utils"
import type { getCategories, getBrands, getCountries } from "@/lib/queries/catalog"

interface Props {
  categories: Awaited<ReturnType<typeof getCategories>>
  brands: Awaited<ReturnType<typeof getBrands>>
  countries: Awaited<ReturnType<typeof getCountries>>
}

export function CatalogFilters({ categories, brands, countries }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function buildHref(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    return `${pathname}?${params.toString()}`
  }

  const activeCategory = searchParams.get("category")
  const activeBrand = searchParams.get("brand")
  const activeCountry = searchParams.get("country")
  const hasActiveFilters = Boolean(activeCategory || activeBrand || activeCountry)

  return (
    <aside className="flex w-full flex-col gap-5 lg:w-64">
      <div className="rounded-xl border border-border bg-card lg:sticky lg:top-20">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Filters</h2>
          {hasActiveFilters && (
            <Link
              href={pathname}
              className="flex items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
            >
              <X className="size-3.5" />
              Clear all
            </Link>
          )}
        </div>

        <div className="flex flex-col gap-6 p-4">
          <FilterGroup title="Category">
            <FilterLink href={buildHref("category", null)} active={!activeCategory} label="All categories" />
            {categories.map((c) => {
              const Icon = getCategoryIcon(c.name)
              return (
                <FilterLink
                  key={c.slug}
                  href={buildHref("category", c.slug)}
                  active={activeCategory === c.slug}
                  label={c.name}
                  icon={<Icon className="size-3.5" />}
                />
              )
            })}
          </FilterGroup>

          <FilterGroup title="Country">
            <FilterLink href={buildHref("country", null)} active={!activeCountry} label="All countries" />
            {countries.slice(0, 10).map((c) => (
              <FilterLink
                key={c.code}
                href={buildHref("country", c.code)}
                active={activeCountry === c.code}
                label={c.name}
                countryCode={c.code}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Brand">
            <FilterLink href={buildHref("brand", null)} active={!activeBrand} label="All brands" />
            {brands.slice(0, 14).map((b) => (
              <FilterLink
                key={b.slug}
                href={buildHref("brand", b.slug)}
                active={activeBrand === b.slug}
                label={b.name}
              />
            ))}
          </FilterGroup>
        </div>
      </div>
    </aside>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  )
}

function FilterLink({
  href,
  active,
  label,
  icon,
  countryCode,
}: {
  href: string
  active: boolean
  label: string
  icon?: React.ReactNode
  countryCode?: string | null
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
        active ? "bg-primary/10 font-medium text-primary" : "text-foreground/80 hover:bg-secondary",
      )}
    >
      <span
        className={cn(
          "size-1.5 shrink-0 rounded-full transition-colors",
          active ? "bg-primary" : "bg-transparent group-hover:bg-border",
        )}
      />
      {countryCode && <FlagIcon code={countryCode} />}
      {icon && <span className={cn("shrink-0", active ? "text-primary" : "text-muted-foreground")}>{icon}</span>}
      <span className="truncate">{label}</span>
    </Link>
  )
}

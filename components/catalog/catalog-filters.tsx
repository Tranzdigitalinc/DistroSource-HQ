"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
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

  return (
    <aside className="flex w-full flex-col gap-8 lg:w-56">
      <FilterGroup title="Category">
        <FilterLink href={buildHref("category", null)} active={!activeCategory} label="All categories" />
        {categories.map((c) => (
          <FilterLink
            key={c.slug}
            href={buildHref("category", c.slug)}
            active={activeCategory === c.slug}
            label={c.name}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Country">
        <FilterLink href={buildHref("country", null)} active={!activeCountry} label="All countries" />
        {countries.slice(0, 10).map((c) => (
          <FilterLink
            key={c.code}
            href={buildHref("country", c.code)}
            active={activeCountry === c.code}
            label={`${c.flagEmoji ?? ""} ${c.name}`}
          />
        ))}
      </FilterGroup>

      <FilterGroup title="Brand">
        <FilterLink href={buildHref("brand", null)} active={!activeBrand} label="All brands" />
        {brands.slice(0, 14).map((b) => (
          <FilterLink key={b.slug} href={buildHref("brand", b.slug)} active={activeBrand === b.slug} label={b.name} />
        ))}
      </FilterGroup>
    </aside>
  )
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{title}</h3>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  )
}

function FilterLink({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "truncate rounded-md px-2 py-1.5 text-sm transition-colors",
        active ? "bg-primary/10 font-medium text-primary" : "text-foreground/80 hover:bg-secondary",
      )}
    >
      {label}
    </Link>
  )
}

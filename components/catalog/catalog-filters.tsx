"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

const priceOptions = [
  { label: "Under $10", value: "10" },
  { label: "Under $25", value: "25" },
  { label: "Under $50", value: "50" },
  { label: "Under $100", value: "100" },
]

export function CatalogFilters() {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  function buildHref(key: string, value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    return `${pathname}?${params.toString()}`
  }

  const activeMaxPrice = searchParams.get("maxPrice")
  const activeFree = searchParams.get("free")
  const activeBundle = searchParams.get("bundle")
  const hasActiveFilters = Boolean(activeMaxPrice || activeFree || activeBundle)

  return (
    <aside className="flex w-full flex-col gap-5 lg:w-64">
      <div className="border border-border bg-card lg:sticky lg:top-20">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h2 className="font-mono text-xs font-semibold uppercase tracking-[0.04em]">Filters</h2>
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
          <FilterGroup title="Price">
            <FilterLink href={buildHref("maxPrice", null)} active={!activeMaxPrice} label="Any price" />
            {priceOptions.map((opt) => (
              <FilterLink
                key={opt.value}
                href={buildHref("maxPrice", opt.value)}
                active={activeMaxPrice === opt.value}
                label={opt.label}
              />
            ))}
          </FilterGroup>

          <FilterGroup title="Type">
            <FilterLink href={buildHref("free", "true")} active={activeFree === "true"} label="Free resources" />
            <FilterLink href={buildHref("bundle", "true")} active={activeBundle === "true"} label="Premium bundles" />
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
}: {
  href: string
  active: boolean
  label: string
  icon?: React.ReactNode
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
      {icon && <span className={cn("shrink-0", active ? "text-primary" : "text-muted-foreground")}>{icon}</span>}
      <span className="truncate">{label}</span>
    </Link>
  )
}

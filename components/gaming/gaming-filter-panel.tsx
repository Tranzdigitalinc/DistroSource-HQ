import Link from "next/link"
import { gamingHref, type GamingBase } from "@/lib/gaming/browse-url"
import type { GamingFacetOption, GamingFacets, GamingQuery } from "@/lib/gaming/queries"
import { cn } from "@/lib/utils"

interface GamingFilterPanelProps {
  base: GamingBase
  query: GamingQuery
  facets: GamingFacets
  className?: string
}

type Dimension = "platform" | "category" | "kind" | "model" | "framework" | "price"

/**
 * Filters as plain links, so they work before any JavaScript loads and every
 * filtered view has a shareable URL. Only options with products are listed;
 * clicking the active option clears it.
 */
export function GamingFilterPanel({ base, query, facets, className }: GamingFilterPanelProps) {
  const groups: { key: Dimension; title: string; options: GamingFacetOption[]; hideWhenFixed?: boolean }[] = [
    { key: "platform", title: "Platform", options: facets.platforms, hideWhenFixed: true },
    { key: "category", title: "Category", options: facets.categories },
    { key: "kind", title: "Type", options: facets.kinds, hideWhenFixed: true },
    { key: "model", title: "Subscription type", options: query.kind === "one-time" ? [] : facets.models },
    { key: "framework", title: "Framework", options: facets.frameworks },
    { key: "price", title: "Price", options: facets.prices },
  ]

  return (
    <nav aria-label="Filters" className={cn("flex flex-col gap-6", className)}>
      {groups.map((group) => {
        if (group.hideWhenFixed && group.key in base.fixed) return null
        if (group.options.length === 0) return null
        const current = query[group.key]
        return (
          <section key={group.key} aria-labelledby={`gf-${group.key}`}>
            <h2 id={`gf-${group.key}`} className="mb-2 px-2.5 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {group.title}
            </h2>
            <ul className="flex flex-col gap-0.5">
              {group.options.map((option) => {
                const active = current === option.id
                return (
                  <li key={option.id}>
                    <Link
                      href={gamingHref(base, query, { [group.key]: active ? undefined : option.id })}
                      aria-current={active ? "true" : undefined}
                      scroll={false}
                      className={cn(
                        "flex items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-sm transition-colors",
                        active ? "bg-foreground font-semibold text-background" : "text-foreground/80 hover:bg-secondary hover:text-foreground",
                      )}
                    >
                      <span>{option.label}</span>
                      <span className={cn("font-mono text-xs tabular-nums", active ? "text-background/70" : "text-muted-foreground")}>{option.count}</span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </section>
        )
      })}
    </nav>
  )
}

import Link from "next/link"
import { GamingCard } from "@/components/gaming/gaming-card"
import { GamingFilterPanel } from "@/components/gaming/gaming-filter-panel"
import { GamingFilterSheet, GamingSortSelect } from "@/components/gaming/gaming-browse-controls"
import { Button } from "@/components/ui/button"
import { gamingHref, type GamingBase } from "@/lib/gaming/browse-url"
import { filterGamingProducts, getGamingFacets, type GamingQuery } from "@/lib/gaming/queries"
import { FRAMEWORK_LABEL, GAMING_PRICE_BANDS, GAMING_SORTS, PLATFORM_BY_ID, SUBSCRIPTION_MODELS, categoryLabel } from "@/lib/gaming/catalog/taxonomy"
import { ChevronRight, Search, SearchEmpty, X, ICON_SIZE } from "@/lib/storefront-icons"

interface GamingBrowseProps {
  base: GamingBase
  query: GamingQuery
  eyebrow: string
  title: string
  description: string
  crumb: string
}

/**
 * The one Gaming browse view. /gaming/products, /gaming/fivem,
 * /gaming/minecraft and /gaming/subscriptions all render this with a
 * different base, so there is a single implementation to maintain.
 */
export function GamingBrowse({ base, query, eyebrow, title, description, crumb }: GamingBrowseProps) {
  const products = filterGamingProducts(query)
  const facets = getGamingFacets(query)

  const chips: { label: string; href: string }[] = []
  const add = (key: keyof GamingQuery, label: string) => {
    if (key in base.fixed) return
    chips.push({ label, href: gamingHref(base, query, { [key]: undefined }) })
  }
  if (query.platform) add("platform", PLATFORM_BY_ID[query.platform].label)
  if (query.platform && query.category) add("category", categoryLabel(query.platform, query.category))
  if (query.kind) add("kind", query.kind === "subscription" ? "Subscription" : "One-time")
  if (query.model) add("model", SUBSCRIPTION_MODELS[query.model].label)
  if (query.framework) add("framework", FRAMEWORK_LABEL[query.framework])
  if (query.price) add("price", GAMING_PRICE_BANDS.find((b) => b.id === query.price)?.label ?? query.price)
  if (query.q) add("q", `“${query.q}”`)

  const clearAll = gamingHref(base, { sort: query.sort, ...base.fixed }, {})
  const sortOptions = GAMING_SORTS.map((s) => ({ id: s.id, label: s.label, href: gamingHref(base, query, { sort: s.id }) }))
  const hidden = Object.entries({ ...query, q: undefined }).filter(
    ([k, v]) => v !== undefined && !(k in base.fixed) && !(k === "sort" && v === "featured"),
  ) as [string, string][]

  const panel = <GamingFilterPanel base={base} query={query} facets={facets} />

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-6 sm:px-6 md:pt-8">
      <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link href="/gaming" className="hover:text-foreground">
          Gaming
        </Link>
        <ChevronRight size={12} aria-hidden="true" />
        <span className="font-medium text-foreground">{crumb}</span>
      </nav>

      <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-2xl">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-balance md:text-4xl">{title}</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">{description}</p>
        </div>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          <span className="font-semibold tabular-nums text-foreground">{products.length}</span> {products.length === 1 ? "product" : "products"}
        </p>
      </header>

      <div className="mb-5 flex flex-wrap items-center gap-2.5">
        <form action={base.path} method="get" role="search" className="relative min-w-0 flex-1 basis-64">
          {hidden.map(([k, v]) => (
            <input key={k} type="hidden" name={k} value={v} />
          ))}
          <label htmlFor="gaming-search" className="sr-only">
            Search Gaming
          </label>
          <Search size={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <input
            id="gaming-search"
            name="q"
            type="search"
            defaultValue={query.q ?? ""}
            placeholder="Search MLOs, HUDs, vehicles, spawns, branding…"
            className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground hover:border-foreground/30 focus-visible:ring-2 focus-visible:ring-ring"
          />
        </form>
        <GamingSortSelect value={query.sort} options={sortOptions} />
        <GamingFilterSheet activeCount={chips.length}>{panel}</GamingFilterSheet>
      </div>

      {chips.length > 0 && (
        <ul className="mb-6 flex flex-wrap items-center gap-2" aria-label="Active filters">
          {chips.map((chip) => (
            <li key={chip.label}>
              <Link
                href={chip.href}
                scroll={false}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card py-1 pl-3 pr-2 text-xs font-medium text-foreground transition-colors hover:border-foreground/40"
              >
                {chip.label}
                <X size={12} aria-hidden="true" />
                <span className="sr-only">Remove filter</span>
              </Link>
            </li>
          ))}
          <li>
            <Link href={clearAll} scroll={false} className="px-1 text-xs font-semibold text-primary hover:underline">
              Clear all
            </Link>
          </li>
        </ul>
      )}

      <div className="flex gap-8">
        <aside className="hidden w-56 shrink-0 lg:block">
          <div className="sticky top-24">{panel}</div>
        </aside>

        <div className="min-w-0 flex-1">
          {products.length === 0 ? (
            <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-xl border border-border bg-card px-6 py-16 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                <SearchEmpty size={ICON_SIZE.feature} aria-hidden="true" />
              </span>
              <div>
                <h2 className="font-display text-lg font-bold">Nothing matches that yet</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">Remove a filter or search for something broader.</p>
              </div>
              <Button render={<Link href={clearAll} />} nativeButton={false} className="font-semibold">
                Clear filters
              </Button>
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {products.map((product, i) => (
                <li key={product.id} className="flex">
                  <GamingCard product={product} priority={i < 3} className="w-full" />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}

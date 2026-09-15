import type { GamingQuery } from "@/lib/gaming/queries"

/**
 * A browse page: its path plus the filters its URL already implies. For
 * example /gaming/fivem fixes `platform: "fivem"`, /gaming/subscriptions
 * fixes `kind: "subscription"`.
 */
export interface GamingBase {
  path: string
  fixed: Partial<GamingQuery>
}

export type GamingQueryChange = Partial<{ [K in keyof GamingQuery]: GamingQuery[K] | undefined }>

const ORDER: (keyof GamingQuery)[] = ["platform", "category", "kind", "model", "framework", "price", "sort", "q"]

/**
 * URL for the current browse state with `change` applied.
 *
 * - Filters that no longer make sense are dropped (a category without its
 *   platform, a subscription type on one-time products).
 * - Changing a value the page fixes moves to /gaming/products, so a FiveM
 *   page never silently shows Minecraft products.
 * - Defaults and fixed values are left out of the query string.
 */
export function gamingHref(base: GamingBase, query: GamingQuery, change: GamingQueryChange = {}): string {
  const next: Partial<GamingQuery> = { ...query, ...change }
  if ("platform" in change && change.platform !== query.platform) next.category = undefined
  if ("kind" in change && change.kind === "one-time") next.model = undefined
  if (!next.platform) next.category = undefined

  const fixedKeys = Object.keys(base.fixed) as (keyof GamingQuery)[]
  const leavesFixed = fixedKeys.some((k) => k in change && change[k] !== base.fixed[k])
  const path = leavesFixed ? "/gaming/products" : base.path
  const fixed: Partial<GamingQuery> = leavesFixed ? {} : base.fixed

  const params = new URLSearchParams()
  for (const key of ORDER) {
    const value = next[key]
    if (value === undefined || value === "") continue
    if (key === "sort" && value === "featured") continue
    if (key in fixed && fixed[key] === value) continue
    params.set(key, String(value))
  }
  const qs = params.toString()
  return qs ? `${path}?${qs}` : path
}

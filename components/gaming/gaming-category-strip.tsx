"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { GAMING_CATEGORIES } from "@/lib/gaming/types"
import { cn } from "@/lib/utils"

/**
 * Horizontally scrolling category chips.
 *
 * The filter panel is the full control surface; this is the one-thumb version
 * of its most-used group, so a phone visitor can switch category without
 * opening a drawer. Links, not buttons, so each chip is a shareable URL and
 * the strip works with JavaScript off.
 */
export function GamingCategoryStrip({
  counts,
  className,
}: {
  counts: Record<string, number>
  className?: string
}) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const active = searchParams.get("category")

  function href(value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set("category", value)
    else params.delete("category")
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  const available = GAMING_CATEGORIES.filter((c) => (counts[c.id] ?? 0) > 0)
  if (available.length === 0) return null

  return (
    // The negative margins cancel the page container's own padding so chips
    // scroll to the screen edge; they must match it (px-4, sm:px-6) or the
    // strip pushes the page into horizontal scroll.
    <div
      className={cn(
        "-mx-4 overflow-x-auto px-4 sm:-mx-6 sm:px-6",
        "[scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      <div className="flex w-max items-center gap-2 pb-1">
        <Chip href={href(null)} active={!active} label="All" />
        {available.map((c) => (
          <Chip key={c.id} href={href(c.id)} active={active === c.id} label={c.label} count={counts[c.id]} />
        ))}
      </div>
    </div>
  )
}

function Chip({ href, active, label, count }: { href: string; active: boolean; label: string; count?: number }) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={cn(
        "flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-xs font-semibold transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border bg-card text-foreground hover:border-border-strong",
      )}
    >
      {label}
      {count !== undefined && (
        <span className={cn("font-mono text-[10px]", active ? "text-background/70" : "text-muted-foreground")}>{count}</span>
      )}
    </Link>
  )
}

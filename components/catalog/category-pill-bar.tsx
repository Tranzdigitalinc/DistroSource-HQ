"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"
import type { getCategories } from "@/lib/queries/catalog"

interface Props {
  categories: Awaited<ReturnType<typeof getCategories>>
}

export function CategoryPillBar({ categories }: Props) {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeCategory = searchParams.get("category")

  function buildHref(value: string | null) {
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set("category", value)
    else params.delete("category")
    params.delete("page")
    return `${pathname}?${params.toString()}`
  }

  const pill = (active: boolean) =>
    cn(
      "shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      active ? "border-foreground bg-foreground text-background" : "border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground",
    )

  return (
    <nav aria-label="Filter by category" className="-mx-4 mb-6 overflow-x-auto px-4 sm:-mx-6 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex gap-2 pb-1">
        <Link href={buildHref(null)} className={pill(!activeCategory)} aria-current={!activeCategory ? "page" : undefined}>
          All
        </Link>
        {/* Empty categories are not offered as filters — the active one stays so its pill can be cleared. */}
        {categories.filter((c) => c.productCount > 0 || c.slug === activeCategory).map((category) => (
          <Link
            key={category.slug}
            href={buildHref(category.slug)}
            className={pill(activeCategory === category.slug)}
            aria-current={activeCategory === category.slug ? "page" : undefined}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </nav>
  )
}

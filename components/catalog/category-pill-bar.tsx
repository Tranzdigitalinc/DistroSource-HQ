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
    return `${pathname}?${params.toString()}`
  }

  return (
    <div className="-mx-6 mb-8 flex gap-2 overflow-x-auto border-y border-border px-6 py-3 sm:-mx-8 sm:px-8">
      <Link
        href={buildHref(null)}
        className={cn(
          "shrink-0 whitespace-nowrap rounded-[3px] border px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.04em] transition-colors",
          !activeCategory
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border text-foreground/80 hover:border-primary/40",
        )}
      >
        All categories
      </Link>
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={buildHref(category.slug)}
          className={cn(
            "shrink-0 whitespace-nowrap rounded-[3px] border px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.04em] transition-colors",
            activeCategory === category.slug
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-foreground/80 hover:border-primary/40",
          )}
        >
          {category.name}
        </Link>
      ))}
    </div>
  )
}

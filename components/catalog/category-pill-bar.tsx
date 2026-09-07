"use client"

import Link from "next/link"
import { usePathname, useSearchParams } from "next/navigation"
import { pillClass } from "@/components/catalog/pill"
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
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  return (
    <nav aria-label="Filter by category" className="no-scrollbar -mx-5 overflow-x-auto px-5 sm:-mx-8 sm:px-8">
      <div className="flex gap-2 pb-1">
        <Link href={buildHref(null)} className={pillClass(!activeCategory)} aria-current={!activeCategory ? "page" : undefined}>
          All
        </Link>
        {categories.filter((c) => c.productCount > 0 || c.slug === activeCategory).map((category) => (
          <Link
            key={category.slug}
            href={buildHref(category.slug)}
            className={pillClass(activeCategory === category.slug)}
            aria-current={activeCategory === category.slug ? "page" : undefined}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </nav>
  )
}

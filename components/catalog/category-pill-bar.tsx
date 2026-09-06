"use client"

import Link from "next/link"
import { motion } from "motion/react"
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

  const visible = categories.filter((category) => category.productCount > 0 || category.slug === activeCategory)

  return (
    <nav aria-label="Filter by category" className="-mx-4 mb-8 overflow-x-auto px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      <div className="flex min-w-max items-center gap-1.5 pb-1">
        <CategoryLink href={buildHref(null)} active={!activeCategory} label="All products" />
        {visible.map((category) => (
          <CategoryLink
            key={category.slug}
            href={buildHref(category.slug)}
            active={activeCategory === category.slug}
            label={category.name}
            count={category.productCount}
          />
        ))}
      </div>
    </nav>
  )
}

function CategoryLink({ href, active, label, count }: { href: string; active: boolean; label: string; count?: number }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative inline-flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active ? "text-background" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
      )}
    >
      {active && <motion.span layoutId="catalog-category-active" className="absolute inset-0 -z-10 rounded-full bg-foreground" transition={{ type: "spring", stiffness: 470, damping: 36 }} />}
      <span>{label}</span>
      {count !== undefined && <span className={cn("font-mono text-[9px]", active ? "text-background/55" : "text-muted-foreground/55")}>{count}</span>}
    </Link>
  )
}

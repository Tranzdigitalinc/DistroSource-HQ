"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { getCategoryIcon } from "@/lib/category-icons"
import type { getCategories } from "@/lib/queries/catalog"

const MotionLink = motion.create(Link)

export function QuickCategoryNav({
  categories,
}: {
  categories: Awaited<ReturnType<typeof getCategories>>
}) {
  if (categories.length === 0) return null

  return (
    <nav aria-label="Quick category links" className="border-b border-border bg-card/40">
      <div className="mx-auto max-w-7xl px-4 sm:px-8">
        <div className="flex gap-px overflow-x-auto py-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.slug)
            return (
              <MotionLink
                key={category.slug}
                href={`/categories/${category.slug}`}
                whileTap={{ scale: 0.96 }}
                className="flex shrink-0 items-center gap-2 border-x border-transparent px-3.5 py-3 font-mono text-xs font-semibold uppercase tracking-[0.02em] text-muted-foreground transition-colors hover:border-border hover:bg-secondary hover:text-foreground"
              >
                <Icon aria-hidden="true" className="size-4 text-primary" />
                {category.name}
              </MotionLink>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

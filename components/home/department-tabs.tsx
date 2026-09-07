"use client"

import Link from "next/link"
import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { ProductCard, type ProductCardData } from "@/components/product/product-card"
import { PageHeader, SectionLink } from "@/components/page-header"
import { EASE_OUT } from "@/components/motion/reveal"
import { cn } from "@/lib/utils"

export interface DepartmentTab {
  slug: string
  name: string
  description: string
  items: ProductCardData[]
}

/**
 * One section, several departments: a segmented switcher swaps the grid
 * without a page load, so the home page shows breadth without stacking
 * three identical rails.
 */
export function DepartmentTabs({ tabs }: { tabs: DepartmentTab[] }) {
  const available = tabs.filter((t) => t.items.length > 0)
  const [activeSlug, setActiveSlug] = useState(available[0]?.slug)
  const active = available.find((t) => t.slug === activeSlug) ?? available[0]
  if (!active) return null

  return (
    <section className="border-t border-border bg-secondary/40">
      <div className="container-x py-16 sm:py-20">
        <PageHeader
          size="section"
          eyebrow="Shop by department"
          title="Start with what you need to do"
          description={active.description}
          action={<SectionLink href={`/categories/${active.slug}`}>All {active.name}</SectionLink>}
        />

        <div role="tablist" aria-label="Departments" className="no-scrollbar -mx-5 mt-8 flex gap-1.5 overflow-x-auto px-5 sm:mx-0 sm:px-0">
          {available.map((tab) => {
            const selected = tab.slug === active.slug
            return (
              <button
                key={tab.slug}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActiveSlug(tab.slug)}
                className={cn(
                  "relative shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {selected && (
                  <motion.span layoutId="dept-tab" className="absolute inset-0 rounded-full bg-foreground" transition={{ type: "spring", stiffness: 420, damping: 36 }} aria-hidden="true" />
                )}
                <span className="relative">{tab.name}</span>
              </button>
            )
          })}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={active.slug}
            role="tabpanel"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.28, ease: EASE_OUT }}
            className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
          >
            {active.items.slice(0, 8).map((item) => (
              <ProductCard key={item.product.id} item={item} />
            ))}
          </motion.div>
        </AnimatePresence>

        <p className="mt-8 text-center text-sm text-muted-foreground sm:hidden">
          <Link href={`/categories/${active.slug}`} className="font-semibold text-foreground underline-offset-4 hover:underline">
            See all {active.name} →
          </Link>
        </p>
      </div>
    </section>
  )
}

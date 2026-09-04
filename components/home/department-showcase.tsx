"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowRight, ICON_SIZE } from "@/lib/storefront-icons"
import { ProductCard, type ProductCardData } from "@/components/product/product-card"
import { HomeSection } from "@/components/home/home-section"
import { cn } from "@/lib/utils"

export interface DepartmentTab {
  slug: string
  name: string
  items: ProductCardData[]
}

/**
 * One section that covers what used to be three consecutive, identical
 * product rails (Business, Web, Design). The rails made the homepage read as
 * an endless scroll of the same component; a tab strip shows the same
 * merchandising in a third of the height and lets someone compare
 * departments without scrolling past two of them.
 *
 * All products are already fetched by the page, so switching tabs is instant
 * and costs no request.
 */
export function DepartmentShowcase({ departments }: { departments: DepartmentTab[] }) {
  const usable = departments.filter((d) => d.items.length > 0)
  const [active, setActive] = useState(usable[0]?.slug ?? "")
  if (usable.length === 0) return null

  const current = usable.find((d) => d.slug === active) ?? usable[0]

  return (
    <HomeSection
      eyebrow="Browse the catalog"
      title="Popular in each department"
      action={{ label: `All ${current.name}`, href: `/categories/${current.slug}` }}
    >
      <div
        role="tablist"
        aria-label="Departments"
        className="-mx-4 mb-6 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {usable.map((d) => {
          const selected = d.slug === current.slug
          return (
            <button
              key={d.slug}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={`dept-panel-${d.slug}`}
              id={`dept-tab-${d.slug}`}
              onClick={() => setActive(d.slug)}
              className={cn(
                "shrink-0 whitespace-nowrap rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                selected
                  ? "border-foreground bg-foreground text-background"
                  : "border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground",
              )}
            >
              {d.name}
            </button>
          )
        })}
      </div>

      <div id={`dept-panel-${current.slug}`} role="tabpanel" aria-labelledby={`dept-tab-${current.slug}`}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {current.items.slice(0, 5).map((item) => (
            <ProductCard key={item.product.id} item={item} />
          ))}
        </div>
        <Link
          href={`/categories/${current.slug}`}
          className="mt-6 flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card py-3 text-sm font-semibold text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:hidden"
        >
          All {current.name}
          <ArrowRight size={ICON_SIZE.sm} aria-hidden="true" />
        </Link>
      </div>
    </HomeSection>
  )
}

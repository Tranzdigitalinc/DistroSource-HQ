"use client"

import Link from "next/link"
import { getCategoryIcon } from "@/lib/category-icons"
import { Gift, Package, Sparkles } from "@/lib/storefront-icons"

interface Subcategory {
  id: number
  slug: string
  name: string
  description: string | null
  icon: string | null
  productCount: number
}
interface Department extends Subcategory {
  subcategories: Subcategory[]
}

const MAX_SUBCATEGORIES_SHOWN = 5

export function MegaMenu({ departments, onNavigate }: { departments: Department[]; onNavigate?: () => void }) {
  const subcategoryCount = departments.reduce((sum, department) => sum + department.subcategories.length, 0)

  return (
    <div>
      <div className="flex items-center justify-between border-b border-border px-5 py-2.5">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Catalog index
        </span>
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {departments.length} departments · {subcategoryCount} categories
        </span>
      </div>

      <div className="grid grid-cols-4 gap-x-6 gap-y-6 px-5 py-5">
        {departments.map((department) => {
          const DepartmentIcon = getCategoryIcon(department.slug)
          const shown = department.subcategories.slice(0, MAX_SUBCATEGORIES_SHOWN)
          const remaining = department.subcategories.length - shown.length

          return (
            <div key={department.id} className="flex flex-col gap-2">
              <Link
                href={`/categories/${department.slug}`}
                onClick={onNavigate}
                className="group flex items-center gap-2 border-b border-border/60 pb-2"
              >
                <DepartmentIcon className="size-4 shrink-0 text-primary" aria-hidden="true" />
                <span className="truncate text-xs font-semibold uppercase tracking-[0.04em] text-foreground transition-colors group-hover:text-primary">
                  {department.name}
                </span>
              </Link>
              <ul className="flex flex-col gap-1.5">
                {shown.map((subcategory) => (
                  <li key={subcategory.id}>
                    <Link
                      href={`/categories/${subcategory.slug}`}
                      onClick={onNavigate}
                      className="block truncate text-[13px] text-muted-foreground transition-colors hover:text-primary"
                    >
                      {subcategory.name}
                    </Link>
                  </li>
                ))}
              </ul>
              {remaining > 0 && (
                <Link
                  href={`/categories/${department.slug}`}
                  onClick={onNavigate}
                  className="text-[11px] font-medium text-primary/80 transition-colors hover:text-primary"
                >
                  +{remaining} more
                </Link>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border bg-secondary/40 px-5 py-3">
        <Link
          href="/products?free=true"
          onClick={onNavigate}
          className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-[11px] font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <Gift className="size-3.5" aria-hidden="true" />
          Free resources
        </Link>
        <Link
          href="/products?bundle=true"
          onClick={onNavigate}
          className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-[11px] font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <Package className="size-3.5" aria-hidden="true" />
          Bundles
        </Link>
        <Link
          href="/products?sort=newest"
          onClick={onNavigate}
          className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-[11px] font-semibold text-foreground transition-colors hover:border-primary/40 hover:text-primary"
        >
          <Sparkles className="size-3.5" aria-hidden="true" />
          New arrivals
        </Link>
        <Link
          href="/categories"
          onClick={onNavigate}
          className="ml-auto flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.04em] text-primary transition-colors hover:underline"
        >
          View full catalog
          <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
    </div>
  )
}

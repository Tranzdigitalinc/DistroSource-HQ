"use client"

import Link from "next/link"
import { getCategoryIcon } from "@/lib/category-icons"
import { ArrowRight, Sparkles, Tag, ICON_SIZE } from "@/lib/storefront-icons"
import { cn } from "@/lib/utils"

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

const MAX_SUBCATEGORIES_SHOWN = 6

// Only listings that currently return products.
const SHORTCUTS = [
  { href: "/deals", label: "Deals", icon: Tag },
  { href: "/products?sort=newest", label: "New arrivals", icon: Sparkles },
]

/**
 * Departments panel. One column per department (max four across), each with
 * icon, name, product count and its top subcategories. Every row is a real
 * link; nothing here is promotional.
 */
export function MegaMenu({ departments, onNavigate }: { departments: Department[]; onNavigate?: () => void }) {
  const columns = Math.min(4, Math.max(2, departments.length))

  return (
    <div>
      <div
        className={cn("grid gap-x-6 gap-y-6 px-6 py-5", columns === 2 && "grid-cols-2", columns === 3 && "grid-cols-3", columns === 4 && "grid-cols-4")}
      >
        {departments.map((department) => {
          const DepartmentIcon = getCategoryIcon(department.slug)
          const shown = department.subcategories.slice(0, MAX_SUBCATEGORIES_SHOWN)
          const remaining = department.subcategories.length - shown.length

          return (
            <div key={department.id} className="flex min-w-0 flex-col">
              <Link
                href={`/categories/${department.slug}`}
                onClick={onNavigate}
                className="group -m-1.5 flex items-center gap-2.5 rounded-md p-1.5 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-foreground group-hover:bg-background">
                  <DepartmentIcon className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-foreground">{department.name}</span>
                  <span className="block text-[11px] text-muted-foreground">
                    {department.productCount} {department.productCount === 1 ? "product" : "products"}
                  </span>
                </span>
              </Link>

              <ul className="mt-3 flex flex-col">
                {shown.map((subcategory) => (
                  <li key={subcategory.id}>
                    <Link
                      href={`/categories/${subcategory.slug}`}
                      onClick={onNavigate}
                      className="flex items-center justify-between gap-2 rounded-md px-1.5 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="truncate">{subcategory.name}</span>
                      <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground/70">{subcategory.productCount}</span>
                    </Link>
                  </li>
                ))}
                {remaining > 0 && (
                  <li>
                    <Link
                      href={`/categories/${department.slug}`}
                      onClick={onNavigate}
                      className="flex items-center gap-1 rounded-md px-1.5 py-1.5 text-[13px] font-medium text-foreground hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      All {department.name}
                      <ArrowRight size={12} aria-hidden="true" />
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-border bg-secondary/40 px-6 py-3">
        {SHORTCUTS.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            onClick={onNavigate}
            className="flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-border-strong focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icon size={14} aria-hidden="true" />
            {label}
          </Link>
        ))}
        <Link
          href="/categories"
          onClick={onNavigate}
          className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          All departments
          <ArrowRight size={ICON_SIZE.sm} aria-hidden="true" />
        </Link>
      </div>
    </div>
  )
}

"use client"

import Link from "next/link"
import { getCategoryIcon } from "@/lib/category-icons"
import { ArrowRight, GameController, Sparkles, Tag, ICON_SIZE } from "@/lib/storefront-icons"
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

/**
 * Departments panel: one column per department with its top categories,
 * and a navy Gaming tile on the right because Gaming is the one department
 * with its own storefront. Every row is a real link with a real count.
 */
export function MegaMenu({ departments, onNavigate }: { departments: Department[]; onNavigate?: () => void }) {
  const shown = departments.slice(0, 4)

  return (
    <div className="grid grid-cols-[minmax(0,1fr)_14rem]">
      <div className={cn("grid gap-x-6 gap-y-6 px-7 py-6", shown.length <= 2 ? "grid-cols-2" : shown.length === 3 ? "grid-cols-3" : "grid-cols-4")}>
        {shown.map((department) => {
          const DepartmentIcon = getCategoryIcon(department.slug)
          const subs = department.subcategories.slice(0, MAX_SUBCATEGORIES_SHOWN)
          const remaining = department.subcategories.length - subs.length

          return (
            <div key={department.id} className="flex min-w-0 flex-col">
              <Link
                href={`/categories/${department.slug}`}
                onClick={onNavigate}
                className="group -mx-2 flex items-center gap-2.5 rounded-lg px-2 py-1.5 transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <DepartmentIcon className="size-4" aria-hidden="true" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-foreground">{department.name}</span>
                  <span className="block font-mono text-[10.5px] text-muted-foreground">{department.productCount} products</span>
                </span>
              </Link>

              <ul className="mt-2.5 flex flex-col">
                {subs.map((subcategory) => (
                  <li key={subcategory.id}>
                    <Link
                      href={`/categories/${subcategory.slug}`}
                      onClick={onNavigate}
                      className="-mx-2 flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-[13px] text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <span className="truncate">{subcategory.name}</span>
                      <span className="shrink-0 font-mono text-[10px] tabular-nums text-muted-foreground/60">{subcategory.productCount}</span>
                    </Link>
                  </li>
                ))}
                {remaining > 0 && (
                  <li>
                    <Link
                      href={`/categories/${department.slug}`}
                      onClick={onNavigate}
                      className="-mx-2 mt-0.5 flex items-center gap-1 rounded-md px-2 py-1.5 text-[13px] font-medium text-foreground hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

      <div className="flex flex-col gap-3 border-l border-border bg-secondary/40 p-4">
        <Link
          href="/gaming"
          onClick={onNavigate}
          className="group relative flex flex-1 flex-col justify-between overflow-hidden rounded-xl bg-navy p-4 text-navy-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-10 -right-6 select-none font-display text-[9rem] font-black leading-none text-navy-foreground/[0.06] transition-transform duration-500 group-hover:-translate-y-2"
          >
            G
          </span>
          <span className="flex size-9 items-center justify-center rounded-lg bg-navy-foreground/10 text-primary">
            <GameController size={ICON_SIZE.base} aria-hidden="true" />
          </span>
          <span className="relative mt-8">
            <span className="block font-display text-lg font-bold leading-tight">DistroSource Gaming</span>
            <span className="mt-1 block text-xs leading-relaxed text-navy-foreground/70">FiveM, Minecraft and game-server resources, sold directly.</span>
            <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-primary">
              Explore
              <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </span>
          </span>
        </Link>
        <div className="flex flex-col gap-1">
          {[
            { href: "/products?sort=newest", label: "New arrivals", icon: Sparkles },
            { href: "/deals", label: "Deals", icon: Tag },
          ].map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className="flex items-center gap-2 rounded-lg px-2 py-2 text-[13px] font-medium text-foreground transition-colors hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Icon size={ICON_SIZE.sm} className="text-muted-foreground" aria-hidden="true" />
              {label}
            </Link>
          ))}
          <Link
            href="/categories"
            onClick={onNavigate}
            className="flex items-center gap-1 px-2 py-2 text-[13px] font-semibold text-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            All departments
            <ArrowRight size={ICON_SIZE.sm} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  )
}

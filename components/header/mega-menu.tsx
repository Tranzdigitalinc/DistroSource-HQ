"use client"

import Link from "next/link"
import { getCategoryIcon } from "@/lib/category-icons"

interface Category {
  id: number
  slug: string
  name: string
  description: string | null
}

export function MegaMenu({ categories }: { categories: Category[] }) {
  return (
    <div>
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          Catalog index
        </span>
        <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {String(categories.length).padStart(2, "0")} categories
        </span>
      </div>
      <ul className="grid grid-cols-2 divide-x divide-border">
        {[0, 1].map((col) => (
          <li key={col} className="divide-y divide-border">
            {categories
              .filter((_, i) => i % 2 === col)
              .map((category) => {
                const Icon = getCategoryIcon(category.slug)
                const index = categories.findIndex((c) => c.id === category.id) + 1
                return (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="group flex items-center gap-3 px-4 py-3 text-sm transition-colors hover:bg-secondary"
                  >
                    <span className="font-mono text-[10px] font-semibold text-muted-foreground/70">
                      {String(index).padStart(2, "0")}
                    </span>
                    <Icon className="size-4 shrink-0 text-foreground/60 transition-colors group-hover:text-primary" />
                    <span className="font-medium text-foreground">{category.name}</span>
                  </Link>
                )
              })}
          </li>
        ))}
      </ul>
      <Link
        href="/categories"
        className="flex items-center justify-between border-t border-border bg-secondary/50 px-4 py-3 text-xs font-semibold uppercase tracking-[0.04em] text-primary transition-colors hover:bg-secondary"
      >
        View full catalog
        <span aria-hidden="true">&rarr;</span>
      </Link>
    </div>
  )
}

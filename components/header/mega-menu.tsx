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
    <div className="p-4">
      <ul className="grid grid-cols-2 gap-1">
        {categories.map((category) => {
          const Icon = getCategoryIcon(category.slug)
          return (
            <li key={category.id}>
              <Link
                href={`/categories/${category.slug}`}
                className="flex items-start gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-secondary"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                  <Icon className="size-4.5" />
                </span>
                <span className="flex flex-col">
                  <span className="font-medium text-foreground">{category.name}</span>
                  {category.description && (
                    <span className="line-clamp-1 text-xs text-muted-foreground">{category.description}</span>
                  )}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
      <div className="mt-2 flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-4 py-3">
        <p className="text-xs text-muted-foreground">Explore the full catalog across every category</p>
        <Link href="/categories" className="text-xs font-semibold text-primary hover:underline">
          View all categories
        </Link>
      </div>
    </div>
  )
}

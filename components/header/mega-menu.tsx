"use client"

import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { getCategoryIcon } from "@/lib/category-icons"
import { cn } from "@/lib/utils"

interface Category {
  id: number
  slug: string
  name: string
  description: string | null
  iconName: string
}

interface Brand {
  id: number
  slug: string
  name: string
  categoryId: number
  isFeatured: boolean
  logoUrl?: string | null
}

export function MegaMenu({ categories, brands }: { categories: Category[]; brands: Brand[] }) {
  const [activeCategory, setActiveCategory] = useState<Category>(categories[0])

  const brandsForActive = brands.filter((b) => b.categoryId === activeCategory.id).slice(0, 10)

  return (
    <div className="grid grid-cols-[240px_1fr]">
      <div className="border-r border-border/60 p-2">
        {categories.map((category) => {
          const Icon = getCategoryIcon(category.name)
          const isActive = category.id === activeCategory.id
          return (
            <button
              key={category.id}
              type="button"
              onMouseEnter={() => setActiveCategory(category)}
              onFocus={() => setActiveCategory(category)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                isActive ? "bg-secondary text-foreground" : "text-foreground/70 hover:bg-secondary/60",
              )}
            >
              <Icon className="size-4 shrink-0" />
              <span className="flex-1 font-medium">{category.name}</span>
            </button>
          )
        })}
      </div>
      <div className="p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-display text-sm font-semibold text-foreground">Popular in {activeCategory.name}</h3>
          <Link
            href={`/categories/${activeCategory.slug}`}
            className="text-xs font-medium text-primary hover:underline"
          >
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-1.5">
          {brandsForActive.map((brand) => (
            <Link
              key={brand.id}
              href={`/brands/${brand.slug}`}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-foreground/80 transition-colors hover:bg-secondary hover:text-foreground"
            >
              {brand.logoUrl ? (
                <span className="flex size-6 shrink-0 items-center justify-center overflow-hidden rounded-md bg-card ring-1 ring-border/60">
                  <Image src={brand.logoUrl} alt="" width={20} height={20} className="size-4 object-contain" />
                </span>
              ) : null}
              {brand.name}
            </Link>
          ))}
        </div>
        {activeCategory.description && (
          <p className="mt-4 text-xs leading-relaxed text-muted-foreground">{activeCategory.description}</p>
        )}
      </div>
    </div>
  )
}

"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ArrowUpRight } from "@/lib/storefront-icons"
import { getCategoryIcon } from "@/lib/category-icons"
import { RevealGroup, RevealItem } from "@/components/motion/reveal"
import { cn } from "@/lib/utils"
import type { getCategoryTree } from "@/lib/queries/catalog"

const MotionLink = motion.create(Link)

export function CategoryGrid({ categories }: { categories: Awaited<ReturnType<typeof getCategoryTree>> }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
      <div className="mb-8 flex items-end justify-between border-b border-border pb-6">
        <div>
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">Browse the catalog</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">Top categories</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">Every department in the catalog, one click away</p>
        </div>
        <Link
          href="/categories"
          className="hidden items-center gap-1 font-mono text-xs font-semibold uppercase tracking-[0.04em] text-primary hover:underline sm:flex"
        >
          All categories
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
      <RevealGroup className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 lg:gap-4" stagger={0.06}>
        {categories.map((category, index) => {
          const Icon = getCategoryIcon(category.slug)
          const featured = index === 0
          const initial = category.name.trim().charAt(0).toUpperCase()
          return (
            <RevealItem
              key={category.slug}
              className={cn(featured && "col-span-2 sm:col-span-1 lg:col-span-2 lg:row-span-2")}
            >
              <MotionLink
                href={`/categories/${category.slug}`}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className={cn(
                  "group relative flex h-full flex-col justify-between overflow-hidden rounded-lg border border-border bg-navy text-navy-foreground transition-[border-color,box-shadow] duration-200 hover:border-primary/50 hover:shadow-[var(--shadow-e2)]",
                  featured ? "min-h-64 p-6 lg:min-h-full lg:p-8" : "aspect-[4/3] p-5",
                )}
              >
                {/* Halftone dot grain — print-poster texture, not decoration */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 opacity-[0.06]"
                  style={{
                    backgroundImage: "radial-gradient(var(--color-navy-foreground) 1px, transparent 1px)",
                    backgroundSize: "9px 9px",
                  }}
                />

                {/* Oversized outlined initial — the one signature graphic per card */}
                <span
                  aria-hidden="true"
                  className={cn(
                    "pointer-events-none absolute -bottom-6 -right-3 select-none font-display font-bold leading-none transition-transform duration-500 group-hover:-translate-y-1.5",
                    featured ? "text-[15rem] sm:text-[18rem]" : "text-[7.5rem] sm:text-[8.5rem]",
                  )}
                  style={{
                    color: "transparent",
                    WebkitTextStroke: "1.5px color-mix(in oklch, var(--color-navy-foreground) 35%, transparent)",
                  }}
                >
                  {initial}
                </span>

                <div className="relative flex items-start justify-between">
                  <span className="flex size-10 items-center justify-center rounded-[4px] border border-navy-foreground/15 bg-navy-foreground/5 text-primary transition-colors group-hover:border-primary/60 group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon aria-hidden="true" className={featured ? "size-6" : "size-5"} />
                  </span>
                  <span className="font-mono text-[10px] font-semibold text-navy-foreground/40">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <span className="relative flex items-end justify-between gap-3">
                  <span className="flex flex-col gap-1.5">
                    <span
                      className={cn(
                        "font-display font-bold text-balance leading-[1.1]",
                        featured ? "text-2xl sm:text-3xl" : "text-base sm:text-lg",
                      )}
                    >
                      {category.name}
                    </span>
                    <span className="inline-flex items-center gap-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.02em] text-primary">
                      <span className="size-1 rounded-full bg-primary" />
                      {category.productCount} {category.productCount === 1 ? "product" : "products"}
                    </span>
                  </span>
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-navy-foreground/15 text-navy-foreground/70 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:border-primary group-hover:text-primary">
                    <ArrowUpRight aria-hidden="true" className="size-4" />
                  </span>
                </span>
              </MotionLink>
            </RevealItem>
          )
        })}
      </RevealGroup>
    </section>
  )
}

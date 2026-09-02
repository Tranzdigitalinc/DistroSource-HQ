"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ArrowUpRight } from "lucide-react"
import { getCategoryVisual } from "@/lib/category-visuals"
import { RevealGroup, RevealItem } from "@/components/motion/reveal"
import type { getCategories } from "@/lib/queries/catalog"

const MotionLink = motion.create(Link)

export function CategoryGrid({ categories }: { categories: Awaited<ReturnType<typeof getCategories>> }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">Shop by category</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">Find the right digital product for every project</p>
        </div>
        <Link
          href="/categories"
          className="hidden items-center gap-1 text-sm font-medium text-primary hover:underline sm:flex"
        >
          All categories
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>
      <RevealGroup className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" stagger={0.06}>
        {categories.map((category) => {
          const visual = getCategoryVisual(category.slug)
          const Icon = visual.icon
          return (
            <RevealItem key={category.slug}>
              <MotionLink
                href={`/categories/${category.slug}`}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className={`group relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm transition-[border-color,box-shadow] ${visual.ring} hover:shadow-lg`}
              >
                <div
                  className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${visual.glow} via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
                />

                <div className="relative flex items-start justify-between">
                  <div className={`flex size-12 items-center justify-center rounded-xl text-white shadow-lg ${visual.chip}`}>
                    <Icon aria-hidden="true" className="size-6" />
                  </div>
                </div>

                <span className="relative flex items-end justify-between gap-3">
                  <span className="flex flex-col gap-1">
                    <span className="font-display text-base font-semibold text-foreground text-balance sm:text-lg">
                      {category.name}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {category.productCount} {category.productCount === 1 ? "product" : "products"}
                    </span>
                  </span>
                  <span
                    className={`flex size-8 shrink-0 items-center justify-center rounded-full text-muted-foreground/60 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${visual.accentText}`}
                  >
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

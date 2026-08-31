"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ArrowUpRight } from "lucide-react"
import { getCategoryIcon } from "@/lib/category-icons"
import { RevealGroup, RevealItem } from "@/components/motion/reveal"
import { getCategoryImage } from "@/lib/category-icons"
import type { getCategories } from "@/lib/queries/catalog"

const MotionLink = motion.create(Link)

export function CategoryGrid({ categories }: { categories: Awaited<ReturnType<typeof getCategories>> }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">Shop by category</h2>
          <p className="mt-1.5 text-sm text-muted-foreground">Find the right code for gaming, streaming, and more</p>
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
        {categories.map((category) => (
          <RevealItem key={category.slug}>
            <MotionLink
              href={`/categories/${category.slug}`}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.97 }}
              transition={{ type: "spring", stiffness: 400, damping: 28 }}
              className="group relative flex aspect-[4/3] flex-col justify-between overflow-hidden rounded-2xl border border-primary/20 bg-card p-5 shadow-[0_12px_35px_-18px_hsl(var(--primary)/0.7)] transition-colors hover:border-primary/60"
            >
              <div className="pointer-events-none absolute -right-10 -top-10 size-32 rounded-full bg-primary/10 blur-2xl transition-colors group-hover:bg-accent/20" />
              <div className="relative flex size-12 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 text-primary shadow-[0_0_22px_hsl(var(--primary)/0.2)]">
                {(() => { const Icon = getCategoryIcon(category.iconName); return <Icon aria-hidden="true" /> })()}
              </div>
              <span className="relative flex items-end justify-between gap-3">
                <span className="flex flex-col gap-1">
                  <span className="font-display text-base font-semibold text-foreground text-balance sm:text-lg">{category.name}</span>
                  <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{category.productCount} {category.productCount === 1 ? "product" : "products"}</span>
                </span>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full border border-primary/30 text-primary transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                  <ArrowUpRight aria-hidden="true" />
                </span>
              </span>
            </MotionLink>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  )
}

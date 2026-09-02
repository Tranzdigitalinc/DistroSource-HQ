"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "motion/react"
import { ArrowUpRight } from "lucide-react"
import { getCategoryIcon } from "@/lib/category-icons"
import { RevealGroup, RevealItem } from "@/components/motion/reveal"
import { cn } from "@/lib/utils"
import type { getCategories } from "@/lib/queries/catalog"

const MotionLink = motion.create(Link)

export function CategoryGrid({ categories }: { categories: Awaited<ReturnType<typeof getCategories>> }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-blue">Browse the catalog</p>
          <h2 className="mt-2 font-display text-3xl font-medium tracking-tight sm:text-4xl">Shop by category</h2>
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
        {categories.map((category, index) => {
          const Icon = getCategoryIcon(category.slug)
          const hasImage = Boolean(category.heroImageUrl)
          // First tile spans larger on desktop for a bento rhythm — only when it has real imagery.
          const featured = index === 0 && hasImage
          return (
            <RevealItem
              key={category.slug}
              className={cn(featured && "col-span-2 sm:col-span-1 lg:col-span-2 lg:row-span-2")}
            >
              <MotionLink
                href={`/categories/${category.slug}`}
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className={cn(
                  "group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-border shadow-sm transition-[border-color,box-shadow] hover:border-primary/40 hover:shadow-lg",
                  hasImage ? "text-white" : "bg-card p-5",
                  featured ? "min-h-56 lg:min-h-full" : "aspect-[4/3]",
                )}
              >
                {hasImage && (
                  <>
                    <Image
                      src={category.heroImageUrl || "/placeholder.svg"}
                      alt=""
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes={featured ? "(max-width: 1024px) 100vw, 520px" : "(max-width: 640px) 50vw, 260px"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/30 to-navy/5" />
                  </>
                )}

                <div className={cn("relative flex items-start justify-between", hasImage && "p-5")}>
                  <span
                    className={cn(
                      "flex size-12 items-center justify-center rounded-xl transition-colors",
                      hasImage
                        ? "bg-white/15 text-white backdrop-blur-sm group-hover:bg-white/25"
                        : "bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground",
                    )}
                  >
                    <Icon aria-hidden="true" className={featured ? "size-7" : "size-6"} />
                  </span>
                </div>

                <span className={cn("relative flex items-end justify-between gap-3", hasImage && "p-5")}>
                  <span className="flex flex-col gap-1">
                    <span
                      className={cn(
                        "font-display font-semibold text-balance",
                        featured ? "text-xl sm:text-2xl" : "text-base sm:text-lg",
                        hasImage ? "text-white" : "text-foreground",
                      )}
                    >
                      {category.name}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-medium",
                        hasImage ? "text-white/75" : "text-muted-foreground",
                      )}
                    >
                      {category.productCount} {category.productCount === 1 ? "product" : "products"}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center rounded-full transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
                      hasImage
                        ? "bg-white/15 text-white backdrop-blur-sm"
                        : "text-muted-foreground/60 group-hover:text-primary",
                    )}
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

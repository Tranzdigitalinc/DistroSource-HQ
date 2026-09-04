"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "motion/react"
import { ArrowUpRight } from "@/lib/storefront-icons"
import { getCategoryIcon } from "@/lib/category-icons"
import { RevealGroup, RevealItem } from "@/components/motion/reveal"
import { cn } from "@/lib/utils"
import type { getCategoryTree } from "@/lib/queries/catalog"

const MotionLink = motion.create(Link)

export function CategoryGrid({ categories }: { categories: Awaited<ReturnType<typeof getCategoryTree>> }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
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
      <RevealGroup
        className="grid grid-cols-2 gap-px border border-border bg-border sm:grid-cols-3 lg:grid-cols-4"
        stagger={0.06}
      >
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
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                className={cn(
                  "group relative flex h-full flex-col justify-between bg-background transition-colors",
                  hasImage ? "text-navy-foreground" : "p-5 hover:bg-secondary/60",
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
                      "flex size-10 items-center justify-center rounded-[4px] transition-colors",
                      hasImage
                        ? "bg-navy-foreground/15 text-navy-foreground"
                        : "bg-secondary text-primary group-hover:bg-primary group-hover:text-primary-foreground",
                    )}
                  >
                    <Icon aria-hidden="true" className={featured ? "size-6" : "size-5"} />
                  </span>
                  <span
                    className={cn(
                      "font-mono text-[10px] font-semibold",
                      hasImage ? "text-navy-foreground/70" : "text-muted-foreground/60",
                    )}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>

                <span className={cn("relative flex items-end justify-between gap-3", hasImage && "p-5")}>
                  <span className="flex flex-col gap-1">
                    <span
                      className={cn(
                        "font-display font-bold text-balance",
                        featured ? "text-xl sm:text-2xl" : "text-base sm:text-lg",
                        hasImage ? "text-navy-foreground" : "text-foreground",
                      )}
                    >
                      {category.name}
                    </span>
                    <span
                      className={cn(
                        "font-mono text-[11px] font-medium uppercase tracking-[0.02em]",
                        hasImage ? "text-navy-foreground/75" : "text-muted-foreground",
                      )}
                    >
                      {category.productCount} {category.productCount === 1 ? "product" : "products"}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "flex size-8 shrink-0 items-center justify-center transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5",
                      hasImage ? "text-navy-foreground/80" : "text-muted-foreground/60 group-hover:text-primary",
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

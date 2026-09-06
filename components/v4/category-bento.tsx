"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight } from "@/lib/storefront-icons"
import { getCategoryIcon } from "@/lib/category-icons"
import type { getCategoryTree } from "@/lib/queries/catalog"

const EASE = [0.16, 1, 0.3, 1] as const

export function V4CategoryBento({ categories }: { categories: Awaited<ReturnType<typeof getCategoryTree>> }) {
  const visible = categories.filter((category) => category.productCount > 0).slice(0, 6)
  if (!visible.length) return null

  return (
    <section className="py-16 sm:py-20 lg:py-28">
      <div className="mx-auto max-w-[1540px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-5 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-primary">Shop by department</p>
            <h2 className="mt-3 max-w-4xl font-display text-[clamp(2.2rem,5.2vw,5.2rem)] font-black leading-[0.92] tracking-[-0.06em]">
              Start with what you&apos;re building.
            </h2>
          </div>
          <Link href="/categories" className="group inline-flex h-12 items-center gap-3 rounded-full border border-border px-5 text-sm font-semibold transition-colors hover:bg-foreground hover:text-background">
            All departments
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="grid auto-rows-[210px] gap-3 sm:grid-cols-2 sm:auto-rows-[230px] lg:grid-cols-12 lg:auto-rows-[250px] lg:gap-4">
          {visible.map((category, index) => {
            const Icon = getCategoryIcon(category.slug)
            const classes = [
              "lg:col-span-7 lg:row-span-2",
              "lg:col-span-5",
              "lg:col-span-5",
              "lg:col-span-4",
              "lg:col-span-4",
              "lg:col-span-4",
            ][index] ?? "lg:col-span-4"

            return (
              <motion.div
                key={category.slug}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, delay: index * 0.045, ease: EASE }}
                className={classes}
              >
                <Link
                  href={`/categories/${category.slug}`}
                  className={`group relative flex h-full overflow-hidden rounded-[28px] border p-5 transition-[transform,box-shadow] duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_-35px_rgba(0,0,0,0.26)] sm:p-6 ${
                    index === 0
                      ? "border-transparent bg-foreground text-background"
                      : index === 1
                        ? "border-primary/15 bg-primary/[0.09] text-foreground"
                        : "border-border bg-secondary/45 text-foreground"
                  }`}
                >
                  <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                    <div className={`absolute -right-16 -top-16 size-56 rounded-full blur-3xl transition-transform duration-700 group-hover:scale-125 ${index === 0 ? "bg-primary/30" : "bg-primary/12"}`} />
                    <div className="absolute inset-0 opacity-[0.14] [background-image:radial-gradient(circle_at_center,currentColor_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom_left,black,transparent_65%)]" />
                  </div>

                  <div className="relative flex w-full flex-col justify-between">
                    <div className="flex items-start justify-between gap-4">
                      <span className={`flex size-12 items-center justify-center rounded-2xl border ${index === 0 ? "border-white/14 bg-white/8 text-primary" : "border-border bg-background/75 text-primary"}`}>
                        <Icon className="size-5" aria-hidden="true" />
                      </span>
                      <span className={`font-mono text-[9px] font-bold uppercase tracking-[0.1em] ${index === 0 ? "text-background/45" : "text-muted-foreground"}`}>{category.productCount} products</span>
                    </div>

                    <div>
                      <h3 className={`font-display font-black leading-[0.98] tracking-[-0.05em] ${index === 0 ? "max-w-[75%] text-4xl sm:text-5xl lg:text-6xl" : "text-2xl sm:text-3xl"}`}>
                        {category.name}
                      </h3>
                      {index === 0 && category.description && <p className="mt-4 max-w-xl text-sm leading-6 text-background/60">{category.description}</p>}
                      <div className="mt-5 flex items-center justify-between gap-4">
                        <div className="flex min-w-0 flex-wrap gap-x-3 gap-y-1">
                          {category.subcategories.slice(0, index === 0 ? 5 : 3).map((sub) => (
                            <span key={sub.slug} className={`text-[11px] ${index === 0 ? "text-background/55" : "text-muted-foreground"}`}>{sub.name}</span>
                          ))}
                        </div>
                        <span className={`flex size-10 shrink-0 items-center justify-center rounded-full transition-transform duration-300 group-hover:translate-x-1 ${index === 0 ? "bg-background text-foreground" : "bg-foreground text-background"}`}>
                          <ArrowRight size={14} />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

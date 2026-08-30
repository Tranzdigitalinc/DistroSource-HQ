"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "motion/react"
import { ArrowUpRight } from "lucide-react"
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
              className="group relative block aspect-[4/3] overflow-hidden rounded-xl"
            >
              <Image
                src={getCategoryImage(category.slug)}
                alt=""
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/5 transition-colors duration-300 group-hover:from-black/90" />
              <span className="absolute inset-x-0 bottom-0 flex items-center justify-between p-4">
                <span className="flex flex-col gap-0.5">
                  <span className="font-display text-base font-semibold text-white text-balance sm:text-lg">
                    {category.name}
                  </span>
                  <span className="text-[11px] font-medium text-white/60">
                    {category.productCount} {category.productCount === 1 ? "product" : "products"}
                  </span>
                </span>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-white/15 text-white ring-1 ring-white/30 transition-all duration-300 group-hover:bg-white/25 group-hover:ring-white/50">
                  <ArrowUpRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </span>
              </span>
            </MotionLink>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  )
}

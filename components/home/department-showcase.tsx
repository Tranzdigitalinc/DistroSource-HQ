"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "motion/react"
import { getCategoryIcon } from "@/lib/category-icons"
import { PageHeader, SectionLink } from "@/components/page-header"
import { RevealGroup, RevealItem } from "@/components/motion/reveal"
import { ArrowUpRight, GameController } from "@/lib/storefront-icons"
import { cn } from "@/lib/utils"

export interface DepartmentTile {
  slug: string
  name: string
  productCount: number
  images: string[]
}

const MotionLink = motion.create(Link)

/**
 * Departments as image-led tiles: each shows three real product covers
 * from the department, fanned, plus a duotone icon and live count. The
 * first department is the widest tile; Gaming closes the row on navy.
 */
export function DepartmentShowcase({ departments }: { departments: DepartmentTile[] }) {
  if (departments.length === 0) return null

  return (
    <section className="container-x py-16 sm:py-24">
      <PageHeader
        size="section"
        eyebrow="Departments"
        title="Every kind of digital work, under one roof"
        description="Six departments and a Gaming store. Each tile shows real products from that shelf."
        action={<SectionLink href="/categories">All departments</SectionLink>}
      />

      <RevealGroup className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
        {departments.map((d, i) => {
          const Icon = getCategoryIcon(d.slug)
          const wide = i === 0
          return (
            <RevealItem key={d.slug} className={cn("h-full", wide && "sm:col-span-2 lg:col-span-2")}>
              <MotionLink
                href={`/categories/${d.slug}`}
                whileHover="hover"
                initial="rest"
                animate="rest"
                className={cn(
                  "group relative flex h-full min-h-[17rem] flex-col justify-between overflow-hidden rounded-3xl border border-border bg-card p-6 transition-[border-color,box-shadow] hover:border-border-strong hover:shadow-[var(--shadow-e3)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  wide && "min-h-[20rem]",
                )}
              >
                <div className="relative z-10 flex items-start justify-between">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <span className="flex size-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:border-primary group-hover:text-primary">
                    <ArrowUpRight size={16} weight="bold" aria-hidden="true" />
                  </span>
                </div>

                {/* fanned covers */}
                <div aria-hidden className={cn("pointer-events-none absolute right-[-2%] top-[16%] aspect-[16/10]", wide ? "w-[46%] sm:top-[12%]" : "w-[58%]")}>
                  {d.images.slice(0, 3).map((src, k) => (
                    <motion.span
                      key={src}
                      variants={{ rest: { rotate: (k - 1) * 7, y: k * 8, x: k * 18 }, hover: { rotate: (k - 1) * 10, y: k * 4 - 8, x: k * 26 } }}
                      transition={{ type: "spring", stiffness: 220, damping: 22 }}
                      className="absolute inset-0 block origin-bottom-left overflow-hidden rounded-xl border border-border bg-secondary shadow-[var(--shadow-e3)]"
                      style={{ zIndex: 3 - k }}
                    >
                      <Image src={src} alt="" fill sizes="20rem" className="object-cover" />
                    </motion.span>
                  ))}
                </div>

                <div className="relative z-10 mt-24 max-w-[48%]">
                  <h3 className="text-title text-xl sm:text-2xl">{d.name}</h3>
                  <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.12em] text-muted-foreground">{d.productCount} products</p>
                </div>
              </MotionLink>
            </RevealItem>
          )
        })}

        <RevealItem className="h-full">
          <Link
            href="/gaming"
            className="grain group relative flex h-full min-h-[17rem] flex-col justify-between overflow-hidden rounded-3xl bg-navy p-6 text-navy-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <div aria-hidden className="mesh-blob animate-mesh-2 right-[-30%] top-[-30%] h-64 w-64 bg-primary/40" />
            <span className="relative flex size-11 items-center justify-center rounded-2xl bg-navy-foreground/10 text-primary">
              <GameController className="size-5" weight="duotone" aria-hidden="true" />
            </span>
            <div className="relative">
              <h3 className="text-title text-xl sm:text-2xl">DistroSource Gaming</h3>
              <p className="mt-1.5 text-sm text-navy-foreground/65">FiveM, Minecraft and game servers</p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                Enter the store
                <ArrowUpRight size={14} weight="bold" className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
              </span>
            </div>
          </Link>
        </RevealItem>
      </RevealGroup>
    </section>
  )
}

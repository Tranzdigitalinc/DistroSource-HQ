"use client"

import Link from "next/link"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { HeaderSearch } from "@/components/header/header-search"
import { NumberTicker } from "@/components/velora/number-ticker"
import { BorderBeam } from "@/components/velora/border-beam"
import { ArrowRight, Compass, Star } from "@/lib/storefront-icons"

interface HeroStats {
  productCount: number
  categoryCount: number
  reviewCount: number
  avgRating: number
}

const CATEGORY_LINE = ["Templates", "UI Kits", "Business Tools", "Graphics", "Code", "Fonts", "3D"]

const EASE = [0.16, 1, 0.3, 1] as const

const item = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
}

export function Hero({ stats }: { stats: HeroStats }) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-hero">
      {/* Fine grid texture — the catalog identity's graph-paper base */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.4] [mask-image:radial-gradient(120%_90%_at_50%_0%,black,transparent_72%)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.03, delayChildren: 0 }}
        className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 pt-16 pb-16 text-center sm:px-8 lg:pt-24 lg:pb-20"
      >
        <motion.h1
          variants={item}
          transition={{ duration: 0.2, ease: EASE }}
          className="font-display text-5xl font-black leading-[0.98] tracking-tight text-hero-foreground text-balance sm:text-6xl lg:text-[4.1rem]"
        >
          Everything digital.
          <br />
          One source.
        </motion.h1>

        <motion.p
          variants={item}
          transition={{ duration: 0.2, ease: EASE }}
          className="max-w-lg text-lg leading-relaxed text-muted-foreground text-pretty"
        >
          Premium digital products for business, design, development and everyday work.
        </motion.p>

        <motion.p
          variants={item}
          transition={{ duration: 0.2, ease: EASE }}
          className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/80"
        >
          {CATEGORY_LINE.map((label, i) => (
            <span key={label} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden="true" className="text-border">•</span>}
              {label}
            </span>
          ))}
        </motion.p>

        <motion.div variants={item} transition={{ duration: 0.2, ease: EASE }} className="relative z-20 w-full max-w-xl">
          <HeaderSearch size="lg" />
        </motion.div>

        <motion.div
          variants={item}
          transition={{ duration: 0.2, ease: EASE }}
          className="flex w-full flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/products"
            className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-[4px] bg-primary px-8 font-mono text-sm font-semibold uppercase tracking-[0.04em] text-primary-foreground shadow-lg shadow-primary/30 transition-[transform,box-shadow] duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/40 active:scale-[0.98]"
          >
            <BorderBeam size={48} duration={5} />
            <span className="relative z-10 inline-flex items-center gap-2">
              Explore Products
              <ArrowRight className="size-4" />
            </span>
            <span
              aria-hidden
              className="animate-shimmer absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.35)_50%,transparent_70%)] bg-[length:250%_100%]"
            />
          </Link>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            className="h-12 rounded-[4px] border-border-strong bg-transparent px-8 font-mono text-sm font-semibold uppercase tracking-[0.04em] text-foreground transition-colors hover:bg-secondary active:scale-[0.98]"
            render={<Link href="/categories" />}
          >
            <Compass className="size-4 text-primary" />
            Browse Categories
          </Button>
        </motion.div>

        <motion.div
          variants={item}
          transition={{ duration: 0.2, ease: EASE }}
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.05em] text-muted-foreground"
        >
          <span className="flex items-center gap-1">
            <NumberTicker value={stats.productCount} className="text-foreground" />+ products
          </span>
          <span className="text-border">/</span>
          <span className="flex items-center gap-1">
            <NumberTicker value={stats.categoryCount} className="text-foreground" /> categories
          </span>
          {stats.reviewCount > 0 && (
            <>
              <span className="text-border">/</span>
              <span className="flex items-center gap-1">
                {stats.avgRating.toFixed(1)}
                <Star className="size-3 fill-primary text-primary" />
                avg rating
              </span>
              <span className="text-border">/</span>
              <span className="flex items-center gap-1">
                <NumberTicker value={stats.reviewCount} className="text-foreground" />+ reviews
              </span>
            </>
          )}
        </motion.div>
      </motion.div>
    </section>
  )
}

"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { HeaderSearch } from "@/components/header/header-search"
import { ArrowRight, Download, Grid, ShieldCheck, ICON_SIZE } from "@/lib/storefront-icons"

interface HeroStats {
  productCount: number
  categoryCount: number
  reviewCount: number
  avgRating: number
}

/** Minimal shape needed to merchandise a real product in the hero collage. */
export interface HeroProduct {
  slug: string
  name: string
  imageUrl: string | null
}

const EASE = [0.16, 1, 0.3, 1] as const
const item = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

export function Hero({ stats, products = [] }: { stats: HeroStats; products?: HeroProduct[] }) {
  // Only real catalog products are shown. If there is nothing to merchandise,
  // the collage is omitted rather than filled with placeholder art.
  const collage = products.filter((p) => p.imageUrl).slice(0, 3)
  const hasCollage = collage.length === 3

  return (
    <section className="relative overflow-hidden border-b border-border bg-hero">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-40 [mask-image:radial-gradient(120%_90%_at_50%_0%,black,transparent_72%)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16 lg:py-24">
        <motion.div
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.05 }}
          className="flex flex-col items-start gap-6 text-left"
        >
          <motion.h1
            variants={item}
            transition={{ duration: 0.35, ease: EASE }}
            className="font-display text-4xl font-black leading-[1.02] tracking-tight text-hero-foreground text-balance sm:text-5xl lg:text-6xl"
          >
            Everything digital.
            <br />
            One source.
          </motion.h1>

          <motion.p
            variants={item}
            transition={{ duration: 0.35, ease: EASE }}
            className="max-w-xl text-base leading-relaxed text-muted-foreground text-pretty sm:text-lg"
          >
            Premium digital products for business, design, development and everyday work — delivered
            instantly, with clear licensing.
          </motion.p>

          <motion.div variants={item} transition={{ duration: 0.35, ease: EASE }} className="w-full max-w-xl">
            <HeaderSearch className="w-full" />
          </motion.div>

          <motion.div
            variants={item}
            transition={{ duration: 0.35, ease: EASE }}
            className="flex flex-wrap items-center gap-3"
          >
            <Button size="lg" render={<Link href="/products" />} nativeButton={false} className="h-11 font-semibold">
              Explore products
              <ArrowRight size={ICON_SIZE.base} aria-hidden="true" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              render={<Link href="/categories" />}
              nativeButton={false}
              className="h-11 bg-transparent font-semibold"
            >
              <Grid size={ICON_SIZE.base} aria-hidden="true" />
              Browse departments
            </Button>
          </motion.div>

          {/* Every figure here is read from the database. */}
          <motion.ul
            variants={item}
            transition={{ duration: 0.35, ease: EASE }}
            className="flex flex-wrap items-center gap-x-5 gap-y-2 pt-1 text-xs text-muted-foreground"
          >
            <li className="flex items-center gap-1.5">
              <Grid size={14} aria-hidden="true" />
              {stats.productCount.toLocaleString()} products in {stats.categoryCount} categories
            </li>
            <li className="flex items-center gap-1.5">
              <Download size={14} aria-hidden="true" />
              Instant download
            </li>
            <li className="flex items-center gap-1.5">
              <ShieldCheck size={14} aria-hidden="true" />
              Secure checkout
            </li>
          </motion.ul>
        </motion.div>

        {hasCollage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.1 }}
            className="hidden lg:block"
            aria-hidden="true"
          >
            {/* Real product previews as merchandising. Decorative here — each
                product is reachable through the rails below — so it is hidden
                from assistive tech to avoid duplicate announcements. */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 overflow-hidden rounded-lg border border-border bg-card shadow-[var(--shadow-e2)]">
                <div className="relative aspect-[16/10]">
                  <Image
                    src={collage[0].imageUrl!}
                    alt=""
                    fill
                    priority
                    sizes="(max-width: 1024px) 0px, 26rem"
                    className="object-cover"
                  />
                </div>
              </div>
              {collage.slice(1, 3).map((product) => (
                <div
                  key={product.slug}
                  className="overflow-hidden rounded-lg border border-border bg-card shadow-[var(--shadow-e1)]"
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={product.imageUrl!}
                      alt=""
                      fill
                      sizes="(max-width: 1024px) 0px, 13rem"
                      className="object-cover"
                    />
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}

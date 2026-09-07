"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { SearchTrigger } from "@/components/header/search-command"
import { EASE_OUT } from "@/components/motion/reveal"
import { ArrowRight, Download, ShieldCheck, ICON_SIZE } from "@/lib/storefront-icons"

interface HeroStats {
  productCount: number
  categoryCount: number
  reviewCount: number
  avgRating: number
}

/** Minimal shape needed to merchandise a real product in the hero shelf. */
export interface HeroProduct {
  slug: string
  name: string
  imageUrl: string | null
  categoryName?: string
}

const item = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
}

/**
 * Editorial hero: a heavy typographic statement on paper, one search pill
 * (the fastest way into a catalog this size), and a shelf of three real
 * product covers. Every number is read from the database.
 */
export function Hero({ stats, products = [] }: { stats: HeroStats; products?: HeroProduct[] }) {
  const shelf = products.filter((p) => p.imageUrl).slice(0, 3)

  return (
    <section className="relative overflow-hidden border-b border-border bg-hero">
      <div aria-hidden className="paper-grid pointer-events-none absolute inset-0 opacity-70 [mask-image:radial-gradient(90%_70%_at_30%_10%,black,transparent_75%)]" />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-[-10%] h-[36rem] w-[36rem] rounded-full opacity-60 blur-3xl"
        style={{ background: "radial-gradient(closest-side, var(--glow), transparent 70%)" }}
      />

      <div className="container-x relative grid items-center gap-12 py-14 sm:py-20 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16 lg:py-28">
        <motion.div initial="hidden" animate="visible" transition={{ staggerChildren: 0.06 }} className="flex flex-col items-start gap-7">
          <motion.p variants={item} transition={{ duration: 0.4, ease: EASE_OUT }} className="eyebrow">
            The department store for digital work
          </motion.p>

          <motion.h1
            variants={item}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            className="text-display text-[2.75rem] text-hero-foreground sm:text-6xl lg:text-[4.75rem]"
          >
            Everything digital.
            <br />
            <span className="text-primary">One source.</span>
          </motion.h1>

          <motion.p variants={item} transition={{ duration: 0.4, ease: EASE_OUT }} className="max-w-lg text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            Templates, fonts, systems, code and game-server resources — chosen for how they hold up in real work, delivered the moment you pay, with the licence stated up front.
          </motion.p>

          <motion.div variants={item} transition={{ duration: 0.4, ease: EASE_OUT }} className="w-full max-w-lg">
            <SearchTrigger size="lg" placeholder="Search templates, fonts, dashboards, gaming…" />
          </motion.div>

          <motion.div variants={item} transition={{ duration: 0.4, ease: EASE_OUT }} className="flex flex-wrap items-center gap-3">
            <Button size="lg" render={<Link href="/products" />} nativeButton={false} className="h-11 rounded-full px-5 font-semibold">
              Explore the catalog
              <ArrowRight size={ICON_SIZE.base} aria-hidden="true" />
            </Button>
            <Button size="lg" variant="outline" render={<Link href="/categories" />} nativeButton={false} className="h-11 rounded-full bg-transparent px-5 font-semibold">
              Browse departments
            </Button>
          </motion.div>

          <motion.ul variants={item} transition={{ duration: 0.4, ease: EASE_OUT }} className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            <li className="flex items-center gap-2">
              <span className="font-display text-base font-bold normal-case tracking-tight text-foreground">{stats.productCount.toLocaleString()}</span>
              products
            </li>
            <li className="flex items-center gap-2">
              <span className="font-display text-base font-bold normal-case tracking-tight text-foreground">{stats.categoryCount}</span>
              categories
            </li>
            <li className="flex items-center gap-1.5">
              <Download size={13} aria-hidden="true" className="text-primary" />
              Instant delivery
            </li>
            <li className="flex items-center gap-1.5">
              <ShieldCheck size={13} aria-hidden="true" className="text-primary" />
              Licence up front
            </li>
          </motion.ul>
        </motion.div>

        {shelf.length === 3 && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: EASE_OUT, delay: 0.15 }}
            className="relative hidden lg:block"
            aria-hidden="true"
          >
            {/* Three real covers on a shelf. Decorative here — every product
                is reachable below — so hidden from assistive tech. */}
            <div className="relative aspect-[5/4]">
              <ShelfCard product={shelf[1]} className="left-0 top-[8%] w-[46%] -rotate-3" delay={0.3} />
              <ShelfCard product={shelf[2]} className="right-0 top-0 w-[48%] rotate-2" delay={0.4} />
              <ShelfCard product={shelf[0]} className="left-[14%] top-[34%] w-[72%] shadow-[var(--shadow-e4)]" delay={0.2} priority caption />
              <div className="absolute inset-x-[6%] bottom-0 h-3 rounded-full bg-foreground/10 blur-xl" />
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}

function ShelfCard({ product, className, delay, priority = false, caption = false }: { product: HeroProduct; className: string; delay: number; priority?: boolean; caption?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, ease: EASE_OUT, delay }}
      className={`absolute overflow-hidden rounded-2xl border border-border bg-card shadow-[var(--shadow-e3)] ${className}`}
    >
      <div className="relative aspect-[16/10]">
        <Image src={product.imageUrl!} alt="" fill priority={priority} sizes="(max-width: 1024px) 0px, 30rem" className="object-cover" />
      </div>
      {caption && (
        <div className="flex items-center justify-between gap-3 px-3.5 py-2.5">
          <span className="truncate text-xs font-semibold text-foreground">{product.name}</span>
          {product.categoryName && <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">{product.categoryName}</span>}
        </div>
      )}
    </motion.div>
  )
}

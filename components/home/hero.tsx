"use client"

import Link from "next/link"
import Image from "next/image"
import { useRef } from "react"
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react"
import NumberFlow from "@number-flow/react"
import { SearchTrigger } from "@/components/header/search-command"
import { SplitText } from "@/components/motion/split-text"
import { Magnetic } from "@/components/motion/magnetic"
import { Marquee } from "@/components/motion/marquee"
import { EASE_OUT } from "@/components/motion/reveal"
import { ArrowRight, Download, ShieldCheck, ICON_SIZE } from "@/lib/storefront-icons"

interface HeroStats {
  productCount: number
  categoryCount: number
  reviewCount: number
  avgRating: number
}

export interface HeroProduct {
  slug: string
  name: string
  imageUrl: string | null
  categoryName?: string
}

/**
 * Cinematic hero on navy: animated mesh light, film grain, a headline that
 * typesets itself, the search pill, two CTAs, live counts — and a tilted
 * wall of real product covers drifting in two directions behind a fade.
 * Scroll-linked: as the page scrolls the copy recedes and the wall
 * flattens and rises, so the hero hands off to the page instead of
 * simply sliding away.
 */
export function Hero({ stats, products = [] }: { stats: HeroStats; products?: HeroProduct[] }) {
  const ref = useRef<HTMLElement>(null)
  const reduced = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] })
  const copyScale = useTransform(scrollYProgress, [0, 0.6], [1, 0.92])
  const copyOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0])
  const copyY = useTransform(scrollYProgress, [0, 0.6], [0, -60])
  const wallRotate = useTransform(scrollYProgress, [0, 1], [28, 10])
  const wallY = useTransform(scrollYProgress, [0, 1], [0, -120])
  const wallScale = useTransform(scrollYProgress, [0, 1], [1.08, 1.18])

  const covers = products.filter((p) => p.imageUrl)
  const rowA = covers.filter((_, i) => i % 2 === 0)
  const rowB = covers.filter((_, i) => i % 2 === 1)

  return (
    <section ref={ref} className="grain relative overflow-hidden bg-navy-deep text-navy-foreground">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="mesh-blob animate-mesh-1 left-[-10%] top-[-20%] h-[40rem] w-[40rem] bg-primary/25" />
        <div className="mesh-blob animate-mesh-2 right-[-15%] top-[10%] h-[36rem] w-[36rem] bg-[oklch(0.5_0.12_260)]/40" />
        <div className="mesh-blob animate-mesh-3 bottom-[-30%] left-[30%] h-[30rem] w-[30rem] bg-primary/15" />
      </div>
      <div aria-hidden className="paper-grid pointer-events-none absolute inset-0 opacity-[0.12] [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent_80%)]" />

      <div className="container-x relative pb-10 pt-16 sm:pt-24 lg:pt-28">
        <motion.div
          style={reduced ? undefined : { scale: copyScale, opacity: copyOpacity, y: copyY }}
          className="mx-auto flex max-w-4xl origin-top flex-col items-center text-center"
        >
          <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE_OUT }} className="eyebrow text-navy-foreground/60">
            The department store for digital work
          </motion.p>

          <SplitText
            text="Everything digital. One source."
            accentFrom={2}
            className="text-display mt-6 text-center text-[2.9rem] leading-[0.95] sm:text-6xl lg:text-[5.5rem]"
            delay={0.15}
          />

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.55, ease: EASE_OUT }}
            className="mt-6 max-w-2xl text-pretty text-base leading-relaxed text-navy-foreground/70 sm:text-lg"
          >
            Templates, fonts, systems, code and game-server resources — picked for how they hold up in real work, delivered the instant you pay, licence stated up front.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.65, ease: EASE_OUT }} className="mt-8 w-full max-w-xl">
            <SearchTrigger
              size="lg"
              placeholder="Search templates, fonts, dashboards, gaming…"
              className="border-navy-foreground/15 bg-navy-foreground/[0.07] text-navy-foreground/60 shadow-[0_20px_60px_-20px_rgba(0,0,0,.6)] hover:border-primary/60 hover:bg-navy-foreground/[0.1] [&_kbd]:border-navy-foreground/15 [&_kbd]:bg-navy-foreground/10 [&_kbd]:text-navy-foreground/60 [&_svg]:text-navy-foreground/60"
            />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.75, ease: EASE_OUT }} className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <Magnetic>
              <Link
                href="/products"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-[0_12px_40px_-10px_var(--primary)] transition-[transform,box-shadow] hover:shadow-[0_18px_50px_-10px_var(--primary)] active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep"
              >
                Explore the catalog
                <ArrowRight size={ICON_SIZE.base} weight="bold" className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            </Magnetic>
            <Magnetic>
              <Link
                href="/gaming"
                className="inline-flex h-12 items-center gap-2 rounded-full border border-navy-foreground/20 bg-navy-foreground/[0.06] px-6 text-[15px] font-semibold text-navy-foreground backdrop-blur transition-colors hover:border-navy-foreground/40 hover:bg-navy-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                DistroSource Gaming
              </Link>
            </Magnetic>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.95 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 font-mono text-[11px] uppercase tracking-[0.12em] text-navy-foreground/55"
          >
            <li className="flex items-baseline gap-2">
              <NumberFlow value={stats.productCount} className="font-display text-2xl font-bold normal-case tracking-tight text-navy-foreground" />
              products
            </li>
            <li className="flex items-baseline gap-2">
              <NumberFlow value={stats.categoryCount} className="font-display text-2xl font-bold normal-case tracking-tight text-navy-foreground" />
              categories
            </li>
            <li className="flex items-center gap-1.5">
              <Download size={13} weight="bold" className="text-primary" aria-hidden="true" />
              Instant delivery
            </li>
            <li className="flex items-center gap-1.5">
              <ShieldCheck size={13} weight="bold" className="text-primary" aria-hidden="true" />
              Licence up front
            </li>
          </motion.ul>
        </motion.div>
      </div>

      {covers.length >= 6 && (
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.9, ease: EASE_OUT }}
          aria-hidden="true"
          className="perspective-wall relative mt-6 h-[22rem] overflow-hidden sm:h-[26rem] lg:h-[30rem]"
        >
          <div className="absolute inset-x-0 top-0 z-10 h-24 bg-gradient-to-b from-navy-deep to-transparent" />
          <div className="absolute inset-x-0 bottom-0 z-10 h-32 bg-gradient-to-t from-navy-deep to-transparent" />
          <motion.div
            style={reduced ? { rotateX: 28, scale: 1.08 } : { rotateX: wallRotate, y: wallY, scale: wallScale }}
            className="absolute inset-0 origin-top"
          >
            <Marquee duration={70} gap="1.25rem" className="mb-5">
              {rowA.map((p) => (
                <Cover key={p.slug} product={p} />
              ))}
            </Marquee>
            <Marquee duration={84} gap="1.25rem" reverse>
              {rowB.map((p) => (
                <Cover key={p.slug} product={p} />
              ))}
            </Marquee>
          </motion.div>
        </motion.div>
      )}
    </section>
  )
}

function Cover({ product }: { product: HeroProduct }) {
  return (
    <Link href={`/products/${product.slug}`} tabIndex={-1} className="relative block aspect-[16/10] w-[17rem] shrink-0 overflow-hidden rounded-2xl border border-navy-foreground/10 bg-navy shadow-[0_30px_60px_-20px_rgba(0,0,0,.6)] sm:w-[20rem]">
      <Image src={product.imageUrl!} alt="" fill sizes="20rem" className="object-cover" />
      <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 bg-gradient-to-t from-navy-deep/90 to-transparent px-3 pb-2.5 pt-8 text-[11px] font-semibold text-navy-foreground">
        <span className="truncate">{product.name}</span>
        {product.categoryName && <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.1em] text-primary">{product.categoryName}</span>}
      </span>
    </Link>
  )
}

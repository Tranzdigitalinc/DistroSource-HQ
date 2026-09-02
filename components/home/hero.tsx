"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useInView } from "motion/react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star, Sparkles, ShieldCheck, Zap, Download, Headphones } from "lucide-react"

interface HeroStats {
  productCount: number
  categoryCount: number
  reviewCount: number
  avgRating: number
}

function useAnimatedCounter(target: number, duration = 500, startDelay = 0) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    if (!inView) return
    const timeout = setTimeout(() => {
      const start = performance.now()
      function tick(now: number) {
        const elapsed = now - start
        const progress = Math.min(elapsed / duration, 1)
        const eased = 1 - Math.pow(1 - progress, 3)
        setValue(Math.round(eased * target))
        if (progress < 1) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    }, startDelay)
    return () => clearTimeout(timeout)
  }, [inView, target, duration, startDelay])

  return { value, ref }
}

function formatCount(value: number) {
  if (value >= 1000) return `${Math.floor(value / 100) / 10}k`
  return `${value}`
}

const EASE = [0.16, 1, 0.3, 1] as const

const item = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
}

const card = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
}

const trustChips = [
  { icon: Download, label: "Instant access" },
  { icon: ShieldCheck, label: "Secure payments" },
  { icon: Zap, label: "New drops weekly" },
  { icon: Headphones, label: "24/7 support" },
]

const categoryPreviewCards = [
  { name: "Website templates", image: "/images/categories/website-templates.png" },
  { name: "Fonts", image: "/images/categories/fonts.png" },
  { name: "Presentation kits", image: "/images/categories/presentation-kits.png" },
  { name: "Notion systems", image: "/images/categories/notion-systems.png" },
  { name: "3D & mockups", image: "/images/categories/3d-mockups.png" },
  { name: "UI kits", image: "/images/categories/ui-kits.png" },
]

function StatCounter({ label, value, suffix = "", index }: { label: string; value: number; suffix?: string; index: number }) {
  const counter = useAnimatedCounter(value)
  return (
    <div className="flex flex-col gap-1 border-l border-border pl-4 first:border-l-0 first:pl-0">
      <span className="font-mono text-[10px] font-semibold text-muted-foreground/60">{String(index).padStart(2, "0")}</span>
      <span ref={counter.ref} className="font-mono text-2xl font-bold tabular-nums text-hero-foreground sm:text-3xl">
        {formatCount(counter.value)}{suffix}
      </span>
      <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] text-muted-foreground">{label}</span>
    </div>
  )
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
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-stretch gap-0 px-4 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-0">
        <motion.div
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.03, delayChildren: 0 }}
          className="flex flex-col items-start gap-7 border-border py-16 lg:border-r lg:py-20 lg:pr-12"
        >
          <motion.span
            variants={item}
            transition={{ duration: 0.2, ease: EASE }}
            className="flex w-fit items-center gap-2 border border-border px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground"
          >
            <span className="size-1.5 rounded-full bg-primary" />
            Everything digital. One source.
          </motion.span>

          <motion.h1
            variants={item}
            transition={{ duration: 0.2, ease: EASE }}
            className="font-display text-5xl font-black leading-[0.98] tracking-tight text-hero-foreground text-balance sm:text-6xl lg:text-[4.1rem]"
          >
            Digital assets,{" "}
            <span className="relative text-primary">
              unlocked in seconds
              <span className="absolute -bottom-1 left-0 h-[4px] w-full bg-primary/30" />
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            transition={{ duration: 0.2, ease: EASE }}
            className="max-w-lg text-lg leading-relaxed text-muted-foreground text-pretty"
          >
            Templates, fonts, presentations, Notion systems, 3D assets, and more — one department store for digital
            products, with instant access to every download in your library.
          </motion.p>

          <motion.div
            variants={item}
            transition={{ duration: 0.2, ease: EASE }}
            className="flex w-full flex-wrap items-center gap-3"
          >
            <Button
              size="lg"
              nativeButton={false}
              className="h-12 rounded-[4px] bg-primary px-8 font-mono text-sm font-semibold uppercase tracking-[0.04em] text-primary-foreground transition-transform hover:bg-primary/90 active:scale-[0.98]"
              render={<Link href="/products" />}
            >
              Shop all products
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              className="h-12 rounded-[4px] border-border-strong bg-transparent px-8 font-mono text-sm font-semibold uppercase tracking-[0.04em] text-foreground transition-colors hover:bg-secondary active:scale-[0.98]"
              render={<Link href="/deals" />}
            >
              <Sparkles className="size-4 text-primary" />
              View today&apos;s deals
            </Button>
          </motion.div>

          <motion.div
            variants={item}
            transition={{ duration: 0.2, ease: EASE }}
            className="grid w-full grid-cols-2 gap-y-3 border-t border-border pt-6 sm:grid-cols-4"
          >
            {trustChips.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-muted-foreground">
                <Icon className="size-4 shrink-0 text-primary" />
                <span className="font-mono text-[11px] font-medium uppercase tracking-[0.03em] sm:text-xs">{label}</span>
              </div>
            ))}
          </motion.div>

          <motion.div
            variants={item}
            transition={{ duration: 0.2, ease: EASE }}
            className="flex w-full flex-wrap items-center gap-x-0 gap-y-4"
          >
            <StatCounter label="Products" value={stats.productCount} suffix="+" index={1} />
            <StatCounter label="Categories" value={stats.categoryCount} index={2} />
            <StatCounter label="Reviews" value={stats.reviewCount} index={3} />
            <div className="flex flex-col gap-1 border-l border-border pl-4">
              <span className="font-mono text-[10px] font-semibold text-muted-foreground/60">04</span>
              <span className="flex items-center gap-1.5 font-mono text-2xl font-bold tabular-nums text-hero-foreground sm:text-3xl">
                {stats.avgRating.toFixed(1)}
                <Star className="size-4 fill-primary text-primary" />
              </span>
              <span className="font-mono text-[10.5px] font-medium uppercase tracking-[0.1em] text-muted-foreground">
                Avg rating
              </span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.02, delayChildren: 0 }}
          className="relative mx-auto flex w-full max-w-md flex-col py-16 lg:py-20 lg:pl-12"
        >
          <div className="mb-5 flex items-center justify-between font-mono text-[10.5px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            <span>A category for every project</span>
            <span className="text-primary">06 shown</span>
          </div>
          <div className="grid grid-cols-3 gap-px border border-border bg-border">
            {categoryPreviewCards.map(({ name, image }, i) => (
              <motion.div key={name} variants={card} transition={{ duration: 0.5, ease: EASE }}>
                <Link
                  href="/products"
                  className="group/cat relative flex aspect-square items-end overflow-hidden bg-secondary transition-opacity hover:opacity-90"
                >
                  <span className="absolute left-0 top-0 z-10 flex size-5 items-center justify-center bg-navy/80 font-mono text-[9px] font-semibold text-navy-foreground">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover/cat:scale-110"
                    sizes="120px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy/85 via-navy/10 to-transparent" />
                  <span className="relative z-10 line-clamp-2 p-2 text-[10px] font-medium leading-tight text-navy-foreground">
                    {name}
                  </span>
                </Link>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

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

function StatCounter({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
  const counter = useAnimatedCounter(value)
  return (
    <div className="flex flex-col gap-1">
      <span ref={counter.ref} className="font-display text-2xl font-semibold text-hero-foreground sm:text-3xl">
        {formatCount(counter.value)}{suffix}
      </span>
      <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  )
}

export function Hero({ stats }: { stats: HeroStats }) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-hero">
      {/* Layered background: fine grid + soft brand highlight (decorative) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.5] [mask-image:radial-gradient(120%_90%_at_50%_0%,black,transparent_72%)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[820px] -translate-x-1/2 rounded-full opacity-60 blur-3xl"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, var(--glow), transparent 70%)",
        }}
      />
      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-4 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:py-20">
        <motion.div
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.03, delayChildren: 0 }}
          className="flex flex-col items-start gap-7"
        >
          <motion.span
            variants={item}
            transition={{ duration: 0.2, ease: EASE }}
            className="flex w-fit items-center gap-2 rounded-full border border-border bg-card/80 py-1.5 pl-2 pr-3.5 text-xs font-medium text-foreground shadow-sm backdrop-blur-sm"
          >
            <span className="relative flex size-4 items-center justify-center rounded-full bg-brand-blue/15">
              <span className="size-1.5 rounded-full bg-brand-blue" />
              <span className="absolute inset-0 animate-ping rounded-full bg-brand-blue/40" />
            </span>
            <span className="tracking-wide">Everything digital. One source.</span>
          </motion.span>

          <motion.h1
            variants={item}
            transition={{ duration: 0.2, ease: EASE }}
            className="font-display text-5xl font-medium leading-[1.05] tracking-tight text-hero-foreground text-balance sm:text-6xl lg:text-[4.1rem]"
          >
            Digital assets,{" "}
            <span className="relative text-primary">
              unlocked in seconds
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.6 }}
                className="absolute -bottom-1 left-0 h-[3px] w-full origin-left rounded-full bg-accent/50"
              />
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
            className="flex w-full flex-wrap items-center gap-4"
          >
            <Button
              size="lg"
              nativeButton={false}
              className="group/cta relative h-12 overflow-hidden px-8 font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
              style={{
                backgroundImage:
                  "linear-gradient(135deg, var(--brand-blue-bright), var(--brand-blue) 60%, var(--navy))",
              }}
              render={<Link href="/products" />}
            >
              <span
                aria-hidden
                className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover/cta:translate-x-full"
              />
              Shop all products
              <ArrowRight className="size-4 transition-transform duration-200 group-hover/cta:translate-x-0.5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              className="h-12 border-border-strong bg-card px-8 font-semibold text-foreground shadow-xs transition-all hover:border-primary/40 hover:bg-secondary hover:shadow-sm active:scale-[0.98]"
              render={<Link href="/deals" />}
            >
              <Sparkles className="size-4 text-brand-cyan" />
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
                <Icon className="size-4 shrink-0 text-accent" />
                <span className="text-xs font-medium sm:text-sm">{label}</span>
              </div>
            ))}
          </motion.div>

          <motion.div
            variants={item}
            transition={{ duration: 0.2, ease: EASE }}
            className="flex w-full flex-wrap items-center gap-x-8 gap-y-4"
          >
            <StatCounter label="Products" value={stats.productCount} suffix="+" />
            <StatCounter label="Categories" value={stats.categoryCount} />
            <StatCounter label="Reviews" value={stats.reviewCount} />
            <div className="flex flex-col gap-1">
              <span className="flex items-center gap-1.5 font-display text-2xl font-semibold text-hero-foreground sm:text-3xl">
                {stats.avgRating.toFixed(1)}
                <Star className="size-4 fill-accent text-accent" />
              </span>
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Avg rating
              </span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.02, delayChildren: 0 }}
          className="relative mx-auto w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-sm"
        >
          <p className="mb-5 text-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
            A category for every project
          </p>
          <div className="grid grid-cols-3 gap-3">
            {categoryPreviewCards.map(({ name, image }) => (
              <motion.div key={name} variants={card} transition={{ duration: 0.5, ease: EASE }}>
                <Link
                  href="/products"
                  className="group/cat relative flex aspect-square items-end overflow-hidden rounded-xl border border-border bg-secondary shadow-xs transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
                >
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover/cat:scale-110"
                    sizes="120px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <span className="relative z-10 line-clamp-2 p-2 text-[10px] font-medium leading-tight text-white">
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

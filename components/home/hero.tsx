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
      <span className="text-[11px] font-medium uppercase tracking-wider text-hero-foreground/45">{label}</span>
    </div>
  )
}

export function Hero({ stats }: { stats: HeroStats }) {
  return (
    <section className="relative overflow-hidden bg-hero">
      <div className="absolute inset-0">
        <Image
          src="/images/hero/distrosource-hero.png"
          alt=""
          fill
          priority
          loading="eager"
          className="object-cover opacity-60 mix-blend-screen"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-hero via-hero/40 to-hero/80" />
      <div
        className="absolute inset-0 opacity-80"
        style={{
          backgroundImage:
            "radial-gradient(circle at 10% 15%, oklch(0.8 0.17 195 / 0.2), transparent 45%), radial-gradient(circle at 90% 90%, oklch(0.7 0.2 258 / 0.18), transparent 45%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(oklch(0.98 0.003 260) 1px, transparent 1px), linear-gradient(90deg, oklch(0.98 0.003 260) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-4 py-16 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8 lg:py-24">
        <motion.div
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.03, delayChildren: 0 }}
          className="flex flex-col items-start gap-7"
        >
          <motion.span
            variants={item}
              transition={{ duration: 0.2, ease: EASE }}
            className="glow-ring flex w-fit items-center gap-1.5 rounded-full bg-hero-foreground/10 px-3.5 py-1.5 text-xs font-medium text-hero-foreground/80 ring-1 ring-inset ring-accent/25"
          >
            <ShieldCheck className="size-3.5 text-hero-accent" />
            <span className="tracking-wide">Everything digital. One source.</span>
          </motion.span>

          <motion.h1
            variants={item}
            transition={{ duration: 0.2, ease: EASE }}
            className="font-display text-5xl font-medium leading-[1.05] tracking-tight text-hero-foreground text-balance sm:text-6xl lg:text-[4.1rem]"
          >
            Digital assets,{" "}
            <span className="text-gradient-cyan relative">
              unlocked in seconds
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.6 }}
                className="absolute -bottom-1 left-0 h-[2px] w-full origin-left rounded-full bg-hero-accent/40"
              />
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            transition={{ duration: 0.2, ease: EASE }}
            className="max-w-lg text-lg leading-relaxed text-hero-foreground/65 text-pretty"
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
              className="h-12 bg-accent px-8 font-semibold text-accent-foreground shadow-lg shadow-accent/20 transition-colors hover:bg-accent/90 active:scale-[0.98]"
              render={<Link href="/products" />}
            >
              Shop all products
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              className="h-12 border-hero-foreground/20 bg-transparent px-8 font-semibold text-hero-foreground transition-colors hover:border-accent/50 hover:bg-hero-foreground/5 active:scale-[0.98]"
              render={<Link href="/deals" />}
            >
              <Sparkles className="size-4" />
              View today&apos;s deals
            </Button>
          </motion.div>

          <motion.div
            variants={item}
            transition={{ duration: 0.2, ease: EASE }}
            className="grid w-full grid-cols-2 gap-y-3 border-t border-hero-foreground/10 pt-6 sm:grid-cols-4"
          >
            {trustChips.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-hero-foreground/65">
                <Icon className="size-4 shrink-0 text-hero-accent" />
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
                <Star className="size-4 fill-hero-accent text-hero-accent" />
              </span>
              <span className="text-[11px] font-medium uppercase tracking-wider text-hero-foreground/45">
                Avg rating
              </span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.02, delayChildren: 0 }}
          className="glass-panel glow-ring relative mx-auto w-full max-w-md rounded-2xl border border-accent/15 p-6"
        >
          <p className="mb-5 text-center text-xs font-medium uppercase tracking-wider text-hero-foreground/45">
            A category for every project
          </p>
          <div className="grid grid-cols-3 gap-3">
            {categoryPreviewCards.map(({ name, image }) => (
              <motion.div key={name} variants={card} transition={{ duration: 0.5, ease: EASE }}>
                <div className="relative flex aspect-square items-end overflow-hidden rounded-xl border border-hero-foreground/10 bg-white/5 transition-colors duration-300 hover:border-hero-accent/40">
                  <Image
                    src={image || "/placeholder.svg"}
                    alt={name}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  <span className="relative z-10 line-clamp-2 p-2 text-[10px] font-medium leading-tight text-white">
                    {name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

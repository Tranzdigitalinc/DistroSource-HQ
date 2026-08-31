"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useInView } from "motion/react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star, Sparkles } from "lucide-react"

interface HeroStats {
  productCount: number
  brandCount: number
  countryCount: number
  reviewCount: number
  avgRating: number
}

function useAnimatedCounter(target: number, duration = 1800, startDelay = 400) {
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

function StatCounter({ label, value, suffix = "" }: { label: string; value: number; suffix?: string }) {
  const counter = useAnimatedCounter(value)
  return (
    <div className="flex flex-col items-center gap-1">
      <span ref={counter.ref} className="font-display text-2xl font-bold text-hero-foreground sm:text-3xl">
        {formatCount(counter.value)}{suffix}
      </span>
      <span className="text-[11px] font-medium uppercase tracking-wider text-hero-foreground/50">{label}</span>
    </div>
  )
}

export function Hero({ stats }: { stats: HeroStats }) {
  return (
    <section className="relative overflow-hidden bg-hero">
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle at 12% 20%, oklch(0.68 0.19 262 / 0.22), transparent 45%), radial-gradient(circle at 88% 85%, oklch(0.68 0.19 262 / 0.14), transparent 45%)",
        }}
      />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(ellipse at 50% 0%, oklch(0.64 0.21 262 / 0.18), transparent 60%)",
        }}
      />
      <motion.div
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.09, delayChildren: 0.05 }}
        className="relative mx-auto flex max-w-7xl flex-col items-center gap-8 px-4 py-10 sm:px-8 lg:py-14"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.97, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE }}
          className="relative w-full overflow-hidden rounded-3xl ring-1 ring-hero-foreground/10 shadow-[0_30px_80px_-40px_rgba(0,0,0,0.8)]"
        >
          {/* Wide banner for tablet/desktop */}
          <Image
            src="/redeemcove-hero-banner.png"
            alt="RedeemCove — digital value without borders. Top brands, global access, and instant delivery of gift cards and digital codes worldwide"
            width={1792}
            height={896}
            priority
            className="hidden h-auto w-full sm:block"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
          {/* Square ad for mobile */}
          <Image
            src="/redeemcove-hero-square.jpg"
            alt="RedeemCove — one place, endless possibilities. Digital gift cards and codes delivered instantly"
            width={1280}
            height={1280}
            priority
            className="block h-auto w-full sm:hidden"
            sizes="100vw"
          />
        </motion.div>

        <motion.div
          variants={item}
          transition={{ duration: 0.6, ease: EASE }}
          className="flex w-full flex-col items-center gap-4 sm:flex-row sm:justify-center"
        >
          <Button
            size="lg"
            nativeButton={false}
            className="h-12 w-full animate-pulse-glow bg-hero-foreground px-8 font-semibold text-hero transition-transform hover:bg-hero-foreground/90 active:scale-95 sm:w-auto"
            render={<Link href="/products" />}
          >
            Shop all gift cards
            <ArrowRight className="size-4" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            className="h-12 w-full border-hero-foreground/25 bg-transparent px-8 font-semibold text-hero-foreground transition-all hover:border-hero-foreground/50 hover:bg-hero-foreground/10 active:scale-95 sm:w-auto"
            render={<Link href="/deals" />}
          >
            <Sparkles className="size-4" />
            View today&apos;s deals
          </Button>
        </motion.div>

        <motion.div
          variants={item}
          transition={{ duration: 0.6, ease: EASE }}
          className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 rounded-2xl border border-hero-foreground/10 bg-hero-foreground/5 px-6 py-4 backdrop-blur-sm"
        >
          <StatCounter label="Brands" value={stats.brandCount} suffix="+" />
          <div className="h-8 w-px bg-hero-foreground/15" />
          <StatCounter label="Countries" value={stats.countryCount} />
          <div className="h-8 w-px bg-hero-foreground/15" />
          <StatCounter label="Reviews" value={stats.reviewCount} />
          <div className="h-8 w-px bg-hero-foreground/15" />
          <div className="flex flex-col items-center gap-1">
            <span className="flex items-center gap-1 font-display text-2xl font-bold text-hero-foreground sm:text-3xl">
              {stats.avgRating.toFixed(1)}
              <Star className="size-4 fill-hero-accent text-hero-accent" />
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-hero-foreground/50">Avg rating</span>
          </div>
        </motion.div>
      </motion.div>
    </section>
  )
}

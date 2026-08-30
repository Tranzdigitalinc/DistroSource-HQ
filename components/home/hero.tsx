"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useInView } from "motion/react"
import { Button } from "@/components/ui/button"
import { ArrowRight, ShieldCheck, Star, Sparkles } from "lucide-react"

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
        className="relative mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-20 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-28"
      >
        <div className="flex flex-col gap-7">
          <motion.span
            variants={item}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex w-fit items-center gap-1.5 rounded-full bg-hero-foreground/10 px-3.5 py-1.5 text-xs font-medium text-hero-foreground/90 ring-1 ring-inset ring-hero-foreground/20 backdrop-blur-sm"
          >
            <ShieldCheck className="size-3.5 text-hero-accent" />
            Verified codes, sourced from authorized distributors
          </motion.span>
          <motion.h1
            variants={item}
            transition={{ duration: 0.6, ease: EASE }}
            className="font-display text-5xl font-medium leading-[1.05] tracking-tight text-hero-foreground text-balance sm:text-6xl lg:text-[4.25rem]"
          >
            Gift cards & digital codes,{" "}
            <span className="relative text-hero-accent">
              delivered instantly
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.6 }}
                className="absolute -bottom-1 left-0 h-[3px] w-full origin-left rounded-full bg-hero-accent/40"
              />
            </span>
          </motion.h1>
          <motion.p
            variants={item}
            transition={{ duration: 0.6, ease: EASE }}
            className="max-w-lg text-lg leading-relaxed text-hero-foreground/70 text-pretty"
          >
            Top up games, stream more, and shop your favorite brands — all from one marketplace with instant
            delivery to your inbox and account.
          </motion.p>
          <motion.div
            variants={item}
            transition={{ duration: 0.6, ease: EASE }}
            className="flex flex-wrap items-center gap-4"
          >
            <Button
              size="lg"
              nativeButton={false}
              className="h-12 animate-pulse-glow bg-hero-foreground px-6 font-semibold text-hero transition-transform hover:bg-hero-foreground/90 active:scale-95"
              render={<Link href="/products" />}
            >
              Browse all products
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              className="h-12 border-hero-foreground/25 bg-transparent px-6 font-semibold text-hero-foreground transition-all hover:border-hero-foreground/50 hover:bg-hero-foreground/10 active:scale-95"
              render={<Link href="/deals" />}
            >
              <Sparkles className="size-4" />
              View today&apos;s deals
            </Button>
          </motion.div>

          <motion.div
            variants={item}
            transition={{ duration: 0.6, ease: EASE }}
            className="mt-2 flex items-center gap-2 text-sm text-hero-foreground/65"
          >
            <span className="flex items-center gap-1 font-display font-semibold text-hero-foreground">
              {stats.avgRating.toFixed(1)}
              <Star className="size-3.5 fill-hero-accent text-hero-accent" />
            </span>
            <span>from {formatCount(stats.reviewCount)} reviews across</span>
            <span className="font-semibold text-hero-foreground">{stats.brandCount}+ brands</span>
            <span aria-hidden="true">·</span>
            <span>{stats.countryCount} countries</span>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, x: 16 }}
          animate={{ opacity: 1, scale: 1, x: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
          className="relative mx-auto w-full max-w-md lg:max-w-lg"
        >
          <div className="animate-float relative aspect-square overflow-hidden rounded-2xl shadow-2xl shadow-black/40 ring-1 ring-white/10">
            <Image
              src="/hero-cards.png"
              alt="A collection of premium gift cards fanned across a warm walnut surface"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 90vw, 40vw"
            />
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE, delay: 0.7 }}
            className="absolute -bottom-4 -left-4 flex items-center gap-3 rounded-xl border border-hero-foreground/10 bg-hero/90 px-4 py-3 shadow-lg backdrop-blur-md sm:-bottom-5 sm:-left-6"
          >
            <StatCounter label="Brands" value={stats.brandCount} suffix="+" />
            <div className="h-8 w-px bg-hero-foreground/15" />
            <StatCounter label="Countries" value={stats.countryCount} />
            <div className="h-8 w-px bg-hero-foreground/15" />
            <StatCounter label="Reviews" value={stats.reviewCount} />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  )
}

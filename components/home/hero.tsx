"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { motion, useInView } from "motion/react"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star, Sparkles, ShieldCheck, Zap, Globe2, Headphones } from "lucide-react"

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

const card = {
  hidden: { opacity: 0, scale: 0.85, y: 24 },
  visible: { opacity: 1, scale: 1, y: 0 },
}

const trustChips = [
  { icon: Zap, label: "Instant delivery" },
  { icon: ShieldCheck, label: "Secure payments" },
  { icon: Globe2, label: "Global access" },
  { icon: Headphones, label: "24/7 support" },
]

const brandCards = [
  { name: "PlayStation", logo: "/logos/playstation-store.svg" },
  { name: "Xbox", logo: "/logos/xbox.svg" },
  { name: "Steam", logo: "/logos/steam.svg" },
  { name: "Amazon", logo: "/logos/amazon.svg" },
  { name: "Netflix", logo: "/logos/netflix.svg" },
  { name: "Spotify", logo: "/logos/spotify.svg" },
]

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
      <div
        className="absolute inset-0 opacity-[0.07]"
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
          transition={{ staggerChildren: 0.09, delayChildren: 0.05 }}
          className="flex flex-col items-start gap-7"
        >
          <motion.span
            variants={item}
            transition={{ duration: 0.5, ease: EASE }}
            className="flex w-fit items-center gap-1.5 rounded-full bg-hero-foreground/10 px-3.5 py-1.5 text-xs font-medium text-hero-foreground/90 ring-1 ring-inset ring-hero-foreground/20 backdrop-blur-sm"
          >
            <ShieldCheck className="size-3.5 text-hero-accent" />
            TRUSTED DIGITAL MARKETPLACE
          </motion.span>

          <motion.h1
            variants={item}
            transition={{ duration: 0.6, ease: EASE }}
            className="font-display text-5xl font-medium leading-[1.05] tracking-tight text-hero-foreground text-balance sm:text-6xl lg:text-[4.25rem]"
          >
            Digital value,{" "}
            <span className="relative bg-gradient-to-r from-hero-accent via-hero-accent to-hero-foreground bg-clip-text text-transparent">
              delivered in seconds
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
            className="flex w-full flex-wrap items-center gap-4"
          >
            <Button
              size="lg"
              nativeButton={false}
              className="h-12 animate-pulse-glow bg-hero-foreground px-8 font-semibold text-hero transition-transform hover:bg-hero-foreground/90 active:scale-95"
              render={<Link href="/products" />}
            >
              Shop all gift cards
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              className="h-12 border-hero-foreground/25 bg-transparent px-8 font-semibold text-hero-foreground transition-all hover:border-hero-foreground/50 hover:bg-hero-foreground/10 active:scale-95"
              render={<Link href="/deals" />}
            >
              <Sparkles className="size-4" />
              View today&apos;s deals
            </Button>
          </motion.div>

          <motion.div
            variants={item}
            transition={{ duration: 0.6, ease: EASE }}
            className="grid w-full grid-cols-2 gap-3 sm:grid-cols-4"
          >
            {trustChips.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2 text-sm text-hero-foreground/70">
                <Icon className="size-4 shrink-0 text-hero-accent" />
                <span className="text-xs font-medium sm:text-sm">{label}</span>
              </div>
            ))}
          </motion.div>

          <motion.div
            variants={item}
            transition={{ duration: 0.6, ease: EASE }}
            className="flex w-full flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl border border-hero-foreground/10 bg-hero-foreground/5 px-6 py-4 backdrop-blur-sm"
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
              <span className="text-[11px] font-medium uppercase tracking-wider text-hero-foreground/50">
                Avg rating
              </span>
            </div>
          </motion.div>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          transition={{ staggerChildren: 0.08, delayChildren: 0.3 }}
          className="relative mx-auto grid w-full max-w-md grid-cols-3 gap-3 sm:gap-4"
        >
          {brandCards.map(({ name, logo }, i) => (
            <motion.div
              key={name}
              variants={card}
              transition={{ duration: 0.55, ease: EASE }}
              className={`animate-float ${i % 2 === 1 ? "sm:translate-y-6" : ""}`}
              style={{ animationDelay: `${i * 0.35}s` }}
            >
              <div className="flex aspect-square items-center justify-center rounded-2xl border border-hero-foreground/10 bg-white p-4 shadow-[0_20px_45px_-15px_rgba(0,0,0,0.55)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_25px_55px_-15px_hsl(var(--hero-accent)/0.35)]">
                <Image
                  src={logo || "/placeholder.svg"}
                  alt={name}
                  width={64}
                  height={64}
                  className="h-8 w-auto object-contain sm:h-10"
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

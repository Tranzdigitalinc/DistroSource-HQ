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
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0 },
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
            className="flex w-fit items-center gap-1.5 rounded-full bg-hero-foreground/10 px-3.5 py-1.5 text-xs font-medium text-hero-foreground/80 ring-1 ring-inset ring-hero-foreground/15"
          >
            <ShieldCheck className="size-3.5 text-hero-accent" />
            <span className="tracking-wide">Trusted digital marketplace</span>
          </motion.span>

          <motion.h1
            variants={item}
            transition={{ duration: 0.6, ease: EASE }}
            className="font-display text-5xl font-medium leading-[1.05] tracking-tight text-hero-foreground text-balance sm:text-6xl lg:text-[4.1rem]"
          >
            Digital value,{" "}
            <span className="relative text-hero-accent">
              delivered in seconds
              <motion.span
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, ease: EASE, delay: 0.6 }}
                className="absolute -bottom-1 left-0 h-[2px] w-full origin-left rounded-full bg-hero-accent/30"
              />
            </span>
          </motion.h1>

          <motion.p
            variants={item}
            transition={{ duration: 0.6, ease: EASE }}
            className="max-w-lg text-lg leading-relaxed text-hero-foreground/65 text-pretty"
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
              className="h-12 bg-hero-foreground px-8 font-semibold text-hero shadow-lg shadow-black/20 transition-colors hover:bg-hero-foreground/90 active:scale-[0.98]"
              render={<Link href="/products" />}
            >
              Shop all gift cards
              <ArrowRight className="size-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              nativeButton={false}
              className="h-12 border-hero-foreground/20 bg-transparent px-8 font-semibold text-hero-foreground transition-colors hover:border-hero-foreground/40 hover:bg-hero-foreground/5 active:scale-[0.98]"
              render={<Link href="/deals" />}
            >
              <Sparkles className="size-4" />
              View today&apos;s deals
            </Button>
          </motion.div>

          <motion.div
            variants={item}
            transition={{ duration: 0.6, ease: EASE }}
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
            transition={{ duration: 0.6, ease: EASE }}
            className="flex w-full flex-wrap items-center gap-x-8 gap-y-4"
          >
            <StatCounter label="Brands" value={stats.brandCount} suffix="+" />
            <StatCounter label="Countries" value={stats.countryCount} />
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
          transition={{ staggerChildren: 0.06, delayChildren: 0.35 }}
          className="relative mx-auto w-full max-w-md rounded-2xl border border-hero-foreground/10 bg-hero-foreground/[0.04] p-6"
        >
          <p className="mb-5 text-center text-xs font-medium uppercase tracking-wider text-hero-foreground/45">
            Powered by the platforms you love
          </p>
          <div className="grid grid-cols-3 gap-3">
            {brandCards.map(({ name, logo }) => (
              <motion.div key={name} variants={card} transition={{ duration: 0.5, ease: EASE }}>
                <div className="flex aspect-square items-center justify-center rounded-xl border border-hero-foreground/10 bg-white p-4 transition-colors duration-300 hover:border-hero-accent/40">
                  <Image
                    src={logo || "/placeholder.svg"}
                    alt={name}
                    width={64}
                    height={64}
                    className="h-8 w-auto object-contain sm:h-9"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

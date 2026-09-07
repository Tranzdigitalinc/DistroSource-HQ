"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import NumberFlow from "@number-flow/react"
import { EASE_OUT } from "@/components/motion/reveal"
import { ArrowRight, Sparkles } from "@/lib/storefront-icons"
import type { HeroProduct } from "@/components/home/hero"

/* ------------------------------------------------------------------ */
/* Rotating word inside the headline                                   */
/* ------------------------------------------------------------------ */

const WORDS = ["digital", "for designers", "for developers", "for the office", "for game servers", "for creators"]

/** Cycles through phrases with a vertical flip; static under reduced motion. */
export function RotatingWord({ interval = 2600 }: { interval?: number }) {
  const reduced = useReducedMotion()
  const [i, setI] = useState(0)
  useEffect(() => {
    if (reduced) return
    const id = window.setInterval(() => setI((n) => (n + 1) % WORDS.length), interval)
    return () => window.clearInterval(id)
  }, [interval, reduced])

  return (
    <span className="relative inline-grid justify-items-center overflow-hidden align-bottom" aria-live="off">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={WORDS[i]}
          initial={{ y: "100%", opacity: 0, rotateX: -40 }}
          animate={{ y: 0, opacity: 1, rotateX: 0 }}
          exit={{ y: "-100%", opacity: 0, rotateX: 40 }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
          className="col-start-1 row-start-1 whitespace-nowrap text-[0.78em] leading-[1.1] text-primary sm:text-[1em] sm:leading-[inherit]"
        >
          {WORDS[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Typing search placeholder                                           */
/* ------------------------------------------------------------------ */

const QUERIES = ["admin dashboard", "wedding font", "notion planner", "fivem mlo", "pitch deck", "icon pack", "minecraft server"]

/** Types and deletes example queries, like someone searching. */
export function useTypewriter(enabled: boolean, prefix = "Try “", suffix = "”") {
  const [text, setText] = useState(QUERIES[0])
  useEffect(() => {
    if (!enabled) return
    let q = 0
    let pos = QUERIES[0].length
    let deleting = false
    let timer = 0
    const tick = () => {
      const word = QUERIES[q]
      if (!deleting) {
        pos += 1
        setText(word.slice(0, pos))
        if (pos >= word.length) {
          deleting = true
          timer = window.setTimeout(tick, 1600)
          return
        }
        timer = window.setTimeout(tick, 55 + Math.random() * 50)
      } else {
        pos -= 1
        setText(word.slice(0, pos))
        if (pos <= 0) {
          deleting = false
          q = (q + 1) % QUERIES.length
          timer = window.setTimeout(tick, 350)
          return
        }
        timer = window.setTimeout(tick, 32)
      }
    }
    timer = window.setTimeout(tick, 2200)
    return () => window.clearTimeout(timer)
  }, [enabled])
  if (!enabled || text.length === 0) return "Search templates, fonts, dashboards, gaming…"
  return `${prefix}${text}${suffix}`
}

/* ------------------------------------------------------------------ */
/* Counting stat                                                       */
/* ------------------------------------------------------------------ */

/** Counts from zero up to `value` shortly after mount. */
export function CountUp({ value, className, delay = 900 }: { value: number; className?: string; delay?: number }) {
  const reduced = useReducedMotion()
  const [v, setV] = useState(reduced ? value : 0)
  useEffect(() => {
    if (reduced) return
    const id = window.setTimeout(() => setV(value), delay)
    return () => window.clearTimeout(id)
  }, [value, delay, reduced])
  return <NumberFlow value={v} className={className} transformTiming={{ duration: 900, easing: "ease-out" }} spinTiming={{ duration: 900, easing: "ease-out" }} />
}

/* ------------------------------------------------------------------ */
/* Live ticker of the newest products                                  */
/* ------------------------------------------------------------------ */

/** Cycles through the latest products, one at a time, as a small pill. Real data only. */
export function JustAddedTicker({ items, interval = 3200 }: { items: HeroProduct[]; interval?: number }) {
  const reduced = useReducedMotion()
  const [i, setI] = useState(0)
  useEffect(() => {
    if (reduced || items.length < 2) return
    const id = window.setInterval(() => setI((n) => (n + 1) % items.length), interval)
    return () => window.clearInterval(id)
  }, [items.length, interval, reduced])
  if (items.length === 0) return null
  const item = items[i]

  return (
    <Link
      href={`/products/${item.slug}`}
      className="group inline-flex h-9 max-w-full items-center gap-2 rounded-full border border-navy-foreground/15 bg-navy-foreground/[0.06] pl-2 pr-3 text-xs text-navy-foreground/80 backdrop-blur transition-colors hover:border-primary/60 hover:bg-navy-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <span className="flex h-5 items-center gap-1 rounded-full bg-primary px-1.5 font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-primary-foreground">
        <Sparkles size={10} weight="fill" aria-hidden="true" />
        Just added
      </span>
      <span className="relative flex min-w-0 flex-1 items-center overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={item.slug}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className="truncate"
          >
            {item.name}
            {item.categoryName && <span className="text-navy-foreground/45"> · {item.categoryName}</span>}
          </motion.span>
        </AnimatePresence>
      </span>
      <ArrowRight size={12} weight="bold" className="shrink-0 text-primary transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
    </Link>
  )
}

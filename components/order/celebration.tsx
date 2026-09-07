"use client"

import { useMemo } from "react"
import { motion, useReducedMotion } from "motion/react"
import NumberFlow from "@number-flow/react"
import { SplitText } from "@/components/motion/split-text"

const COLORS = ["var(--primary)", "var(--navy)", "oklch(0.85 0.16 70)", "var(--success)", "oklch(0.7 0.02 80)"]

/** One-shot confetti drop across the top of the page. Decorative only. */
function Confetti({ count = 46 }: { count?: number }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        x: (i / count) * 100 + (((i * 37) % 10) - 5),
        delay: ((i * 13) % 10) / 10,
        duration: 1.8 + ((i * 7) % 10) / 8,
        rotate: ((i * 53) % 360) - 180,
        color: COLORS[i % COLORS.length],
        w: 6 + (i % 3) * 3,
        h: 10 + (i % 4) * 3,
        round: i % 4 === 0,
      })),
    [count],
  )
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-screen overflow-hidden">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          initial={{ y: -40, x: 0, rotate: 0, opacity: 1 }}
          animate={{ y: "110vh", x: [0, 30, -20, 10], rotate: p.rotate * 3, opacity: [1, 1, 1, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: [0.2, 0.6, 0.4, 1] }}
          style={{ left: `${p.x}%`, width: p.w, height: p.h, background: p.color, borderRadius: p.round ? 999 : 2 }}
          className="absolute top-0 block"
        />
      ))}
    </div>
  )
}

/**
 * The moment after paying: confetti, a check mark that draws itself, the
 * headline typesetting in and the amount ticking up to what was paid.
 */
export function SuccessHero({ total, email }: { total: number; email: string }) {
  const reduced = useReducedMotion()
  return (
    <div className="relative flex flex-col items-center gap-5 text-center">
      {!reduced && <Confetti />}
      <motion.span
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="flex size-20 items-center justify-center rounded-full bg-success/10 text-success ring-8 ring-success/5"
      >
        <svg width={40} height={40} viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <motion.path
            d="M4 12.5l5 5L20 6.5"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.25, ease: "easeOut" }}
          />
        </svg>
      </motion.span>

      <SplitText as="h1" text="Your order is ready." className="text-display text-center text-3xl sm:text-4xl lg:text-5xl" delay={0.35} />

      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7, duration: 0.5 }} className="max-w-md text-pretty text-sm leading-relaxed text-muted-foreground sm:text-base">
        Everything you bought is unlocked in My Library. A receipt is on its way to <span className="font-medium text-foreground">{email}</span>.
      </motion.p>

      <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9, duration: 0.4 }} className="flex items-baseline gap-2 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        Paid
        <NumberFlow value={total} format={{ style: "currency", currency: "USD" }} className="font-display text-3xl font-bold normal-case tabular-nums tracking-tight text-foreground" />
      </motion.p>
    </div>
  )
}

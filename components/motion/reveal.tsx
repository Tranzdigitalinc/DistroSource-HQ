"use client"

import type { ReactNode } from "react"
import { motion, type Variants } from "motion/react"

export const EASE_OUT = [0.16, 1, 0.3, 1] as const

/**
 * Fades and lifts content into place the first time it scrolls into view.
 * Short (≤ 0.45 s), small travel (12 px), once only — the content arrives,
 * it does not perform. `MotionConfig reducedMotion="user"` in the provider
 * disables it for users who ask.
 */
export function Reveal({
  children,
  delay = 0,
  y = 12,
  duration = 0.45,
  className,
  once = true,
}: {
  children: ReactNode
  delay?: number
  y?: number
  duration?: number
  className?: string
  once?: boolean
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-48px" }}
      transition={{ duration, delay, ease: EASE_OUT }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export const revealItemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
}

/**
 * Wraps a grid/list of children so each item staggers in as the container
 * scrolls into view. Pass a stable `key` on each child as usual.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.04,
}: {
  children: ReactNode
  className?: string
  stagger?: number
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-48px" }}
      transition={{ staggerChildren: Math.min(stagger, 0.06) }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function RevealItem({
  children,
  className,
  duration = 0.4,
}: {
  children: ReactNode
  className?: string
  duration?: number
}) {
  return (
    <motion.div variants={revealItemVariants} transition={{ duration, ease: EASE_OUT }} className={className}>
      {children}
    </motion.div>
  )
}

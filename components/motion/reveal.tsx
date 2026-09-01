"use client"

import type { ReactNode } from "react"
import { motion, type Variants } from "motion/react"

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * Fades and lifts content into place the first time it scrolls into view.
 * Use `delay` to stagger a sequence of siblings (e.g. index * 0.06).
 */
export function Reveal({
  children,
  delay = 0,
  y = 16,
  duration = 0.55,
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
      initial={false}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: "-64px" }}
      transition={{ duration: Math.min(duration, 0.2), delay: 0, ease: EASE }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export const revealItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
}

/**
 * Wraps a grid/list of children so each item staggers in as the container
 * scrolls into view. Pass a stable `key` on each child as usual.
 */
export function RevealGroup({
  children,
  className,
  stagger = 0.06,
}: {
  children: ReactNode
  className?: string
  stagger?: number
}) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-64px" }}
      transition={{ staggerChildren: stagger }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function RevealItem({
  children,
  className,
  duration = 0.5,
}: {
  children: ReactNode
  className?: string
  duration?: number
}) {
  return (
    <motion.div variants={revealItemVariants} transition={{ duration, ease: EASE }} className={className}>
      {children}
    </motion.div>
  )
}

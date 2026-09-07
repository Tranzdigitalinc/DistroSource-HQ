"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"

const PARTICLES = 10

/**
 * Orange burst around the header cart button. Fires on the `ds:cart-burst`
 * window event (dispatched when a fly-to-cart clone lands). Render it inside
 * a `relative` parent; it is purely decorative.
 */
export function CartBurst() {
  const [key, setKey] = useState(0)
  const reduced = useReducedMotion()

  useEffect(() => {
    const fire = () => setKey((k) => k + 1)
    window.addEventListener("ds:cart-burst", fire)
    return () => window.removeEventListener("ds:cart-burst", fire)
  }, [])

  if (reduced || key === 0) return null

  return (
    <AnimatePresence>
      <span key={key} aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
        <motion.span
          initial={{ scale: 0.6, opacity: 0.8 }}
          animate={{ scale: 2.1, opacity: 0 }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="absolute size-10 rounded-full border-2 border-primary"
        />
        {Array.from({ length: PARTICLES }).map((_, i) => {
          const angle = (i / PARTICLES) * Math.PI * 2
          const dist = 28 + (i % 3) * 8
          return (
            <motion.span
              key={i}
              initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
              animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, scale: 0.2, opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="absolute size-2 rounded-full bg-primary"
              style={{ width: i % 2 ? 6 : 8, height: i % 2 ? 6 : 8 }}
            />
          )
        })}
      </span>
    </AnimatePresence>
  )
}

/** Animated check mark that draws itself. Use in "Added" states. */
export function DrawnCheck({ size = 14, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <motion.path
        d="M4 12.5l5 5L20 6.5"
        stroke="currentColor"
        strokeWidth={3}
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      />
    </svg>
  )
}

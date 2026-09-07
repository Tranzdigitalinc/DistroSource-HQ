"use client"

import { useRef, type ReactNode } from "react"
import { motion, useMotionValue, useReducedMotion, useSpring } from "motion/react"

/**
 * Magnetic wrapper: the child drifts a few pixels toward the cursor and
 * springs back on leave. Subtle (max 8 px) — it should feel like the button
 * wants to be pressed, not like it is running away.
 */
export function Magnetic({ children, strength = 0.28, className }: { children: ReactNode; strength?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 260, damping: 18, mass: 0.4 })
  const sy = useSpring(y, { stiffness: 260, damping: 18, mass: 0.4 })

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{ x: sx, y: sy, display: "inline-block" }}
      onMouseMove={(e) => {
        if (reduced || !ref.current) return
        const r = ref.current.getBoundingClientRect()
        const dx = e.clientX - (r.left + r.width / 2)
        const dy = e.clientY - (r.top + r.height / 2)
        x.set(Math.max(-8, Math.min(8, dx * strength)))
        y.set(Math.max(-8, Math.min(8, dy * strength)))
      }}
      onMouseLeave={() => {
        x.set(0)
        y.set(0)
      }}
    >
      {children}
    </motion.div>
  )
}

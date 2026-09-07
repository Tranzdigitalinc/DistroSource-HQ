"use client"

import { useEffect, type ReactNode } from "react"
import Lenis from "lenis"

/**
 * Smooth, inertial scrolling for the whole storefront. Disabled when the
 * user asks for reduced motion and inside scrollable overlays (drawers,
 * dialogs), which Lenis leaves alone because they are separate scroll
 * containers.
 */
export function LenisProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const lenis = new Lenis({ lerp: 0.11, wheelMultiplier: 1, smoothWheel: true })
    let frame = 0
    const raf = (time: number) => {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }
    frame = requestAnimationFrame(raf)
    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [])

  return <>{children}</>
}

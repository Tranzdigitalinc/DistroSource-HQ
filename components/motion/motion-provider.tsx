"use client"

import type { ReactNode } from "react"
import { MotionConfig } from "motion/react"

/**
 * Globally respects the user's OS-level "reduce motion" preference for
 * every motion/react animation in the app.
 */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>
}

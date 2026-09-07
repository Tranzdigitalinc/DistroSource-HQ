"use client"

import type { ReactNode } from "react"
import { cn } from "@/lib/utils"

/**
 * Infinite marquee driven by CSS (see `--animate-marquee` in globals.css).
 * Content is duplicated so the loop is seamless; pauses on hover when
 * `pauseOnHover` is set; stops entirely under reduced motion.
 */
export function Marquee({
  children,
  className,
  duration = 40,
  reverse = false,
  pauseOnHover = false,
  gap = "1rem",
}: {
  children: ReactNode
  className?: string
  duration?: number
  reverse?: boolean
  pauseOnHover?: boolean
  gap?: string
}) {
  return (
    <div className={cn("group flex overflow-hidden", className)} style={{ "--gap": gap, "--duration": `${duration}s` } as React.CSSProperties}>
      {[0, 1].map((i) => (
        <div
          key={i}
          aria-hidden={i === 1}
          className={cn(
            "flex shrink-0 items-center gap-[var(--gap)] pr-[var(--gap)] motion-reduce:animate-none",
            reverse ? "animate-marquee [animation-direction:reverse]" : "animate-marquee",
            pauseOnHover && "group-hover:[animation-play-state:paused]",
          )}
        >
          {children}
        </div>
      ))}
    </div>
  )
}

"use client"

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import { ChevronLeft, ChevronRight, ICON_SIZE } from "@/lib/storefront-icons"
import { cn } from "@/lib/utils"

/**
 * A horizontal rail: native scroll-snap for touch and trackpads, prev/next
 * buttons for mouse and keyboard. No carousel library — the browser does
 * the physics, so it stays at 60 fps on any device.
 *
 * Children set their own width (e.g. `w-[16rem]`); the rail handles
 * snapping, gutters and the edge fade.
 */
export interface RailApi {
  prev: () => void
  next: () => void
  canPrev: boolean
  canNext: boolean
}

export function ScrollRail({
  children,
  className,
  itemClassName,
  ariaLabel,
  controls,
}: {
  children: ReactNode
  className?: string
  itemClassName?: string
  ariaLabel: string
  /** Where to render the arrow buttons. Defaults to inside the rail's header slot via `controls`. */
  controls?: React.ComponentType<RailApi>
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(false)

  const update = useCallback(() => {
    const el = ref.current
    if (!el) return
    setCanPrev(el.scrollLeft > 4)
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    update()
    el.addEventListener("scroll", update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => {
      el.removeEventListener("scroll", update)
      ro.disconnect()
    }
  }, [update])

  const scrollBy = useCallback((dir: 1 | -1) => {
    const el = ref.current
    if (!el) return
    el.scrollBy({ left: dir * Math.max(240, el.clientWidth * 0.8), behavior: "smooth" })
  }, [])
  const prev = useCallback(() => scrollBy(-1), [scrollBy])
  const next = useCallback(() => scrollBy(1), [scrollBy])
  const Controls = controls

  return (
    <div className={cn("relative", className)}>
      {Controls ? <Controls prev={prev} next={next} canPrev={canPrev} canNext={canNext} /> : null}
      <div
        ref={ref}
        role="region"
        aria-label={ariaLabel}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") scrollBy(1)
          if (e.key === "ArrowLeft") scrollBy(-1)
        }}
        className={cn(
          "no-scrollbar -mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-px-5 px-5 pb-2 pt-1 sm:-mx-8 sm:scroll-px-8 sm:px-8",
          "focus-visible:outline-none [&>*]:shrink-0 [&>*]:snap-start",
          itemClassName,
        )}
      >
        {children}
      </div>
    </div>
  )
}

/** Matching prev/next pair, usually placed in a section header. */
export function RailControls({ prev, next, canPrev, canNext, className }: { prev: () => void; next: () => void; canPrev: boolean; canNext: boolean; className?: string }) {
  const btn =
    "flex size-9 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-border-strong hover:bg-secondary disabled:opacity-35 disabled:hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <button type="button" onClick={prev} disabled={!canPrev} aria-label="Scroll back" className={btn}>
        <ChevronLeft size={ICON_SIZE.base} aria-hidden="true" />
      </button>
      <button type="button" onClick={next} disabled={!canNext} aria-label="Scroll forward" className={btn}>
        <ChevronRight size={ICON_SIZE.base} aria-hidden="true" />
      </button>
    </div>
  )
}

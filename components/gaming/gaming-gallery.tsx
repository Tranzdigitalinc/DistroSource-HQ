"use client"

import { useCallback, useRef, useState } from "react"
import { GamingImage } from "@/components/gaming/gaming-image"
import type { GamingMedia } from "@/lib/gaming/catalog/types"
import { ArrowLeft, ArrowRight } from "@/lib/storefront-icons"
import { cn } from "@/lib/utils"

interface GamingGalleryProps {
  media: GamingMedia[]
  title: string
}

/**
 * Product gallery: one large stage plus thumbnails.
 *
 * Handles images today and real videos when a product has one; nothing is
 * shown that the catalogue does not hold. Arrow keys work when the stage has
 * focus, and a horizontal swipe changes image on touch screens.
 */
export function GamingGallery({ media, title }: GamingGalleryProps) {
  const [index, setIndex] = useState(0)
  const touchX = useRef<number | null>(null)
  const count = media.length
  const go = useCallback((next: number) => setIndex((next + count) % count), [count])
  const active = media[index]
  if (!active) return null

  const thumbOf = (m: GamingMedia) => (m.kind === "video" ? m.poster : m)

  return (
    <div className="flex flex-col gap-3">
      <div
        className="group relative aspect-[16/10] overflow-hidden rounded-xl bg-navy outline-none focus-visible:ring-2 focus-visible:ring-ring"
        tabIndex={0}
        role="region"
        aria-roledescription="carousel"
        aria-label={`${title} gallery`}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") go(index + 1)
          if (e.key === "ArrowLeft") go(index - 1)
        }}
        onTouchStart={(e) => {
          touchX.current = e.touches[0]?.clientX ?? null
        }}
        onTouchEnd={(e) => {
          const start = touchX.current
          const end = e.changedTouches[0]?.clientX
          touchX.current = null
          if (start == null || end == null || Math.abs(end - start) < 40) return
          go(end < start ? index + 1 : index - 1)
        }}
      >
        {active.kind === "video" ? (
          <video
            key={active.src}
            src={active.src}
            poster={active.poster.src}
            controls
            playsInline
            preload="metadata"
            className="h-full w-full object-cover"
          />
        ) : (
          <GamingImage
            key={active.src}
            image={active}
            sizes="(min-width: 1024px) 58vw, 100vw"
            priority={index === 0}
            className="h-full w-full object-cover"
          />
        )}

        {count > 1 && (
          <>
            <button
              type="button"
              onClick={() => go(index - 1)}
              className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/65 focus-visible:opacity-100 group-hover:opacity-100 max-lg:opacity-100"
              aria-label="Previous image"
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => go(index + 1)}
              className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white opacity-0 backdrop-blur-sm transition-opacity hover:bg-black/65 focus-visible:opacity-100 group-hover:opacity-100 max-lg:opacity-100"
              aria-label="Next image"
            >
              <ArrowRight size={18} aria-hidden="true" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-md bg-black/55 px-2 py-1 font-mono text-[11px] font-semibold tabular-nums text-white backdrop-blur-sm" aria-live="polite">
              {index + 1} / {count}
            </span>
          </>
        )}
      </div>

      {active.caption && <p className="font-mono text-[11px] uppercase tracking-[0.1em] text-muted-foreground">{active.caption}</p>}

      {count > 1 && (
        <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4" aria-label="Gallery thumbnails">
          {media.map((m, i) => {
            const thumb = thumbOf(m)
            return (
              <li key={thumb.src}>
                <button
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show image ${i + 1} of ${count}`}
                  aria-current={i === index}
                  className={cn(
                    "relative block aspect-[16/10] w-full overflow-hidden rounded-lg border-2 bg-navy transition-[border-color,opacity]",
                    i === index ? "border-primary" : "border-transparent opacity-70 hover:opacity-100",
                  )}
                >
                  <GamingImage image={thumb} sizes="(min-width: 1024px) 14vw, 30vw" className="h-full w-full object-cover" />
                  {m.kind === "video" && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/25 font-mono text-[10px] font-bold uppercase text-white">Video</span>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

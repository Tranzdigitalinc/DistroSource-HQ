"use client"

/* eslint-disable @next/next/no-img-element -- images are served through the
   storefront's own proxy with `images.unoptimized`; next/image would add cost
   without benefit here (see component note below). */

import { useCallback, useEffect, useState } from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel"
import { ChevronLeft, ChevronRight, Close, ImageOff, Search, ICON_SIZE } from "@/lib/storefront-icons"
import { cn } from "@/lib/utils"

interface ProductGalleryProps {
  images: string[]
  alt: string
}

/**
 * Product gallery: large primary preview, a thumbnail rail of every image,
 * prev/next, keyboard navigation, and a full-screen lightbox.
 *
 * The previous version only showed images 2–5 as thumbnails, so the hero
 * image could never be re-selected once another was chosen. Every image now
 * has a thumbnail, with a visible selected state.
 *
 * Images are plain <img>: the storefront serves them through its own proxy
 * and `images.unoptimized` is set, so next/image would add cost without
 * benefit here.
 */
export function ProductGallery({ images, alt }: ProductGalleryProps) {
  const [failed, setFailed] = useState<string[]>([])
  const [index, setIndex] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const [api, setApi] = useState<CarouselApi>()

  const available = images.filter((src) => !failed.includes(src))
  const safeIndex = Math.min(index, Math.max(0, available.length - 1))
  const hero = available[safeIndex]

  const markFailed = useCallback((src: string) => {
    setFailed((current) => (current.includes(src) ? current : [...current, src]))
  }, [])

  const go = useCallback(
    (delta: number) => {
      if (available.length < 2) return
      setIndex((i) => (i + delta + available.length) % available.length)
    },
    [available.length],
  )

  // Keyboard: arrows move, Escape closes the lightbox. Only active while the
  // gallery region has focus or the lightbox is open, so it never hijacks
  // arrow keys elsewhere on the page.
  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") go(-1)
      if (e.key === "ArrowRight") go(1)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [lightbox, go])

  // Keep the mobile carousel in step with the selected index.
  useEffect(() => {
    if (!api) return
    api.scrollTo(safeIndex)
  }, [api, safeIndex])

  useEffect(() => {
    if (!api) return
    const sync = () => setIndex(api.selectedScrollSnap())
    api.on("select", sync)
    return () => {
      api.off("select", sync)
    }
  }, [api])

  if (!hero) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-lg border border-border bg-secondary/60 text-muted-foreground/50">
        <ImageOff size={40} aria-hidden="true" />
        <span className="sr-only">Product images unavailable</span>
      </div>
    )
  }

  const counter = `${safeIndex + 1} / ${available.length}`

  return (
    <div className="flex flex-col gap-3">
      {/* ---- Desktop: primary view ---- */}
      <div
        className="group relative hidden aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-secondary/40 md:block"
        role="region"
        aria-roledescription="image viewer"
        aria-label={`${alt} gallery`}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft") go(-1)
          if (e.key === "ArrowRight") go(1)
        }}
        tabIndex={0}
      >
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="block h-full w-full cursor-zoom-in focus-visible:outline-none"
          aria-label="Open full-size preview"
        >
          <img
            src={hero}
            alt={`${alt} — preview ${safeIndex + 1}`}
            className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.015] motion-reduce:transition-none"
            onError={() => markFailed(hero)}
          />
        </button>

        {available.length > 1 && (
          <>
            <NavButton side="left" onClick={() => go(-1)} />
            <NavButton side="right" onClick={() => go(1)} />
          </>
        )}

        <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-background/90 px-2.5 py-1 font-mono text-[10.5px] font-medium text-foreground shadow-[var(--shadow-e1)]">
          {counter}
        </span>
        <span className="pointer-events-none absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-background/90 px-2.5 py-1 text-[11px] font-medium text-foreground opacity-0 shadow-[var(--shadow-e1)] transition-opacity group-hover:opacity-100 motion-reduce:transition-none">
          <Search size={12} aria-hidden="true" />
          Zoom
        </span>
      </div>

      {/* ---- Mobile: swipeable ---- */}
      <div className="md:hidden">
        <Carousel setApi={setApi} opts={{ loop: available.length > 1 }} className="overflow-hidden rounded-lg border border-border bg-secondary/40">
          <CarouselContent className="-ml-0">
            {available.map((src, i) => (
              <CarouselItem key={src} className="pl-0">
                <button
                  type="button"
                  onClick={() => setLightbox(true)}
                  className="block aspect-[4/3] w-full"
                  aria-label={`Open preview ${i + 1} full size`}
                >
                  <img src={src} alt={`${alt} — preview ${i + 1}`} className="h-full w-full object-contain" onError={() => markFailed(src)} />
                </button>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
        {available.length > 1 && (
          <div className="mt-2 flex items-center justify-center gap-1.5" aria-hidden="true">
            {available.map((src, i) => (
              <span
                key={src}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === safeIndex ? "w-5 bg-primary" : "w-1.5 bg-border",
                )}
              />
            ))}
          </div>
        )}
      </div>

      {/* ---- Thumbnail rail (all images) ---- */}
      {available.length > 1 && (
        <div className="hidden gap-2 md:grid md:grid-cols-5" role="tablist" aria-label="Product previews">
          {available.map((src, i) => {
            const active = i === safeIndex
            return (
              <button
                type="button"
                key={src}
                role="tab"
                aria-selected={active}
                aria-label={`Preview ${i + 1} of ${available.length}`}
                onClick={() => setIndex(i)}
                className={cn(
                  "relative aspect-[4/3] overflow-hidden rounded-md border bg-secondary/40 transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
                  active ? "border-primary ring-1 ring-primary" : "border-border hover:border-border-strong",
                )}
              >
                <img src={src} alt="" className="h-full w-full object-contain" onError={() => markFailed(src)} />
              </button>
            )
          })}
        </div>
      )}

      {/* ---- Lightbox ---- */}
      <Dialog open={lightbox} onOpenChange={setLightbox}>
        <DialogContent
          showCloseButton={false}
          className="h-[92vh] w-[96vw] max-w-[96vw] gap-0 overflow-hidden rounded-lg bg-background p-0 sm:max-w-[96vw]"
        >
          <DialogTitle className="sr-only">{alt} — full-size preview</DialogTitle>

          <div className="flex h-12 shrink-0 items-center justify-between border-b border-border px-4">
            <span className="truncate text-sm font-medium text-foreground">{alt}</span>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">{counter}</span>
              <button
                type="button"
                onClick={() => setLightbox(false)}
                className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Close preview"
              >
                <Close size={ICON_SIZE.base} aria-hidden="true" />
              </button>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center bg-secondary/40 p-4">
            <img
              src={hero}
              alt={`${alt} — preview ${safeIndex + 1}`}
              className="max-h-full max-w-full object-contain"
              onError={() => markFailed(hero)}
            />
            {available.length > 1 && (
              <>
                <NavButton side="left" onClick={() => go(-1)} large />
                <NavButton side="right" onClick={() => go(1)} large />
              </>
            )}
          </div>

          {available.length > 1 && (
            <div className="flex h-20 shrink-0 items-center gap-2 overflow-x-auto border-t border-border px-4">
              {available.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  onClick={() => setIndex(i)}
                  aria-label={`Show preview ${i + 1}`}
                  className={cn(
                    "h-12 w-16 shrink-0 overflow-hidden rounded border bg-secondary/40",
                    i === safeIndex ? "border-primary ring-1 ring-primary" : "border-border",
                  )}
                >
                  <img src={src} alt="" className="h-full w-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function NavButton({ side, onClick, large = false }: { side: "left" | "right"; onClick: () => void; large?: boolean }) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      aria-label={side === "left" ? "Previous preview" : "Next preview"}
      className={cn(
        "absolute top-1/2 flex -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/95 text-foreground shadow-[var(--shadow-e2)] transition-all",
        "hover:bg-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        large ? "size-11" : "size-9 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 motion-reduce:opacity-100",
        side === "left" ? "left-3" : "right-3",
      )}
    >
      <Icon size={large ? ICON_SIZE.nav : ICON_SIZE.base} aria-hidden="true" />
    </button>
  )
}

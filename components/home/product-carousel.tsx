"use client"

import { useCallback, useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import Autoplay from "embla-carousel-autoplay"
import { ProductCard } from "@/components/product/product-card"
import { PageHeader, SectionLink } from "@/components/page-header"
import { Reveal } from "@/components/motion/reveal"
import { ChevronLeft, ChevronRight, ICON_SIZE } from "@/lib/storefront-icons"
import type { getProducts } from "@/lib/queries/catalog"
import { cn } from "@/lib/utils"

/**
 * Auto-advancing product carousel (Embla + autoplay). Drag on touch, arrows
 * and keyboard for pointer users, a progress bar that shows the autoplay
 * cadence; pauses on hover/focus and under reduced motion.
 */
export function ProductCarousel({
  eyebrow,
  title,
  subtitle,
  href,
  items,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
  href: string
  items: Awaited<ReturnType<typeof getProducts>>
}) {
  const [autoplay] = useState(() => Autoplay({ delay: 3800, stopOnInteraction: false, stopOnMouseEnter: true }))
  const [emblaRef, embla] = useEmblaCarousel({ align: "start", loop: true, dragFree: false, skipSnaps: false }, [autoplay])
  const [selected, setSelected] = useState(0)
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) autoplay.stop()
  }, [autoplay])

  useEffect(() => {
    if (!embla) return
    const sync = () => {
      setSelected(embla.selectedScrollSnap())
      setCount(embla.scrollSnapList().length)
    }
    sync()
    embla.on("select", sync).on("reInit", sync)
    return () => {
      embla.off("select", sync).off("reInit", sync)
    }
  }, [embla])

  const prev = useCallback(() => embla?.scrollPrev(), [embla])
  const next = useCallback(() => embla?.scrollNext(), [embla])

  if (items.length === 0) return null

  const btn =
    "flex size-10 items-center justify-center rounded-full border border-border bg-background text-foreground transition-colors hover:border-border-strong hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

  return (
    <section className="container-x py-14 sm:py-20">
      <Reveal className="mb-8">
        <PageHeader
          size="section"
          eyebrow={eyebrow}
          title={title}
          description={subtitle}
          action={
            <>
              <div className="hidden items-center gap-2 sm:flex">
                <button type="button" onClick={prev} aria-label="Previous" className={btn}>
                  <ChevronLeft size={ICON_SIZE.base} weight="bold" aria-hidden="true" />
                </button>
                <button type="button" onClick={next} aria-label="Next" className={btn}>
                  <ChevronRight size={ICON_SIZE.base} weight="bold" aria-hidden="true" />
                </button>
              </div>
              <SectionLink href={href}>View all</SectionLink>
            </>
          }
        />
      </Reveal>

      <div ref={emblaRef} className="-mx-5 overflow-hidden px-5 sm:-mx-8 sm:px-8" aria-roledescription="carousel" aria-label={title}>
        <div className="flex touch-pan-y gap-4">
          {items.map((item) => (
            <div key={item.product.id} className="w-[16.5rem] shrink-0 sm:w-[18rem]">
              <ProductCard item={item} sizes="18rem" />
            </div>
          ))}
        </div>
      </div>

      {count > 1 && (
        <div className="mt-6 flex items-center gap-1.5" aria-hidden="true">
          {Array.from({ length: count }).map((_, i) => (
            <button
              key={i}
              type="button"
              tabIndex={-1}
              onClick={() => embla?.scrollTo(i)}
              className={cn("h-1.5 rounded-full transition-all duration-300", i === selected ? "w-8 bg-primary" : "w-1.5 bg-border hover:bg-border-strong")}
            />
          ))}
        </div>
      )}
    </section>
  )
}

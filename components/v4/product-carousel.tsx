"use client"

import Link from "next/link"
import useEmblaCarousel from "embla-carousel-react"
import { motion } from "motion/react"
import { useCallback, useEffect, useState } from "react"
import { ArrowLeft, ArrowRight } from "@/lib/storefront-icons"
import { V4ProductCard, type V4ProductCardData } from "@/components/v4/product-card"

export function V4ProductCarousel({
  eyebrow,
  title,
  description,
  href,
  items,
  featuredFirst = false,
}: {
  eyebrow: string
  title: string
  description?: string
  href: string
  items: V4ProductCardData[]
  featuredFirst?: boolean
}) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ align: "start", dragFree: true, containScroll: "trimSnaps" })
  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)

  const sync = useCallback(() => {
    if (!emblaApi) return
    setCanPrev(emblaApi.canScrollPrev())
    setCanNext(emblaApi.canScrollNext())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    sync()
    emblaApi.on("select", sync)
    emblaApi.on("reInit", sync)
    emblaApi.on("scroll", sync)
    return () => {
      emblaApi.off("select", sync)
      emblaApi.off("reInit", sync)
      emblaApi.off("scroll", sync)
    }
  }, [emblaApi, sync])

  if (!items.length) return null

  return (
    <section className="overflow-hidden py-16 sm:py-20 lg:py-24">
      <div className="mx-auto max-w-[1540px] px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <p className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-primary">{eyebrow}</p>
            <h2 className="mt-3 font-display text-[clamp(2rem,4.2vw,4.4rem)] font-black leading-[0.95] tracking-[-0.055em] text-foreground">{title}</h2>
            {description && <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">{description}</p>}
          </div>
          <div className="flex items-center gap-2">
            <Link href={href} className="mr-2 hidden text-sm font-semibold text-foreground underline-offset-4 hover:underline sm:block">View all</Link>
            <button
              type="button"
              onClick={() => emblaApi?.scrollPrev()}
              disabled={!canPrev}
              className="flex size-11 items-center justify-center rounded-full border border-border transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Previous products"
            >
              <ArrowLeft size={16} />
            </button>
            <button
              type="button"
              onClick={() => emblaApi?.scrollNext()}
              disabled={!canNext}
              className="flex size-11 items-center justify-center rounded-full border border-border transition-colors hover:bg-foreground hover:text-background disabled:cursor-not-allowed disabled:opacity-30"
              aria-label="Next products"
            >
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div ref={emblaRef} className="overflow-hidden pl-[max(1rem,calc((100vw-1540px)/2+2rem))]">
        <div className="flex touch-pan-y gap-4 pr-4 sm:gap-5 sm:pr-6 lg:gap-6 lg:pr-8">
          {items.slice(0, 12).map((item, index) => {
            const feature = featuredFirst && index === 0
            return (
              <motion.div
                key={item.product.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: Math.min(index * 0.035, 0.2) }}
                className={feature ? "min-w-0 flex-[0_0_82vw] sm:flex-[0_0_62vw] lg:flex-[0_0_47vw]" : "min-w-0 flex-[0_0_72vw] sm:flex-[0_0_40vw] md:flex-[0_0_31vw] lg:flex-[0_0_24vw] xl:flex-[0_0_21vw]"}
              >
                <V4ProductCard item={item} variant={feature ? "feature" : "standard"} />
              </motion.div>
            )
          })}
        </div>
      </div>

      <div className="mx-auto mt-7 max-w-[1540px] px-4 sm:hidden">
        <Link href={href} className="inline-flex items-center gap-2 text-sm font-semibold">View all <ArrowRight size={14} /></Link>
      </div>
    </section>
  )
}

"use client"

import Link from "next/link"
import Image from "next/image"
import { useRef } from "react"
import { motion, useScroll, useTransform } from "motion/react"
import { hasRealImages, resolveGamingImage } from "@/lib/gaming/images"
import { PLATFORM_LABEL, type GamingProduct } from "@/lib/gaming/types"
import { formatUsd } from "@/lib/format"
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal"
import { Magnetic } from "@/components/motion/magnetic"
import { ArrowRight, GameController, ICON_SIZE } from "@/lib/storefront-icons"

/**
 * Gaming as a cinematic navy band: the screenshots parallax against the
 * scroll, the copy sits on the left with the one orange CTA.
 */
export function GamingTeaser({ products }: { products: GamingProduct[] }) {
  const ref = useRef<HTMLElement>(null)
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] })
  const yA = useTransform(scrollYProgress, [0, 1], [40, -40])
  const yB = useTransform(scrollYProgress, [0, 1], [-30, 30])

  if (products.length === 0) return null
  const left = products.filter((_, i) => i % 2 === 0)
  const right = products.filter((_, i) => i % 2 === 1)

  return (
    <section ref={ref} className="grain relative overflow-hidden bg-navy-deep text-navy-foreground">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="mesh-blob animate-mesh-2 left-[-10%] top-[10%] h-[30rem] w-[30rem] bg-primary/25" />
        <div className="mesh-blob animate-mesh-1 bottom-[-20%] right-[10%] h-[26rem] w-[26rem] bg-[oklch(0.5_0.12_260)]/40" />
      </div>

      <div className="container-x relative grid gap-12 py-20 sm:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <Reveal className="flex flex-col items-start gap-6 self-center">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-navy-foreground/10 text-primary">
            <GameController size={ICON_SIZE.feature} weight="duotone" aria-hidden="true" />
          </span>
          <p className="eyebrow text-navy-foreground/60">DistroSource Gaming</p>
          <h2 className="text-display text-4xl sm:text-5xl">Built for the servers you run.</h2>
          <p className="max-w-md text-pretty text-base leading-relaxed text-navy-foreground/70">
            FiveM maps and MLOs, Minecraft server packs, interfaces, vehicles and configurations — every product sold directly by DistroSource, with real screenshots of what you get.
          </p>
          <Magnetic>
            <Link
              href="/gaming"
              className="group inline-flex h-12 items-center gap-2 rounded-full bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-[0_12px_40px_-10px_var(--primary)] transition-shadow hover:shadow-[0_18px_50px_-10px_var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-navy-deep"
            >
              Explore Gaming
              <ArrowRight size={ICON_SIZE.base} weight="bold" className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
            </Link>
          </Magnetic>
        </Reveal>

        <RevealGroup className="grid grid-cols-2 gap-4" stagger={0.08}>
          <motion.div style={{ y: yA }} className="flex flex-col gap-4">
            {left.map((p) => (
              <RevealItem key={p.id}>
                <GamingTile product={p} />
              </RevealItem>
            ))}
          </motion.div>
          <motion.div style={{ y: yB }} className="mt-10 flex flex-col gap-4">
            {right.map((p) => (
              <RevealItem key={p.id}>
                <GamingTile product={p} />
              </RevealItem>
            ))}
          </motion.div>
        </RevealGroup>
      </div>
    </section>
  )
}

function GamingTile({ product }: { product: GamingProduct }) {
  const real = hasRealImages(product.images)
  return (
    <Link
      href={`/gaming/product/${product.slug}`}
      className="group block overflow-hidden rounded-2xl border border-navy-foreground/10 bg-navy/70 transition-[border-color,transform] duration-200 hover:-translate-y-1 hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary motion-reduce:hover:translate-y-0"
    >
      <span className="relative block aspect-[16/10] overflow-hidden bg-navy-deep">
        {real && (
          <Image src={resolveGamingImage(product.cardImage ?? product.images[0])} alt="" fill sizes="(max-width: 640px) 50vw, 30vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.05] motion-reduce:transition-none" />
        )}
      </span>
      <span className="flex items-center justify-between gap-3 px-4 py-3">
        <span className="min-w-0">
          <span className="block font-mono text-[10px] font-semibold uppercase tracking-[0.12em] text-navy-foreground/50">{PLATFORM_LABEL[product.platform]}</span>
          <span className="line-clamp-1 text-sm font-semibold">{product.title}</span>
        </span>
        <span className="shrink-0 font-display text-base font-bold tabular-nums">{formatUsd(product.price)}</span>
      </span>
    </Link>
  )
}

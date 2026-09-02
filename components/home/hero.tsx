"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { PriceDisplay } from "@/components/price-display"
import { AuroraBackground } from "@/components/velora/aurora-background"
import { Particles } from "@/components/velora/particles"
import { AnimatedGradientText } from "@/components/velora/animated-gradient-text"
import { Typewriter } from "@/components/velora/typewriter"
import { NumberTicker } from "@/components/velora/number-ticker"
import { BorderBeam } from "@/components/velora/border-beam"
import { ArrowRight, Sparkles, Star, ImageOff } from "lucide-react"
import type { ProductCardData } from "@/components/product/product-card"

interface HeroStats {
  productCount: number
  categoryCount: number
  reviewCount: number
  avgRating: number
}

function formatCount(value: number) {
  if (value >= 1000) return `${Math.floor(value / 100) / 10}k`
  return `${value}`
}

const EASE = [0.16, 1, 0.3, 1] as const

const item = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
}

function MarqueeCard({ data, index }: { data: ProductCardData; index: number }) {
  const image = data.product.thumbnailUrl ?? data.product.coverImageUrl ?? data.images[0]?.url ?? null
  const isFree = data.product.isFree || data.startingPrice === 0

  return (
    <Link
      href={`/products/${data.product.slug}`}
      className="group/mc flex w-[168px] shrink-0 flex-col border-r border-border bg-card transition-colors hover:bg-secondary/60 sm:w-[192px]"
    >
      <div className="relative aspect-square w-full overflow-hidden border-b border-border bg-secondary">
        <span className="absolute left-0 top-0 z-10 flex size-5 items-center justify-center bg-navy/80 font-mono text-[9px] font-semibold text-navy-foreground">
          {String((index % 999) + 1).padStart(2, "0")}
        </span>
        {image ? (
          <Image
            src={image || "/placeholder.svg"}
            alt={data.product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover/mc:scale-[1.04]"
            sizes="192px"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
            <ImageOff className="size-6" />
          </div>
        )}
      </div>
      <div className="flex flex-col gap-1 p-2.5">
        <span className="font-mono text-[9.5px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          {data.category.name}
        </span>
        <h3 className="line-clamp-1 text-xs font-semibold leading-snug text-foreground">{data.product.name}</h3>
        <span className="font-mono text-sm font-bold text-foreground">
          {isFree ? "Free" : <PriceDisplay usdAmount={data.startingPrice} />}
        </span>
      </div>
    </Link>
  )
}

export function Hero({ stats, products }: { stats: HeroStats; products: ProductCardData[] }) {
  const marqueeItems = products.length > 0 ? [...products, ...products] : []

  return (
    <section className="relative overflow-hidden border-b border-border bg-hero">
      {/* Velora aurora backdrop, tinted to the amber brand gradient, kept subtle behind the grid */}
      <AuroraBackground intensity="subtle" />
      <Particles quantity={70} className="opacity-70" />

      {/* Fine grid texture — the catalog identity's graph-paper base */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.4] [mask-image:radial-gradient(120%_90%_at_50%_0%,black,transparent_72%)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <motion.div
        initial="hidden"
        animate="visible"
        transition={{ staggerChildren: 0.03, delayChildren: 0 }}
        className="relative mx-auto flex max-w-3xl flex-col items-center gap-6 px-4 pt-16 pb-10 text-center sm:px-8 lg:pt-24 lg:pb-14"
      >
        <motion.span
          variants={item}
          transition={{ duration: 0.2, ease: EASE }}
          className="flex w-fit items-center gap-2 border border-border px-3 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-foreground"
        >
          <span className="size-1.5 rounded-full bg-primary" />
          Everything digital. One source.
        </motion.span>

        <motion.h1
          variants={item}
          transition={{ duration: 0.2, ease: EASE }}
          className="font-display text-5xl font-black leading-[0.98] tracking-tight text-hero-foreground text-balance sm:text-6xl lg:text-[4.1rem]"
        >
          Digital assets, <AnimatedGradientText>unlocked in seconds</AnimatedGradientText>
        </motion.h1>

        <motion.p
          variants={item}
          transition={{ duration: 0.2, ease: EASE }}
          className="max-w-lg text-lg leading-relaxed text-muted-foreground text-pretty"
        >
          <Typewriter
            words={[
              "Templates, fonts, and presentations.",
              "Notion systems and 3D assets.",
              "One department store for digital products.",
            ]}
            className="text-lg text-foreground"
          />{" "}
          Instant access to every download in your library.
        </motion.p>

        <motion.div
          variants={item}
          transition={{ duration: 0.2, ease: EASE }}
          className="flex w-full flex-wrap items-center justify-center gap-3"
        >
          <Link
            href="/products"
            className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-[4px] bg-primary px-8 font-mono text-sm font-semibold uppercase tracking-[0.04em] text-primary-foreground shadow-lg shadow-primary/30 transition-[transform,box-shadow] duration-300 hover:scale-[1.03] hover:shadow-xl hover:shadow-primary/40 active:scale-[0.98]"
          >
            <BorderBeam size={48} duration={5} />
            <span className="relative z-10 inline-flex items-center gap-2">
              Shop all products
              <ArrowRight className="size-4" />
            </span>
            <span
              aria-hidden
              className="animate-shimmer absolute inset-0 bg-[linear-gradient(110deg,transparent_30%,rgba(255,255,255,0.35)_50%,transparent_70%)] bg-[length:250%_100%]"
            />
          </Link>
          <Button
            size="lg"
            variant="outline"
            nativeButton={false}
            className="h-12 rounded-[4px] border-border-strong bg-transparent px-8 font-mono text-sm font-semibold uppercase tracking-[0.04em] text-foreground transition-colors hover:bg-secondary active:scale-[0.98]"
            render={<Link href="/deals" />}
          >
            <Sparkles className="size-4 text-primary" />
            View today&apos;s deals
          </Button>
        </motion.div>

        <motion.div
          variants={item}
          transition={{ duration: 0.2, ease: EASE }}
          className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1.5 font-mono text-[11px] font-medium uppercase tracking-[0.05em] text-muted-foreground"
        >
          <span className="flex items-center gap-1">
            <NumberTicker value={stats.productCount} className="text-foreground" />+ products
          </span>
          <span className="text-border">/</span>
          <span className="flex items-center gap-1">
            <NumberTicker value={stats.categoryCount} className="text-foreground" /> categories
          </span>
          <span className="text-border">/</span>
          <span className="flex items-center gap-1">
            {stats.avgRating.toFixed(1)}
            <Star className="size-3 fill-primary text-primary" />
            avg rating
          </span>
          <span className="text-border">/</span>
          <span className="flex items-center gap-1">
            <NumberTicker value={stats.reviewCount} className="text-foreground" />+ reviews
          </span>
        </motion.div>
      </motion.div>

      {marqueeItems.length > 0 && (
        <div className="relative border-t border-border">
          <div className="mx-auto flex max-w-7xl items-center justify-between px-4 pb-4 pt-6 sm:px-8">
            <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Fresh off the shelf
            </span>
            <Link
              href="/products"
              className="group flex items-center gap-1 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-primary hover:underline"
            >
              Browse all
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
          <div className="relative overflow-hidden border-y border-border">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-hero to-transparent sm:w-20"
            />
            <div
              aria-hidden
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-hero to-transparent sm:w-20"
            />
            <div className="flex w-max animate-marquee">
              {marqueeItems.map((data, i) => (
                <MarqueeCard key={`${data.product.id}-${i}`} data={data} index={i} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

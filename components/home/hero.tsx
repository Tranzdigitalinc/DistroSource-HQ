"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"
import { HeaderSearch } from "@/components/header/header-search"
import { ArrowRight, Download, ShieldCheck } from "@/lib/storefront-icons"

interface HeroStats {
  productCount: number
  categoryCount: number
  reviewCount: number
  avgRating: number
}

export interface HeroProduct {
  slug: string
  name: string
  imageUrl: string | null
}

const EASE = [0.16, 1, 0.3, 1] as const

export function Hero({ stats, products = [] }: { stats: HeroStats; products?: HeroProduct[] }) {
  const collage = products.filter((product) => product.imageUrl).slice(0, 3)

  return (
    <section className="relative overflow-hidden border-b border-border/70 bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[42rem] opacity-70"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, color-mix(in oklch, var(--primary) 13%, transparent), transparent 42%), linear-gradient(to bottom, color-mix(in oklch, var(--secondary) 65%, transparent), transparent 68%)",
        }}
      />

      <div className="relative mx-auto max-w-[94rem] px-4 pb-10 pt-16 text-center sm:px-6 sm:pt-20 lg:px-8 lg:pb-14 lg:pt-28">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mx-auto max-w-5xl"
        >
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-primary sm:text-xs">
            Digital products, curated with purpose
          </p>
          <h1 className="mt-5 font-display text-[clamp(3.4rem,8.2vw,8.4rem)] font-black leading-[0.86] tracking-[-0.075em] text-foreground text-balance">
            Everything digital.
            <span className="block text-primary">One source.</span>
          </h1>
          <p className="mx-auto mt-7 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
            A premium digital department store for business systems, design assets, development resources, fonts, gaming tools and ready-to-use creative products.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE, delay: 0.12 }}
          className="mx-auto mt-8 max-w-2xl"
        >
          <div className="rounded-2xl border border-border/80 bg-background/90 p-2 shadow-[0_18px_70px_-32px_color-mix(in_oklch,var(--foreground)_28%,transparent)] backdrop-blur">
            <HeaderSearch size="lg" />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
            <span>{stats.productCount.toLocaleString()} products</span>
            <span aria-hidden="true" className="size-1 rounded-full bg-border-strong" />
            <span>{stats.categoryCount} departments & categories</span>
            <span aria-hidden="true" className="size-1 rounded-full bg-border-strong" />
            <span className="inline-flex items-center gap-1.5"><Download size={13} /> Instant access</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck size={13} /> Clear licensing</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: EASE, delay: 0.2 }}
          className="mt-12 lg:mt-16"
        >
          <div className="mb-4 flex items-center justify-between border-b border-border/70 pb-3 text-left">
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">Selected from the catalog</p>
            <Link href="/products" className="group inline-flex items-center gap-1.5 text-xs font-semibold text-foreground hover:text-primary">
              Explore everything
              <ArrowRight size={13} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          {collage.length > 0 && (
            <div className="grid gap-3 md:grid-cols-12 md:gap-4">
              {collage.map((product, index) => (
                <Link
                  key={product.slug}
                  href={`/products/${product.slug}`}
                  className={
                    index === 0
                      ? "group relative overflow-hidden rounded-2xl border border-border bg-card md:col-span-6"
                      : "group relative overflow-hidden rounded-2xl border border-border bg-card md:col-span-3"
                  }
                >
                  <div className={index === 0 ? "relative aspect-[16/9] md:aspect-[16/10]" : "relative aspect-[4/3] md:aspect-[3/4]"}>
                    <Image
                      src={product.imageUrl!}
                      alt={product.name}
                      fill
                      priority={index === 0}
                      sizes={index === 0 ? "(max-width: 768px) 100vw, 50vw" : "(max-width: 768px) 100vw, 25vw"}
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.025] motion-reduce:transition-none"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent px-4 pb-4 pt-16 text-left text-white sm:px-5 sm:pb-5">
                      <p className="line-clamp-2 font-display text-sm font-bold leading-snug sm:text-base">{product.name}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  )
}

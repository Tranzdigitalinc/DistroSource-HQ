"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"
import { HeaderSearch } from "@/components/header/header-search"
import { ArrowRight, Download, Search, ShieldCheck, Sparkles } from "@/lib/storefront-icons"

const EASE = [0.16, 1, 0.3, 1] as const

type HeroProduct = { slug: string; name: string; imageUrl: string | null }
type Department = { slug: string; name: string; productCount: number }

export function V4Hero({
  products,
  departments,
  stats,
}: {
  products: HeroProduct[]
  departments: Department[]
  stats: { productCount: number; categoryCount: number }
}) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const smoothX = useSpring(x, { stiffness: 120, damping: 24, mass: 0.5 })
  const smoothY = useSpring(y, { stiffness: 120, damping: 24, mass: 0.5 })
  const rotateY = useTransform(smoothX, [-1, 1], [-2.2, 2.2])
  const rotateX = useTransform(smoothY, [-1, 1], [2.2, -2.2])
  const stageProducts = products.filter((product) => product.imageUrl).slice(0, 5)

  return (
    <section
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        x.set(((event.clientX - rect.left) / rect.width - 0.5) * 2)
        y.set(((event.clientY - rect.top) / rect.height - 0.5) * 2)
      }}
      onPointerLeave={() => {
        x.set(0)
        y.set(0)
      }}
      className="relative overflow-hidden border-b border-border bg-background"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -left-[18%] top-[4%] h-[46rem] w-[46rem] rounded-full bg-primary/[0.09] blur-[110px]" />
        <div className="absolute -right-[20%] top-[28%] h-[38rem] w-[38rem] rounded-full bg-primary/[0.07] blur-[120px]" />
        <div className="absolute inset-x-0 top-0 h-[60%] opacity-[0.34] [background-image:radial-gradient(circle_at_center,var(--border)_1px,transparent_1px)] [background-size:24px_24px] [mask-image:linear-gradient(to_bottom,black,transparent)]" />
      </div>

      <div className="relative mx-auto max-w-[1540px] px-4 pb-12 pt-14 sm:px-6 sm:pb-16 sm:pt-20 lg:px-8 lg:pb-24 lg:pt-24">
        <div className="mx-auto max-w-6xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="mx-auto inline-flex items-center gap-2 rounded-full border border-border bg-background/75 px-3.5 py-2 font-mono text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground shadow-sm backdrop-blur"
          >
            <Sparkles size={13} className="text-primary" />
            Digital products · endless possibilities
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.68, delay: 0.04, ease: EASE }}
            className="mx-auto mt-7 max-w-[1100px] font-display text-[clamp(3.4rem,9vw,8.6rem)] font-black leading-[0.82] tracking-[-0.08em] text-foreground"
          >
            Everything digital.
            <span className="block bg-gradient-to-r from-primary via-primary to-amber-300 bg-clip-text pb-2 text-transparent">One source.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.52, delay: 0.13, ease: EASE }}
            className="mx-auto mt-7 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8"
          >
            A curated digital department store for work, design, development, gaming, and everything you build next.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.58, delay: 0.18, ease: EASE }}
            className="relative z-20 mx-auto mt-8 max-w-3xl rounded-[2rem] border border-border bg-background/85 p-2 shadow-[0_30px_90px_-35px_rgba(0,0,0,0.26)] backdrop-blur-xl sm:p-3"
          >
            <HeaderSearch size="lg" className="w-full" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-5 flex flex-wrap items-center justify-center gap-2"
          >
            <span className="mr-1 hidden items-center gap-1.5 text-xs text-muted-foreground sm:flex"><Search size={13} /> Popular:</span>
            {departments.slice(0, 5).map((department) => (
              <Link
                key={department.slug}
                href={`/categories/${department.slug}`}
                className="rounded-full border border-border bg-background/70 px-3.5 py-1.5 text-xs font-medium text-muted-foreground transition-[transform,border-color,color] hover:-translate-y-0.5 hover:border-foreground/25 hover:text-foreground"
              >
                {department.name}
              </Link>
            ))}
          </motion.div>
        </div>

        {stageProducts.length >= 3 && (
          <motion.div
            style={{ rotateX, rotateY, transformPerspective: 1200 }}
            className="relative mx-auto mt-12 h-[310px] max-w-6xl sm:mt-16 sm:h-[390px] lg:h-[470px]"
          >
            <motion.div
              initial={{ opacity: 0, y: 46, rotate: -5 }}
              animate={{ opacity: 1, y: 0, rotate: -8 }}
              transition={{ delay: 0.26, duration: 0.7, ease: EASE }}
              className="absolute left-[2%] top-[18%] hidden w-[24%] overflow-hidden rounded-[28px] border border-white/30 bg-card shadow-[0_30px_80px_-28px_rgba(0,0,0,0.35)] sm:block"
            >
              <Link href={`/products/${stageProducts[1].slug}`} className="relative block aspect-[4/3]">
                <Image src={stageProducts[1].imageUrl!} alt={stageProducts[1].name} fill sizes="25vw" className="object-cover" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 55, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.78, ease: EASE }}
              className="absolute left-1/2 top-0 z-10 w-[88%] -translate-x-1/2 overflow-hidden rounded-[30px] border border-border bg-card shadow-[0_50px_130px_-42px_rgba(0,0,0,0.38)] sm:w-[56%] lg:rounded-[36px]"
            >
              <Link href={`/products/${stageProducts[0].slug}`} className="relative block aspect-[16/10]">
                <Image src={stageProducts[0].imageUrl!} alt={stageProducts[0].name} fill priority sizes="(max-width: 640px) 88vw, 56vw" className="object-cover transition-transform duration-700 hover:scale-[1.025]" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/68 via-black/20 to-transparent p-5 pt-20 text-left text-white sm:p-7 sm:pt-28">
                  <p className="font-mono text-[9px] font-black uppercase tracking-[0.12em] text-white/60">Featured now</p>
                  <div className="mt-2 flex items-end justify-between gap-5">
                    <p className="max-w-[80%] font-display text-lg font-black leading-tight tracking-[-0.03em] sm:text-2xl">{stageProducts[0].name}</p>
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-black"><ArrowRight size={15} /></span>
                  </div>
                </div>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 48, rotate: 5 }}
              animate={{ opacity: 1, y: 0, rotate: 8 }}
              transition={{ delay: 0.31, duration: 0.7, ease: EASE }}
              className="absolute right-[2%] top-[20%] hidden w-[24%] overflow-hidden rounded-[28px] border border-white/30 bg-card shadow-[0_30px_80px_-28px_rgba(0,0,0,0.35)] sm:block"
            >
              <Link href={`/products/${stageProducts[2].slug}`} className="relative block aspect-[4/3]">
                <Image src={stageProducts[2].imageUrl!} alt={stageProducts[2].name} fill sizes="25vw" className="object-cover" />
              </Link>
            </motion.div>
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto mt-1 grid max-w-4xl grid-cols-3 divide-x divide-border border-y border-border py-5 text-center sm:mt-4"
        >
          <div className="px-3">
            <p className="font-display text-xl font-black sm:text-2xl">{stats.productCount.toLocaleString()}+</p>
            <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">Digital products</p>
          </div>
          <div className="px-3">
            <p className="flex items-center justify-center gap-2 font-display text-xl font-black sm:text-2xl"><Download size={17} className="text-primary" /> Instant</p>
            <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">Digital delivery</p>
          </div>
          <div className="px-3">
            <p className="flex items-center justify-center gap-2 font-display text-xl font-black sm:text-2xl"><ShieldCheck size={17} className="text-primary" /> Secure</p>
            <p className="mt-1 text-[10px] text-muted-foreground sm:text-xs">Protected checkout</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

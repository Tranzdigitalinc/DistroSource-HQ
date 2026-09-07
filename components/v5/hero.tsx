"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, useMotionValue, useSpring, useTransform } from "motion/react"
import { HeaderSearch } from "@/components/header/header-search"
import { ArrowRight } from "@/lib/storefront-icons"

type Product = { slug: string; name: string; imageUrl: string | null; category?: string }

type Props = {
  products: Product[]
  productCount: number
  categoryCount: number
}

const ease = [0.16, 1, 0.3, 1] as const

export function V5Hero({ products, productCount, categoryCount }: Props) {
  const mx = useMotionValue(0)
  const my = useMotionValue(0)
  const sx = useSpring(mx, { stiffness: 80, damping: 18, mass: 0.7 })
  const sy = useSpring(my, { stiffness: 80, damping: 18, mass: 0.7 })
  const leftX = useTransform(sx, [-1, 1], [-10, 10])
  const leftY = useTransform(sy, [-1, 1], [-8, 8])
  const rightX = useTransform(sx, [-1, 1], [10, -10])
  const rightY = useTransform(sy, [-1, 1], [8, -8])

  return (
    <section
      className="relative overflow-hidden border-b border-border bg-[linear-gradient(180deg,#fbfaf6_0%,#f7f5ef_100%)] text-[#111827] dark:bg-[linear-gradient(180deg,#111827_0%,#0b1320_100%)] dark:text-white"
      onPointerMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect()
        mx.set(((event.clientX - rect.left) / rect.width) * 2 - 1)
        my.set(((event.clientY - rect.top) / rect.height) * 2 - 1)
      }}
      onPointerLeave={() => {
        mx.set(0)
        my.set(0)
      }}
    >
      <div aria-hidden="true" className="absolute inset-0 opacity-[0.36] [background-image:linear-gradient(to_right,rgba(17,24,39,.055)_1px,transparent_1px),linear-gradient(to_bottom,rgba(17,24,39,.055)_1px,transparent_1px)] [background-size:54px_54px] dark:opacity-[0.12]" />
      <div aria-hidden="true" className="absolute -left-32 top-20 h-80 w-80 rounded-full bg-primary/15 blur-[110px]" />
      <div aria-hidden="true" className="absolute -right-28 bottom-0 h-96 w-96 rounded-full bg-[oklch(0.26_0.08_255)]/16 blur-[120px]" />

      <div className="relative mx-auto max-w-[1600px] px-4 pb-10 pt-14 sm:px-6 sm:pb-14 sm:pt-20 lg:px-8 lg:pb-20 lg:pt-24">
        <div className="mx-auto max-w-5xl text-center">
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease }} className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-primary">
            Digital assets · tools · systems · gaming
          </motion.p>
          <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.04, ease }} className="mx-auto mt-5 max-w-[1100px] font-display text-[clamp(3.8rem,9vw,9rem)] font-black leading-[0.84] tracking-[-0.085em] text-balance">
            Everything digital.
            <span className="block text-primary">One source.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.18 }} className="mx-auto mt-6 max-w-2xl text-[15px] leading-7 text-[#111827]/60 dark:text-white/60 sm:text-base">
            Discover high-quality templates, business systems, design resources, web assets and gaming products—curated for people who want to build faster and look better doing it.
          </motion.p>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2, ease }} className="mx-auto mt-8 max-w-3xl rounded-[18px] border border-black/10 bg-white p-2 shadow-[0_24px_70px_-35px_rgba(17,24,39,.35)] dark:border-white/10 dark:bg-white/[0.06]">
            <HeaderSearch size="lg" />
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5, delay: 0.32 }} className="mt-5 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-[#111827]/52 dark:text-white/50">
            <span>{productCount.toLocaleString()}+ products</span>
            <span className="size-1 rounded-full bg-primary" />
            <span>{categoryCount.toLocaleString()} categories</span>
            <span className="size-1 rounded-full bg-primary" />
            <Link href="/products?sort=newest" className="group inline-flex items-center gap-1.5 font-semibold text-[#111827] dark:text-white">See what’s new <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" /></Link>
          </motion.div>
        </div>

        <div className="relative mt-14 min-h-[330px] sm:mt-16 sm:min-h-[430px] lg:min-h-[520px]">
          <motion.div style={{ x: leftX, y: leftY }} className="absolute left-0 top-12 hidden w-[29%] lg:block">
            <ProductFrame product={products[0]} ratio="aspect-[4/5]" label="Featured" />
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.75, delay: 0.2, ease }} className="absolute left-1/2 top-0 w-[78%] -translate-x-1/2 sm:w-[62%] lg:w-[41%]">
            <ProductFrame product={products[1] ?? products[0]} ratio="aspect-[5/4]" label="Editor’s pick" priority />
          </motion.div>
          <motion.div style={{ x: rightX, y: rightY }} className="absolute right-0 top-20 hidden w-[27%] lg:block">
            <ProductFrame product={products[2] ?? products[0]} ratio="aspect-[4/5]" label="New release" />
          </motion.div>
          <div className="absolute inset-x-0 bottom-0 mx-auto grid w-full grid-cols-2 gap-3 sm:w-[88%] sm:grid-cols-3 lg:hidden">
            {products.slice(0, 3).map((product, index) => (
              <ProductFrame key={product.slug} product={product} ratio="aspect-[4/3]" label={index === 0 ? "Featured" : index === 1 ? "Popular" : "New"} compact />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function ProductFrame({ product, ratio, label, compact = false, priority = false }: { product?: Product; ratio: string; label: string; compact?: boolean; priority?: boolean }) {
  if (!product) return <div className={`${ratio} bg-white/50 dark:bg-white/[0.04]`} />
  return (
    <Link href={`/products/${product.slug}`} className="group block">
      <div className={`relative overflow-hidden border border-black/10 bg-white shadow-[0_30px_90px_-45px_rgba(17,24,39,.45)] dark:border-white/10 dark:bg-white/[0.05] ${compact ? "rounded-[16px]" : "rounded-[22px]"} ${ratio}`}>
        {product.imageUrl ? (
          <Image src={product.imageUrl} alt={product.name} fill priority={priority} className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.035]" sizes={compact ? "50vw" : "45vw"} />
        ) : <div className="h-full w-full bg-secondary" />}
        <div className="absolute inset-0 bg-gradient-to-t from-black/62 via-transparent to-transparent" />
        <div className={compact ? "absolute inset-x-0 bottom-0 p-3" : "absolute inset-x-0 bottom-0 p-5 sm:p-6"}>
          <p className="font-mono text-[8px] font-black uppercase tracking-[0.12em] text-white/65">{label}</p>
          <h2 className={`mt-1.5 font-display font-black leading-[0.96] tracking-[-0.045em] text-white ${compact ? "line-clamp-2 text-sm" : "text-xl sm:text-2xl"}`}>{product.name}</h2>
        </div>
      </div>
    </Link>
  )
}

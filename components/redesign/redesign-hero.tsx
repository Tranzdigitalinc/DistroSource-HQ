"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "motion/react"
import { ArrowRight, Download, Grid, Search, ShieldCheck } from "@/lib/storefront-icons"

interface RedesignHeroStats {
  productCount: number
  categoryCount: number
  reviewCount: number
  avgRating: number
}

export interface RedesignHeroProduct {
  slug: string
  name: string
  imageUrl: string | null
}

const ease = [0.16, 1, 0.3, 1] as const

export function RedesignHero({ stats, products }: { stats: RedesignHeroStats; products: RedesignHeroProduct[] }) {
  const artwork = products.filter((product) => product.imageUrl).slice(0, 4)

  return (
    <section className="relative isolate overflow-hidden border-b border-border bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-20 opacity-70"
        style={{
          background:
            "radial-gradient(circle at 16% 12%, color-mix(in oklch, var(--primary) 16%, transparent), transparent 34%), radial-gradient(circle at 84% 18%, color-mix(in oklch, var(--color-navy) 10%, transparent), transparent 38%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.18] [mask-image:linear-gradient(to_bottom,black,transparent_88%)]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--border) 1px, transparent 1px), linear-gradient(to bottom, var(--border) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
        }}
      />

      <div className="mx-auto grid min-h-[720px] max-w-[1500px] items-center gap-12 px-6 py-16 sm:px-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(520px,1.1fr)] lg:px-10 lg:py-20 xl:gap-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.07 } } }}
          className="max-w-3xl"
        >
          <motion.div
            variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.35, ease }}
            className="mb-6 inline-flex items-center gap-2 border border-border bg-background/80 px-3 py-2 backdrop-blur"
          >
            <span className="size-2 rounded-full bg-primary shadow-[0_0_0_5px_color-mix(in_oklch,var(--primary)_12%,transparent)]" />
            <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">Digital department store</span>
          </motion.div>

          <motion.h1
            variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.48, ease }}
            className="font-display text-[clamp(3.5rem,8vw,7.6rem)] font-black leading-[0.86] tracking-[-0.065em] text-foreground"
          >
            Find the file.
            <span className="block text-primary">Build the thing.</span>
          </motion.h1>

          <motion.p
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.42, ease }}
            className="mt-7 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg"
          >
            One curated source for templates, design assets, business systems, development resources, gaming products and the digital pieces that move work forward.
          </motion.p>

          <motion.form
            action="/redesign-preview/products"
            method="get"
            role="search"
            variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.4, ease }}
            className="relative mt-8 max-w-2xl"
          >
            <Search size={20} aria-hidden="true" className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              name="q"
              type="search"
              placeholder="Search templates, fonts, UI kits, systems..."
              className="h-14 w-full border border-border-strong bg-background pl-12 pr-28 text-sm text-foreground shadow-[var(--shadow-e2)] outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus:border-primary/60 focus:shadow-[0_0_0_4px_color-mix(in_oklch,var(--primary)_10%,transparent)] sm:text-base"
            />
            <button type="submit" className="absolute bottom-1.5 right-1.5 top-1.5 bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-primary/90">
              Search
            </button>
          </motion.form>

          <motion.div
            variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.4, ease }}
            className="mt-5 flex flex-wrap gap-3"
          >
            <Link href="/redesign-preview/products" className="group inline-flex min-h-11 items-center gap-2 bg-primary px-5 py-3 text-sm font-bold text-primary-foreground transition-transform duration-200 hover:-translate-y-0.5">
              Explore all products
              <ArrowRight className="size-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
            <a href="#departments" className="inline-flex min-h-11 items-center gap-2 border border-border-strong bg-background/70 px-5 py-3 text-sm font-bold text-foreground backdrop-blur transition-colors hover:border-primary/50 hover:text-primary">
              <Grid className="size-4" />
              Browse departments
            </a>
          </motion.div>

          <motion.ul
            variants={{ hidden: { opacity: 0 }, visible: { opacity: 1 } }}
            transition={{ duration: 0.5, delay: 0.18 }}
            className="mt-9 grid max-w-2xl gap-3 border-t border-border pt-5 text-xs text-muted-foreground sm:grid-cols-3"
          >
            <li className="flex items-center gap-2">
              <Grid className="size-4 text-primary" />
              <span><strong className="text-foreground">{stats.productCount.toLocaleString()}</strong> products across {stats.categoryCount} categories</span>
            </li>
            <li className="flex items-center gap-2"><Download className="size-4 text-primary" /><span>Instant access after purchase</span></li>
            <li className="flex items-center gap-2"><ShieldCheck className="size-4 text-primary" /><span>Secure checkout & clear licensing</span></li>
          </motion.ul>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.55, ease, delay: 0.08 }} className="relative hidden min-h-[590px] lg:block" aria-hidden="true">
          <div className="absolute inset-8 bg-navy" />
          <div className="absolute inset-0 border border-border bg-background/35 backdrop-blur-[2px]" />

          {artwork[0]?.imageUrl && (
            <motion.div whileHover={{ y: -6, rotate: -0.4 }} transition={{ duration: 0.2 }} className="absolute left-[4%] top-[7%] w-[58%] overflow-hidden border border-border bg-card shadow-[var(--shadow-e2)]">
              <div className="relative aspect-[4/3]"><Image src={artwork[0].imageUrl} alt="" fill priority sizes="34vw" className="object-cover" /></div>
              <div className="flex items-center justify-between gap-3 border-t border-border bg-background px-4 py-3">
                <span className="line-clamp-1 text-sm font-semibold text-foreground">{artwork[0].name}</span>
                <span className="font-mono text-[10px] uppercase tracking-[0.12em] text-primary">Featured</span>
              </div>
            </motion.div>
          )}
          {artwork[1]?.imageUrl && <motion.div whileHover={{ y: -7, rotate: 0.5 }} transition={{ duration: 0.2 }} className="absolute right-[2%] top-[22%] w-[43%] overflow-hidden border border-border bg-card shadow-[var(--shadow-e2)]"><div className="relative aspect-square"><Image src={artwork[1].imageUrl} alt="" fill sizes="26vw" className="object-cover" /></div></motion.div>}
          {artwork[2]?.imageUrl && <motion.div whileHover={{ y: -5, rotate: -0.35 }} transition={{ duration: 0.2 }} className="absolute bottom-[5%] left-[18%] w-[39%] overflow-hidden border border-border bg-card shadow-[var(--shadow-e2)]"><div className="relative aspect-[4/3]"><Image src={artwork[2].imageUrl} alt="" fill sizes="24vw" className="object-cover" /></div></motion.div>}
          {artwork[3]?.imageUrl && <motion.div whileHover={{ y: -5, rotate: 0.35 }} transition={{ duration: 0.2 }} className="absolute bottom-[10%] right-[6%] w-[33%] overflow-hidden border border-border bg-card shadow-[var(--shadow-e2)]"><div className="relative aspect-[3/4]"><Image src={artwork[3].imageUrl} alt="" fill sizes="20vw" className="object-cover" /></div></motion.div>}

          <div className="absolute bottom-[6%] left-[2%] max-w-48 border border-border bg-background px-4 py-3 shadow-[var(--shadow-e1)]">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Catalog signal</p>
            <p className="mt-1 font-display text-2xl font-black tracking-tight text-foreground">{stats.productCount.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">real products, one storefront</p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

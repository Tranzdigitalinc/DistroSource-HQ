"use client"

import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import { BrandLogo } from "@/components/brand-logo"
import { AccountMenu } from "@/components/header/account-menu"
import { ThemeToggle } from "@/components/header/theme-toggle"
import { HeaderSearch } from "@/components/header/header-search"
import { V5CartDrawer } from "@/components/v5/cart-drawer"
import { ArrowRight, Close, Menu, Search } from "@/lib/storefront-icons"
import type { getCategoryTree } from "@/lib/queries/catalog"

type Departments = Awaited<ReturnType<typeof getCategoryTree>>
const ease = [0.16, 1, 0.3, 1] as const

export function V5SiteHeaderClient({ departments }: { departments: Departments }) {
  const [megaOpen, setMegaOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const visible = departments.filter((department) => department.productCount > 0).slice(0, 8)

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-black/[0.06] bg-[color:var(--background)]/94 backdrop-blur-xl dark:border-white/10">
        <div className="mx-auto flex h-[76px] max-w-[1600px] items-center gap-4 px-4 sm:px-6 lg:px-8">
          <button type="button" onClick={() => setMobileOpen(true)} aria-label="Open navigation" className="flex size-10 items-center justify-center lg:hidden"><Menu size={20} /></button>
          <Link href="/" className="shrink-0" aria-label="DistroSource home"><BrandLogo href={null} heightClassName="h-8 sm:h-9" /></Link>

          <nav className="ml-4 hidden items-center gap-1 lg:flex" aria-label="Primary navigation">
            <button type="button" onMouseEnter={() => setMegaOpen(true)} onClick={() => setMegaOpen((value) => !value)} className="inline-flex h-10 items-center px-3 text-sm font-semibold tracking-[-0.01em] text-foreground/80 transition-colors hover:text-foreground">Categories</button>
            <Link href="/products" className="inline-flex h-10 items-center px-3 text-sm font-semibold tracking-[-0.01em] text-foreground/80 hover:text-foreground">All products</Link>
            <Link href="/gaming" className="inline-flex h-10 items-center px-3 text-sm font-semibold tracking-[-0.01em] text-foreground/80 hover:text-foreground">Gaming</Link>
            <Link href="/deals" className="inline-flex h-10 items-center px-3 text-sm font-semibold tracking-[-0.01em] text-foreground/80 hover:text-foreground">Deals</Link>
          </nav>

          <div className="mx-auto hidden w-full max-w-[520px] md:block"><HeaderSearch /></div>
          <div className="ml-auto flex items-center gap-0.5">
            <button type="button" className="flex size-10 items-center justify-center md:hidden" onClick={() => setMobileOpen(true)} aria-label="Search"><Search size={19} /></button>
            <ThemeToggle />
            <AccountMenu />
            <V5CartDrawer />
          </div>
        </div>

        <AnimatePresence>
          {megaOpen && (
            <motion.div onMouseLeave={() => setMegaOpen(false)} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.22, ease }} className="absolute inset-x-0 top-full border-b border-black/[0.06] bg-background shadow-[0_30px_80px_-35px_rgba(0,0,0,.28)] dark:border-white/10">
              <div className="mx-auto grid max-w-[1600px] grid-cols-[280px_1fr] gap-10 px-8 py-8">
                <div className="border-r border-border pr-8">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Browse DistroSource</p>
                  <h2 className="mt-3 font-display text-3xl font-black leading-[0.98] tracking-[-0.05em]">Find the right digital tool, fast.</h2>
                  <p className="mt-4 text-sm leading-6 text-muted-foreground">Curated templates, systems, graphics, assets and gaming resources—organized around what you want to make.</p>
                  <Link href="/categories" onClick={() => setMegaOpen(false)} className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold">See all categories <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></Link>
                </div>
                <div className="grid grid-cols-4 gap-x-8 gap-y-7">
                  {visible.map((department) => (
                    <div key={department.slug}>
                      <Link href={`/categories/${department.slug}`} onClick={() => setMegaOpen(false)} className="font-display text-base font-black tracking-[-0.02em] hover:text-primary">{department.name}</Link>
                      <div className="mt-2 space-y-1.5">{department.subcategories.filter((subcategory) => subcategory.productCount > 0).slice(0, 4).map((subcategory) => <Link key={subcategory.slug} href={`/categories/${subcategory.slug}`} onClick={() => setMegaOpen(false)} className="block text-xs leading-5 text-muted-foreground transition-colors hover:text-foreground">{subcategory.name}</Link>)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-[100] bg-background" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="flex h-full flex-col">
              <div className="flex h-[76px] items-center justify-between border-b border-border px-4"><BrandLogo href="/" heightClassName="h-8" /><button type="button" onClick={() => setMobileOpen(false)} className="flex size-11 items-center justify-center" aria-label="Close navigation"><Close size={20} /></button></div>
              <div className="border-b border-border p-4"><HeaderSearch size="lg" /></div>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-6">
                <div className="space-y-1"><Link href="/products" onClick={() => setMobileOpen(false)} className="flex min-h-14 items-center justify-between border-b border-border text-xl font-black">All products <ArrowRight size={16} /></Link><Link href="/gaming" onClick={() => setMobileOpen(false)} className="flex min-h-14 items-center justify-between border-b border-border text-xl font-black">Gaming <ArrowRight size={16} /></Link><Link href="/deals" onClick={() => setMobileOpen(false)} className="flex min-h-14 items-center justify-between border-b border-border text-xl font-black">Deals <ArrowRight size={16} /></Link></div>
                <p className="mb-3 mt-8 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Departments</p>
                <div className="grid grid-cols-2 gap-2">{visible.map((department) => <Link key={department.slug} href={`/categories/${department.slug}`} onClick={() => setMobileOpen(false)} className="min-h-24 border border-border p-4"><span className="font-display text-base font-black">{department.name}</span><span className="mt-3 block font-mono text-[10px] text-muted-foreground">{department.productCount} products</span></Link>)}</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

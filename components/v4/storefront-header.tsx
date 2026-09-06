"use client"

import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { BrandLogo } from "@/components/brand-logo"
import { AccountMenu } from "@/components/header/account-menu"
import { ThemeToggle } from "@/components/header/theme-toggle"
import { ArrowRight, ChevronDown, Close, Menu } from "@/lib/storefront-icons"
import { V4CartDrawer } from "@/components/v4/cart-drawer"
import { V4SearchCommand } from "@/components/v4/search-command"

const EASE = [0.16, 1, 0.3, 1] as const

type Department = {
  id: number
  slug: string
  name: string
  description: string | null
  productCount: number
  subcategories: { id: number; slug: string; name: string; productCount: number }[]
}

const navItems = [
  { href: "/products", label: "Shop" },
  { href: "/products?sort=newest", label: "New" },
  { href: "/gaming", label: "Gaming" },
  { href: "/deals", label: "Deals" },
]

export function V4StorefrontHeader({ departments }: { departments: Department[] }) {
  const pathname = usePathname()
  const [departmentsOpen, setDepartmentsOpen] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setDepartmentsOpen(false)
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!mobileOpen) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [mobileOpen])

  const visible = departments.filter((department) => department.productCount > 0)

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border/70 bg-background/82 backdrop-blur-2xl supports-[backdrop-filter]:bg-background/72">
        <div className="mx-auto flex h-[72px] max-w-[1540px] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex size-10 items-center justify-center rounded-full border border-border lg:hidden"
            aria-label="Open navigation"
          >
            <Menu size={19} aria-hidden="true" />
          </button>

          <Link href="/" aria-label="DistroSource home" className="shrink-0">
            <BrandLogo href={null} heightClassName="h-8 sm:h-9" />
          </Link>

          <nav aria-label="Primary navigation" className="ml-3 hidden items-center gap-1 lg:flex">
            <div className="relative">
              <button
                type="button"
                onClick={() => setDepartmentsOpen((value) => !value)}
                className="flex h-10 items-center gap-1.5 rounded-full px-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-secondary"
                aria-expanded={departmentsOpen}
              >
                Departments
                <ChevronDown size={14} className={`transition-transform ${departmentsOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {departmentsOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.985 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.99 }}
                    transition={{ duration: 0.26, ease: EASE }}
                    className="absolute left-0 top-[calc(100%+13px)] w-[min(880px,86vw)] overflow-hidden rounded-[28px] border border-border bg-background p-3 shadow-[0_36px_100px_-30px_rgba(0,0,0,0.22)]"
                  >
                    <div className="grid grid-cols-3 gap-2">
                      {visible.slice(0, 6).map((department, index) => (
                        <Link
                          key={department.slug}
                          href={`/categories/${department.slug}`}
                          className="group flex min-h-48 flex-col justify-between rounded-[22px] bg-secondary/45 p-5 transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-secondary"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <span className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">0{index + 1}</span>
                            <span className="flex size-9 items-center justify-center rounded-full border border-border bg-background transition-transform group-hover:translate-x-1">
                              <ArrowRight size={14} />
                            </span>
                          </div>
                          <div>
                            <p className="font-display text-xl font-black tracking-[-0.035em]">{department.name}</p>
                            {department.description && <p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{department.description}</p>}
                            <div className="mt-4 flex flex-wrap gap-x-3 gap-y-1">
                              {department.subcategories.slice(0, 3).map((sub) => (
                                <span key={sub.slug} className="text-[11px] text-muted-foreground">{sub.name}</span>
                              ))}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center justify-between rounded-[20px] bg-foreground px-5 py-4 text-background">
                      <div>
                        <p className="text-sm font-semibold">Explore the entire catalog</p>
                        <p className="mt-0.5 text-xs text-background/60">Browse every department, format, and release.</p>
                      </div>
                      <Link href="/categories" className="flex size-10 items-center justify-center rounded-full bg-background text-foreground">
                        <ArrowRight size={15} />
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {navItems.map((item) => {
              const active = item.href === "/gaming" ? pathname.startsWith("/gaming") : pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex h-10 items-center rounded-full px-3.5 text-sm font-semibold transition-colors hover:bg-secondary ${active ? "text-primary" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {item.label}
                  {active && (
                    <motion.span
                      layoutId="v4-nav-active"
                      className="absolute inset-x-4 -bottom-[17px] h-0.5 rounded-full bg-primary"
                      transition={{ type: "spring", stiffness: 500, damping: 38 }}
                    />
                  )}
                </Link>
              )
            })}
          </nav>

          <div className="ml-auto hidden w-full max-w-[310px] md:block">
            <V4SearchCommand departments={visible} triggerClassName="w-full justify-start" />
          </div>

          <div className="ml-auto flex items-center gap-0.5 md:ml-0">
            <div className="md:hidden">
              <V4SearchCommand departments={visible} />
            </div>
            <ThemeToggle />
            <AccountMenu />
            <V4CartDrawer />
          </div>
        </div>
      </header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[120] bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex h-20 items-center justify-between border-b border-border px-5">
              <BrandLogo href="/" heightClassName="h-9" />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="flex size-11 items-center justify-center rounded-full border border-border"
                aria-label="Close navigation"
              >
                <Close size={19} />
              </button>
            </div>
            <motion.div
              initial={{ y: 18, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.05, duration: 0.36, ease: EASE }}
              className="h-[calc(100%-80px)] overflow-y-auto px-5 py-7"
            >
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Navigate</p>
              <nav className="mt-3 divide-y divide-border">
                {[{ href: "/products", label: "Shop all products" }, ...navItems.slice(1), { href: "/categories", label: "Departments" }].map((item) => (
                  <Link key={`${item.href}-${item.label}`} href={item.href} className="group flex items-center justify-between py-5 font-display text-3xl font-black tracking-[-0.045em]">
                    {item.label}
                    <ArrowRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1" />
                  </Link>
                ))}
              </nav>

              <div className="mt-10">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Departments</p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {visible.slice(0, 6).map((department) => (
                    <Link key={department.slug} href={`/categories/${department.slug}`} className="rounded-2xl bg-secondary/55 p-4">
                      <p className="font-display text-base font-bold leading-tight">{department.name}</p>
                      <p className="mt-3 font-mono text-[9px] uppercase tracking-[0.06em] text-muted-foreground">{department.productCount} products</p>
                    </Link>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

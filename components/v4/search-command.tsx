"use client"

import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { useEffect, useState } from "react"
import { HeaderSearch } from "@/components/header/header-search"
import { ArrowRight, Close, Search, Sparkles } from "@/lib/storefront-icons"

const EASE = [0.16, 1, 0.3, 1] as const

export function V4SearchCommand({
  departments,
  triggerClassName = "",
}: {
  departments: { slug: string; name: string; productCount: number }[]
  triggerClassName?: string
}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setOpen(true)
      }
      if (event.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`group flex h-10 items-center gap-2.5 rounded-full border border-border bg-background px-3.5 text-sm text-muted-foreground transition-[border-color,box-shadow,color] hover:border-border-strong hover:text-foreground hover:shadow-[var(--shadow-e1)] ${triggerClassName}`}
      >
        <Search size={17} aria-hidden="true" />
        <span className="hidden sm:inline">Search DistroSource</span>
        <span className="ml-auto hidden rounded-md border border-border bg-secondary/50 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.06em] text-muted-foreground lg:inline">
          ⌘ K
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[110] overflow-y-auto bg-background/96 backdrop-blur-2xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
          >
            <motion.div
              initial={{ y: 28, opacity: 0, scale: 0.985 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 18, opacity: 0, scale: 0.99 }}
              transition={{ duration: 0.42, ease: EASE }}
              className="mx-auto flex min-h-screen max-w-5xl flex-col px-5 pb-16 pt-5 sm:px-8 lg:pt-8"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  <Sparkles size={14} className="text-primary" aria-hidden="true" />
                  Find your next digital tool
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex size-11 items-center justify-center rounded-full border border-border transition-colors hover:bg-secondary"
                  aria-label="Close search"
                >
                  <Close size={19} aria-hidden="true" />
                </button>
              </div>

              <div className="flex flex-1 flex-col justify-center py-12 sm:py-20">
                <h2 className="max-w-4xl font-display text-[clamp(2.7rem,7vw,6.5rem)] font-black leading-[0.92] tracking-[-0.065em] text-foreground">
                  What are you
                  <span className="block text-primary">looking for?</span>
                </h2>
                <p className="mt-6 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                  Search products, templates, systems, design assets, development resources, and gaming tools from one place.
                </p>

                <div className="relative z-20 mt-8 max-w-3xl rounded-[1.75rem] border border-border bg-card p-2 shadow-[0_28px_90px_-32px_rgba(0,0,0,0.22)] sm:p-3">
                  <HeaderSearch size="lg" className="w-full" />
                </div>

                <div className="mt-10">
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground">Popular departments</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {departments.slice(0, 8).map((department, index) => (
                      <motion.div
                        key={department.slug}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.06 + index * 0.035 }}
                      >
                        <Link
                          href={`/categories/${department.slug}`}
                          onClick={() => setOpen(false)}
                          className="group inline-flex h-10 items-center gap-2 rounded-full border border-border bg-background px-4 text-sm font-medium transition-[background-color,border-color,transform] hover:-translate-y-0.5 hover:border-foreground/25 hover:bg-secondary"
                        >
                          {department.name}
                          <span className="font-mono text-[9px] text-muted-foreground">{department.productCount}</span>
                        </Link>
                      </motion.div>
                    ))}
                    <Link
                      href="/products"
                      onClick={() => setOpen(false)}
                      className="inline-flex h-10 items-center gap-2 rounded-full bg-foreground px-4 text-sm font-semibold text-background"
                    >
                      Browse all
                      <ArrowRight size={14} />
                    </Link>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

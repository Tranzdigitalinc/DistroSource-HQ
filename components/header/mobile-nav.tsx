"use client"

import Link from "next/link"
import { useState } from "react"
import { motion } from "motion/react"
import {
  ArrowRight,
  BriefcaseBusiness,
  ChevronRight,
  CircleHelp,
  Close,
  GameController,
  Heart,
  Library,
  Mail,
  Menu,
  Tag,
  User,
  ICON_SIZE,
} from "@/lib/storefront-icons"
import { BrandLogo } from "@/components/brand-logo"
import { ThemeToggle } from "@/components/header/theme-toggle"
import { SearchTrigger } from "@/components/header/search-command"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getCategoryIcon } from "@/lib/category-icons"
import { EASE_OUT } from "@/components/motion/reveal"
import { cn } from "@/lib/utils"

interface Subcategory {
  id: number
  slug: string
  name: string
}
interface Department extends Subcategory {
  subcategories: Subcategory[]
  productCount?: number
}

const rowClass =
  "flex min-h-12 items-center gap-3 rounded-xl px-3 text-[15px] font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

function GroupLabel({ children }: { children: React.ReactNode }) {
  return <p className="px-3 pb-1.5 pt-6 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{children}</p>
}

function NavRow({ href, icon: Icon, label, onClick, badge }: { href: string; icon: React.ComponentType<{ size?: number; weight?: "duotone"; className?: string; "aria-hidden"?: boolean | "true" }>; label: string; onClick: () => void; badge?: string }) {
  return (
    <Link href={href} onClick={onClick} className={rowClass}>
      <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary">
        <Icon size={ICON_SIZE.base} weight="duotone" aria-hidden="true" />
      </span>
      <span className="flex-1">{label}</span>
      {badge && (
        <span className="rounded-full bg-primary px-1.5 py-px font-mono text-[9px] font-bold uppercase leading-[1.4] tracking-[0.06em] text-primary-foreground">
          {badge}
        </span>
      )}
      <ChevronRight size={ICON_SIZE.sm} className="text-muted-foreground" aria-hidden="true" />
    </Link>
  )
}

/**
 * Full-screen mobile menu. Search first, then the departments as an
 * accordion with duotone icons, then account and support. Rows stagger in.
 */
export function MobileNav({ departments }: { departments: Department[] }) {
  const [open, setOpen] = useState(false)
  const close = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring lg:hidden"
            aria-label="Open menu"
          />
        }
      >
        <Menu size={ICON_SIZE.nav} weight="bold" />
      </SheetTrigger>
      <SheetContent side="left" showCloseButton={false} className="flex w-full max-w-none flex-col gap-0 border-0 bg-background p-0 sm:max-w-md sm:border-r sm:border-border">
        <SheetHeader className="flex-row items-center justify-between border-b border-border px-4 py-3 text-left">
          <SheetTitle className="sr-only">DistroSource navigation</SheetTitle>
          <BrandLogo href={null} heightClassName="h-8" />
          <div className="flex items-center gap-1">
            <ThemeToggle className="flex size-10 items-center justify-center rounded-full text-foreground hover:bg-secondary" />
            <button type="button" onClick={close} aria-label="Close menu" className="flex size-10 items-center justify-center rounded-full text-foreground hover:bg-secondary">
              <Close size={ICON_SIZE.nav} weight="bold" aria-hidden="true" />
            </button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-3 pb-8">
          <div className="px-1 pt-4" onClick={close}>
            <SearchTrigger size="lg" placeholder="Search products…" />
          </div>

          <motion.div initial="hidden" animate={open ? "show" : "hidden"} variants={{ show: { transition: { staggerChildren: 0.035, delayChildren: 0.08 } } }}>
            <GroupLabel>Shop</GroupLabel>
            <Stagger>
              <Link href="/products" onClick={close} className={cn(rowClass, "font-semibold")}>
                <span className="flex-1">All products</span>
                <ArrowRight size={ICON_SIZE.sm} weight="bold" className="text-muted-foreground" aria-hidden="true" />
              </Link>
            </Stagger>
            <Accordion multiple className="flex flex-col">
              {departments.map((department) => {
                const DepartmentIcon = getCategoryIcon(department.slug)
                return (
                  <Stagger key={department.id}>
                    <AccordionItem value={String(department.id)} className="border-b-0">
                      <AccordionTrigger className="min-h-12 rounded-xl px-3 py-0 text-[15px] font-medium text-foreground hover:bg-secondary hover:no-underline">
                        <span className="flex flex-1 items-center gap-3">
                          <span className="flex size-9 items-center justify-center rounded-xl bg-secondary text-primary">
                            <DepartmentIcon className="size-[18px]" aria-hidden="true" />
                          </span>
                          <span className="flex-1 text-left">{department.name}</span>
                          {department.productCount ? <span className="font-mono text-[10px] text-muted-foreground">{department.productCount}</span> : null}
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="pb-1 pl-12 pr-2">
                        <div className="flex flex-col border-l border-border pl-3">
                          {department.subcategories.map((subcategory) => (
                            <Link
                              key={subcategory.id}
                              href={`/categories/${subcategory.slug}`}
                              onClick={close}
                              className="flex min-h-10 items-center rounded-lg px-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                            >
                              {subcategory.name}
                            </Link>
                          ))}
                          <Link href={`/categories/${department.slug}`} onClick={close} className="flex min-h-10 items-center gap-1 px-2 text-xs font-semibold text-primary hover:underline">
                            View all {department.name}
                            <ArrowRight size={12} weight="bold" aria-hidden="true" />
                          </Link>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Stagger>
                )
              })}
            </Accordion>
            <Stagger>
              <NavRow href="/gaming" icon={GameController} label="Gaming" onClick={close} badge="New" />
            </Stagger>
            <Stagger>
              <NavRow href="/deals" icon={Tag} label="Deals" onClick={close} />
            </Stagger>

            <GroupLabel>Account</GroupLabel>
            <Stagger>
              <NavRow href="/account" icon={User} label="My account" onClick={close} />
            </Stagger>
            <Stagger>
              <NavRow href="/account/library" icon={Library} label="My library" onClick={close} />
            </Stagger>
            <Stagger>
              <NavRow href="/account/wishlist" icon={Heart} label="Wishlist" onClick={close} />
            </Stagger>

            <GroupLabel>Support</GroupLabel>
            <Stagger>
              <NavRow href="/help" icon={CircleHelp} label="Help center" onClick={close} />
            </Stagger>
            <Stagger>
              <NavRow href="/contact" icon={Mail} label="Contact" onClick={close} />
            </Stagger>
            <Stagger>
              <NavRow href="/team-licensing" icon={BriefcaseBusiness} label="Team licensing" onClick={close} />
            </Stagger>
          </motion.div>
        </div>

        <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">Instant delivery to My Library after payment.</div>
      </SheetContent>
    </Sheet>
  )
}

function Stagger({ children }: { children: React.ReactNode }) {
  return (
    <motion.div variants={{ hidden: { opacity: 0, x: -10 }, show: { opacity: 1, x: 0, transition: { duration: 0.32, ease: EASE_OUT } } }}>
      {children}
    </motion.div>
  )
}

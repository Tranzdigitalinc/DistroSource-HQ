"use client"

import Link from "next/link"
import { useState } from "react"
import {
  ArrowRight,
  BriefcaseBusiness,
  ChevronRight,
  CircleHelp,
  GameController,
  Heart,
  Library,
  Mail,
  Menu,
  ShieldCheck,
  Tag,
  User,
  ICON_SIZE,
} from "@/lib/storefront-icons"
import { BrandLogo } from "@/components/brand-logo"
import { ThemeToggle } from "@/components/header/theme-toggle"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { getCategoryIcon } from "@/lib/category-icons"
import { cn } from "@/lib/utils"

interface Subcategory {
  id: number
  slug: string
  name: string
}
interface Department extends Subcategory {
  subcategories: Subcategory[]
}

const rowClass =
  "flex min-h-12 items-center gap-3 rounded-xl px-3 text-[15px] font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

function GroupLabel({ children }: { children: React.ReactNode }) {
  return <p className="px-3 pb-1.5 pt-5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{children}</p>
}

function NavRow({ href, icon: Icon, label, onClick, badge }: { href: string; icon: React.ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean | "true" }>; label: string; onClick: () => void; badge?: string }) {
  return (
    <Link href={href} onClick={onClick} className={rowClass}>
      <span className="flex size-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
        <Icon size={ICON_SIZE.sm} aria-hidden="true" />
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
        <Menu size={ICON_SIZE.nav} />
      </SheetTrigger>
      <SheetContent side="left" showCloseButton={false} className="flex w-[88vw] max-w-sm flex-col gap-0 border-r border-border bg-background p-0">
        <SheetHeader className="flex-row items-center justify-between border-b border-border px-5 py-4 text-left">
          <SheetTitle className="sr-only">DistroSource navigation</SheetTitle>
          <BrandLogo href={null} heightClassName="h-8" />
          <ThemeToggle className="flex size-9 items-center justify-center rounded-full text-foreground hover:bg-secondary" />
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-2 pb-6">
          <GroupLabel>Shop</GroupLabel>
          <Link href="/products" onClick={close} className={cn(rowClass, "font-semibold")}>
            <span className="flex-1">All products</span>
            <ArrowRight size={ICON_SIZE.sm} className="text-muted-foreground" aria-hidden="true" />
          </Link>
          <Accordion multiple className="flex flex-col">
            {departments.map((department) => {
              const DepartmentIcon = getCategoryIcon(department.slug)
              return (
                <AccordionItem key={department.id} value={String(department.id)} className="border-b-0">
                  <AccordionTrigger className="min-h-12 rounded-xl px-3 py-0 text-[15px] font-medium text-foreground hover:bg-secondary hover:no-underline">
                    <span className="flex flex-1 items-center gap-3">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground">
                        <DepartmentIcon className="size-4" aria-hidden="true" />
                      </span>
                      <span className="flex-1 text-left">{department.name}</span>
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-1 pl-11 pr-2">
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
                      <Link href={`/categories/${department.slug}`} onClick={close} className="flex min-h-10 items-center gap-1 px-2 text-xs font-semibold text-foreground hover:underline">
                        View all {department.name}
                        <ArrowRight size={12} aria-hidden="true" />
                      </Link>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
          <NavRow href="/gaming" icon={GameController} label="Gaming" onClick={close} badge="New" />
          <NavRow href="/deals" icon={Tag} label="Deals" onClick={close} />

          <GroupLabel>Account</GroupLabel>
          <NavRow href="/account" icon={User} label="My account" onClick={close} />
          <NavRow href="/account/library" icon={Library} label="My library" onClick={close} />
          <NavRow href="/account/wishlist" icon={Heart} label="Wishlist" onClick={close} />

          <GroupLabel>Support</GroupLabel>
          <NavRow href="/help" icon={CircleHelp} label="Help center" onClick={close} />
          <NavRow href="/contact" icon={Mail} label="Contact" onClick={close} />
          <NavRow href="/team-licensing" icon={BriefcaseBusiness} label="Team licensing" onClick={close} />
          <NavRow href="/legal/terms" icon={ShieldCheck} label="Legal" onClick={close} />
        </div>

        <div className="border-t border-border px-5 py-3 text-xs text-muted-foreground">Instant delivery to My Library after payment.</div>
      </SheetContent>
    </Sheet>
  )
}

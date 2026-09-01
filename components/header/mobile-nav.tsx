"use client"

import Link from "next/link"
import { useState } from "react"
import { ArrowRight, BriefcaseBusiness, CircleHelp, Globe2, Mail, Menu, ShieldCheck, Store } from "lucide-react"
import { BrandLogo } from "@/components/brand-logo"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { getCategoryIcon } from "@/lib/category-icons"

interface Category {
  id: number
  slug: string
  name: string
  iconName: string
}

export function MobileNav({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger render={<Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu" />}>
        <Menu />
      </SheetTrigger>
      <SheetContent side="left" className="w-[88vw] max-w-sm border-r border-accent/20 bg-background/95 p-0 supports-backdrop-filter:bg-background/80">
        <SheetHeader className="border-b border-border/70 px-5 pb-5 pt-7 text-left">
          <div>
            <SheetTitle className="sr-only">RedeemCove navigation</SheetTitle>
            <BrandLogo href={null} heightClassName="h-11 max-w-[15rem]" />
            <p className="mt-2 text-xs text-muted-foreground">Instant value, delivered digitally</p>
          </div>
        </SheetHeader>
        <div className="flex flex-col gap-1 overflow-y-auto px-3 py-5">
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Browse categories</p>
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.name)
            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                onClick={() => setOpen(false)}
                className="group flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium text-foreground/80 transition-all hover:bg-accent/10 hover:pl-4 hover:text-foreground"
              >
                <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors group-hover:bg-accent/15 group-hover:text-accent">
                  <Icon className="size-4" aria-hidden="true" />
                </span>
                <span className="flex-1">{category.name}</span>
                <ArrowRight className="size-4 -translate-x-1 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:text-accent group-hover:opacity-100" aria-hidden="true" />
              </Link>
            )
          })}
          <div className="my-4 h-px bg-border/70" />
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">More ways to redeem</p>
          <Link href="/deals" onClick={() => setOpen(false)} className="group flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium text-foreground/80 transition-all hover:bg-accent/10 hover:pl-4 hover:text-foreground">
            <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground group-hover:bg-accent/15 group-hover:text-accent"><Sparkles className="size-4" aria-hidden="true" /></span>
            <span className="flex-1">Deals</span><ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:text-accent group-hover:opacity-100" aria-hidden="true" />
          </Link>
          <Link href="/countries" onClick={() => setOpen(false)} className="group flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium text-foreground/80 transition-all hover:bg-accent/10 hover:pl-4 hover:text-foreground">
            <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground group-hover:bg-accent/15 group-hover:text-accent"><Globe2 className="size-4" aria-hidden="true" /></span>
            <span className="flex-1">Countries</span><ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:text-accent group-hover:opacity-100" aria-hidden="true" />
          </Link>
          <Link href="/bulk-gifting" onClick={() => setOpen(false)} className="group flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium text-foreground/80 transition-all hover:bg-accent/10 hover:pl-4 hover:text-foreground">
            <span className="flex size-9 items-center justify-center rounded-lg bg-secondary text-muted-foreground group-hover:bg-accent/15 group-hover:text-accent"><BriefcaseBusiness className="size-4" aria-hidden="true" /></span>
            <span className="flex-1">Bulk gifting</span><ArrowRight className="size-4 text-muted-foreground opacity-0 group-hover:text-accent group-hover:opacity-100" aria-hidden="true" />
          </Link>
          <div className="my-4 h-px bg-border/70" />
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-[0.16em] text-muted-foreground">Company & support</p>
          <div className="grid grid-cols-2 gap-2 px-2">
            <Link href="/about" onClick={() => setOpen(false)} className="flex min-h-11 items-center gap-2 rounded-xl border border-border/70 px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-accent/40 hover:bg-accent/10 hover:text-foreground">
              <CircleHelp className="size-4 text-accent" aria-hidden="true" /> About
            </Link>
            <Link href="/contact" onClick={() => setOpen(false)} className="flex min-h-11 items-center gap-2 rounded-xl border border-border/70 px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-accent/40 hover:bg-accent/10 hover:text-foreground">
              <Mail className="size-4 text-accent" aria-hidden="true" /> Contact
            </Link>
            <Link href="/faq" onClick={() => setOpen(false)} className="flex min-h-11 items-center gap-2 rounded-xl border border-border/70 px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-accent/40 hover:bg-accent/10 hover:text-foreground">
              <Store className="size-4 text-accent" aria-hidden="true" /> FAQ & help
            </Link>
            <Link href="/legal/terms" onClick={() => setOpen(false)} className="flex min-h-11 items-center gap-2 rounded-xl border border-border/70 px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-accent/40 hover:bg-accent/10 hover:text-foreground">
              <ShieldCheck className="size-4 text-accent" aria-hidden="true" /> Legal
            </Link>
          </div>
          <div className="mt-5 rounded-2xl border border-accent/20 bg-accent/5 p-4">
            <div className="flex items-center gap-3"><Sparkles className="size-4 text-accent" aria-hidden="true" /><p className="text-sm font-semibold">Shop with confidence</p></div>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">Secure digital delivery, transparent pricing, and help whenever you need it.</p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}

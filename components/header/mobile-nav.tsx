"use client"

import Link from "next/link"
import { useState } from "react"
import { Menu } from "lucide-react"
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
      <SheetContent side="left" className="w-full sm:max-w-xs">
        <SheetHeader>
          <SheetTitle className="font-display text-lg">RedeemCove</SheetTitle>
        </SheetHeader>
        <div className="flex flex-col gap-1 overflow-y-auto px-2">
          <p className="px-3 py-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">Categories</p>
          {categories.map((category) => {
            const Icon = getCategoryIcon(category.name)
            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-secondary hover:text-foreground"
              >
                <Icon className="size-4" />
                {category.name}
              </Link>
            )
          })}
          <div className="my-2 h-px bg-border" />
          <Link
            href="/deals"
            onClick={() => setOpen(false)}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-secondary hover:text-foreground"
          >
            Deals
          </Link>
          <Link
            href="/countries"
            onClick={() => setOpen(false)}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-secondary hover:text-foreground"
          >
            Countries
          </Link>
          <Link
            href="/bulk-gifting"
            onClick={() => setOpen(false)}
            className="rounded-lg px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-secondary hover:text-foreground"
          >
            Bulk Gifting
          </Link>
        </div>
      </SheetContent>
    </Sheet>
  )
}

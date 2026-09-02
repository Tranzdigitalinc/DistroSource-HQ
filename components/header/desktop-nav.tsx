"use client"

import Link from "next/link"
import { useState } from "react"
import { ChevronDown } from "@/lib/storefront-icons"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { MegaMenu } from "@/components/header/mega-menu"
import { cn } from "@/lib/utils"

interface Category {
  id: number
  slug: string
  name: string
  description: string | null
}

export function DesktopNav({ categories }: { categories: Category[] }) {
  const [open, setOpen] = useState(false)

  const linkClass =
    "relative flex items-center gap-1 px-3 py-2 font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-foreground/70 transition-colors after:absolute after:inset-x-3 after:-bottom-px after:h-[2px] after:origin-left after:scale-x-0 after:bg-primary after:transition-transform hover:text-foreground hover:after:scale-x-100"

  return (
    <nav className="hidden items-center lg:flex">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              onMouseEnter={() => setOpen(true)}
              className={cn(linkClass, open && "text-foreground after:scale-x-100")}
            />
          }
        >
          Browse
          <ChevronDown className={cn("size-3.5 opacity-60 transition-transform", open && "rotate-180")} />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={16}
          onMouseLeave={() => setOpen(false)}
          className="w-[560px] max-w-[92vw] rounded-[4px] p-0"
        >
          <MegaMenu categories={categories} />
        </PopoverContent>
      </Popover>

      <Link href="/products?free=true" className={linkClass}>
        Free
      </Link>
      <Link href="/products?bundle=true" className={linkClass}>
        Bundles
      </Link>
      <Link href="/team-licensing" className={linkClass}>
        Team licensing
      </Link>
    </nav>
  )
}

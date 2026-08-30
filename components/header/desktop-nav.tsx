"use client"

import Link from "next/link"
import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { MegaMenu } from "@/components/header/mega-menu"
import { cn } from "@/lib/utils"

interface Category {
  id: number
  slug: string
  name: string
  description: string | null
  iconName: string
}

interface Brand {
  id: number
  slug: string
  name: string
  categoryId: number
  isFeatured: boolean
}

export function DesktopNav({ categories, brands }: { categories: Category[]; brands: Brand[] }) {
  const [open, setOpen] = useState(false)

  return (
    <nav className="hidden items-center gap-1 lg:flex">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              onMouseEnter={() => setOpen(true)}
              className={cn(
                "flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary",
                open && "bg-secondary",
              )}
            />
          }
        >
          Browse
          <ChevronDown className={cn("size-3.5 opacity-60 transition-transform", open && "rotate-180")} />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={12}
          onMouseLeave={() => setOpen(false)}
          className="w-[640px] max-w-[90vw] p-0"
        >
          <MegaMenu categories={categories} brands={brands} />
        </PopoverContent>
      </Popover>

      <Link href="/deals" className="rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary">
        Deals
      </Link>
      <Link href="/countries" className="rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary">
        Countries
      </Link>
      <Link href="/bulk-gifting" className="rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:bg-secondary">
        Bulk Gifting
      </Link>
    </nav>
  )
}

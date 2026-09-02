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
}

export function DesktopNav({ categories }: { categories: Category[] }) {
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
                "flex items-center gap-1 rounded-full px-3 py-1.5 text-sm font-medium text-foreground/85 transition-colors hover:bg-accent/10 hover:text-accent",
                open && "bg-accent/10 text-accent",
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
          className="w-[520px] max-w-[92vw] p-0"
        >
          <MegaMenu categories={categories} />
        </PopoverContent>
      </Popover>

      <Link
        href="/products?free=true"
        className="rounded-full px-3 py-1.5 text-sm font-medium text-foreground/85 transition-colors hover:bg-accent/10 hover:text-accent"
      >
        Free Resources
      </Link>
      <Link
        href="/products?bundle=true"
        className="rounded-full px-3 py-1.5 text-sm font-medium text-foreground/85 transition-colors hover:bg-accent/10 hover:text-accent"
      >
        Bundles
      </Link>
      <Link
        href="/team-licensing"
        className="rounded-full px-3 py-1.5 text-sm font-medium text-foreground/85 transition-colors hover:bg-accent/10 hover:text-accent"
      >
        Team Licensing
      </Link>
    </nav>
  )
}

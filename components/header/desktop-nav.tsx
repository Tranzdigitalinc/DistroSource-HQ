"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { ChevronDown, Grid, ICON_SIZE } from "@/lib/storefront-icons"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { MegaMenu } from "@/components/header/mega-menu"
import { cn } from "@/lib/utils"

interface Subcategory {
  id: number
  slug: string
  name: string
  description: string | null
  icon: string | null
  productCount: number
}
interface Department extends Subcategory {
  subcategories: Subcategory[]
}

// "Bundles" is intentionally absent: every bundle is a draft today, so the
// link would open an empty grid. Add it back when the first bundle publishes.
const NAV_LINKS = [
  { href: "/products", label: "Products" },
  { href: "/deals", label: "Deals" },
  { href: "/licenses", label: "Licensing" },
]

export function DesktopNav({ departments }: { departments: Department[] }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const linkClass =
    "relative flex h-9 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

  return (
    <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
      {/* Click/keyboard to open (not hover): hover fought the trigger's own
          toggle, is unusable on touch and awkward with a keyboard. Base UI
          handles focus trapping and Escape. */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={<button type="button" aria-expanded={open} aria-haspopup="true" className={cn(linkClass, "text-foreground", open && "bg-secondary")} />}
        >
          <Grid size={ICON_SIZE.sm} aria-hidden="true" />
          Departments
          <ChevronDown
            size={ICON_SIZE.sm}
            className={cn("opacity-60 transition-transform duration-200 motion-reduce:transition-none", open && "rotate-180")}
            aria-hidden="true"
          />
        </PopoverTrigger>

        <PopoverContent align="start" sideOffset={8} className="w-[60rem] max-w-[94vw] overflow-hidden rounded-lg border-border p-0 shadow-[var(--shadow-e3)]">
          <MegaMenu departments={departments} onNavigate={() => setOpen(false)} />
        </PopoverContent>
      </Popover>

      {NAV_LINKS.map((link) => {
        const active = pathname === link.href
        return (
          <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={cn(linkClass, active && "text-foreground")}>
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}

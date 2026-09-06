"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { ChevronDown } from "@/lib/storefront-icons"
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

const NAV_LINKS = [
  { href: "/products", label: "Shop" },
  { href: "/gaming", label: "Gaming" },
  { href: "/deals", label: "Deals" },
  { href: "/licenses", label: "Licensing" },
]

export function DesktopNav({ departments }: { departments: Department[] }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  const linkClass =
    "relative flex h-10 items-center gap-1.5 px-2 text-[13px] font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

  return (
    <nav aria-label="Main" className="hidden items-center gap-1 lg:flex">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger
          render={
            <button
              type="button"
              aria-expanded={open}
              aria-haspopup="true"
              className={cn(linkClass, "text-foreground")}
            />
          }
        >
          Departments
          <ChevronDown
            size={13}
            aria-hidden="true"
            className={cn("opacity-55 transition-transform duration-200 motion-reduce:transition-none", open && "rotate-180")}
          />
        </PopoverTrigger>
        <PopoverContent
          align="start"
          sideOffset={14}
          className="w-[60rem] max-w-[94vw] overflow-hidden rounded-2xl border-border/80 p-0 shadow-[var(--shadow-e3)]"
        >
          <MegaMenu departments={departments} onNavigate={() => setOpen(false)} />
        </PopoverContent>
      </Popover>

      {NAV_LINKS.map((link) => {
        const active = link.href === "/gaming" ? pathname.startsWith("/gaming") : pathname === link.href
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? "page" : undefined}
            className={cn(linkClass, active && "text-foreground after:absolute after:inset-x-2 after:-bottom-[17px] after:h-0.5 after:bg-primary")}
          >
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}

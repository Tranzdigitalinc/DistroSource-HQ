"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Popover as PopoverPrimitive } from "@base-ui/react/popover"
import { ChevronDown, ICON_SIZE } from "@/lib/storefront-icons"
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

const NAV_LINKS: { href: string; label: string; badge?: string }[] = [
  { href: "/products", label: "Products" },
  { href: "/gaming", label: "Gaming", badge: "New" },
  { href: "/deals", label: "Deals" },
  { href: "/licenses", label: "Licensing" },
]

/**
 * Primary navigation. Departments opens on hover with intent (short delay,
 * so brushing past does not flash a panel) and on click/Enter for keyboard
 * and touch. The panel is a real popover: Escape closes, focus is managed.
 */
export function DesktopNav({ departments }: { departments: Department[] }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const linkClass =
    "relative flex h-9 items-center gap-1.5 rounded-full px-3 text-[13.5px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"

  return (
    <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
      <PopoverPrimitive.Root open={open} onOpenChange={setOpen}>
        <PopoverPrimitive.Trigger
          openOnHover
          delay={120}
          closeDelay={160}
          render={<button type="button" aria-expanded={open} aria-haspopup="true" className={cn(linkClass, "text-foreground", open && "bg-secondary")} />}
        >
          Departments
          <ChevronDown
            size={ICON_SIZE.sm}
            className={cn("opacity-60 transition-transform duration-200 motion-reduce:transition-none", open && "rotate-180")}
            aria-hidden="true"
          />
        </PopoverPrimitive.Trigger>
        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Positioner align="start" sideOffset={10} className="isolate z-50">
            <PopoverPrimitive.Popup
              className={cn(
                "w-[68rem] max-w-[calc(100vw-2rem)] origin-(--transform-origin) overflow-hidden rounded-2xl border border-border bg-popover text-popover-foreground shadow-[var(--shadow-e4)] outline-none",
                "duration-150 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-[0.98] data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-[0.98]",
              )}
            >
              <MegaMenu departments={departments} onNavigate={() => setOpen(false)} />
            </PopoverPrimitive.Popup>
          </PopoverPrimitive.Positioner>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>

      {NAV_LINKS.map((link) => {
        const active = link.href === "/gaming" ? pathname.startsWith("/gaming") : pathname === link.href
        return (
          <Link key={link.href} href={link.href} aria-current={active ? "page" : undefined} className={cn(linkClass, active && "text-foreground")}>
            {link.label}
            {link.badge && (
              <span className="rounded-full bg-primary px-1.5 py-px font-mono text-[9px] font-bold uppercase leading-[1.4] tracking-[0.06em] text-primary-foreground">
                {link.badge}
              </span>
            )}
          </Link>
        )
      })}
    </nav>
  )
}

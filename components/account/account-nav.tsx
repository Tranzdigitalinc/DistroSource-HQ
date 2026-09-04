"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import {
  Bell,
  ChevronDown,
  Dashboard,
  Download,
  FileText,
  Gift,
  Heart,
  Library,
  Lock,
  Package,
  Refresh,
  ShieldCheck,
  Support,
  User,
  ICON_SIZE,
} from "@/lib/storefront-icons"
import { cn } from "@/lib/utils"

type Item = { href: string; label: string; icon: React.ComponentType<{ size?: number; className?: string; "aria-hidden"?: boolean | "true" }> }

/** The seven destinations customers actually reach for, in journey order. */
const PRIMARY: Item[] = [
  { href: "/account", label: "Overview", icon: Dashboard },
  { href: "/account/library", label: "My Library", icon: Library },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/settings", label: "Profile", icon: User },
  { href: "/account/security", label: "Security", icon: Lock },
  { href: "/account/support", label: "Support", icon: Support },
]

/** Still real pages, but secondary — tucked under "More" so the sidebar stays short. */
const MORE: Item[] = [
  { href: "/account/downloads", label: "Download history", icon: Download },
  { href: "/account/licenses", label: "Licences", icon: ShieldCheck },
  { href: "/account/invoices", label: "Invoices", icon: FileText },
  { href: "/account/updates", label: "Product updates", icon: Refresh },
  { href: "/account/notifications", label: "Notifications", icon: Bell },
  { href: "/account/referrals", label: "Referrals", icon: Gift },
]

export function AccountNav() {
  const pathname = usePathname()
  const isActive = (href: string) => (href === "/account" ? pathname === href : pathname.startsWith(href))
  const moreActive = MORE.some((i) => isActive(i.href))
  const [moreOpen, setMoreOpen] = useState(moreActive)

  return (
    <nav aria-label="Account" className="md:sticky md:top-24">
      {/* Mobile: one horizontal strip of every destination. */}
      <div className="-mx-4 flex gap-1 overflow-x-auto px-4 pb-1 md:hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {[...PRIMARY, ...MORE].map((item) => (
          <NavLink key={item.href} item={item} active={isActive(item.href)} compact />
        ))}
      </div>

      <div className="hidden flex-col gap-1 md:flex">
        <ul className="flex flex-col gap-0.5">
          {PRIMARY.map((item) => (
            <li key={item.href}>
              <NavLink item={item} active={isActive(item.href)} />
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setMoreOpen((v) => !v)}
          aria-expanded={moreOpen}
          aria-controls="account-nav-more"
          className="mt-2 flex items-center gap-2 rounded-md px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.06em] text-muted-foreground hover:text-foreground"
        >
          More
          <ChevronDown size={12} className={cn("transition-transform", moreOpen && "rotate-180")} aria-hidden="true" />
        </button>
        <ul id="account-nav-more" className={cn("flex flex-col gap-0.5", !moreOpen && "hidden")}>
          {MORE.map((item) => (
            <li key={item.href}>
              <NavLink item={item} active={isActive(item.href)} />
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

function NavLink({ item, active, compact = false }: { item: Item; active: boolean; compact?: boolean }) {
  const Icon = item.icon
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex shrink-0 items-center gap-2.5 rounded-md text-sm font-medium transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        compact ? "whitespace-nowrap px-3 py-1.5" : "px-3 py-2",
        active ? "bg-secondary text-foreground" : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
      )}
    >
      <Icon size={ICON_SIZE.sm} className={cn("shrink-0", active && "text-primary")} aria-hidden="true" />
      {item.label}
    </Link>
  )
}

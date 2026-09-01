"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "motion/react"
import { LayoutDashboard, Package, KeyRound, Heart, User, ShieldCheck, Bell, LifeBuoy, Gift } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/account", label: "Overview", icon: LayoutDashboard },
  { href: "/account/orders", label: "Orders", icon: Package },
  { href: "/account/codes", label: "My codes", icon: KeyRound },
  { href: "/account/wishlist", label: "Wishlist", icon: Heart },
  { href: "/account/referrals", label: "Referrals", icon: Gift },
  { href: "/account/settings", label: "Profile settings", icon: User },
  { href: "/account/security", label: "Security", icon: ShieldCheck },
  { href: "/account/notifications", label: "Notifications", icon: Bell },
  { href: "/account/support", label: "Support", icon: LifeBuoy },
]

export function AccountNav() {
  const pathname = usePathname()

  return (
    <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible" aria-label="Account navigation">
      {navItems.map((item) => {
        const isActive = item.href === "/account" ? pathname === item.href : pathname.startsWith(item.href)
        const Icon = item.icon
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive ? "text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            {isActive && (
              <motion.span
                layoutId="account-nav-active"
                className="absolute inset-0 rounded-lg bg-primary/10"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <Icon className="relative z-10 size-4" aria-hidden="true" />
            <span className="relative z-10">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

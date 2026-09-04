"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { DesktopNav } from "@/components/header/desktop-nav"
import { MobileNav } from "@/components/header/mobile-nav"
import { HeaderSearch } from "@/components/header/header-search"
import { CartTrigger } from "@/components/header/cart-trigger"
import { AccountMenu } from "@/components/header/account-menu"
import { ThemeToggle } from "@/components/header/theme-toggle"
import { TrustStrip } from "@/components/header/trust-strip"
import { BrandLogo } from "@/components/brand-logo"
import { Heart, ICON_SIZE } from "@/lib/storefront-icons"
import { cn } from "@/lib/utils"

type Subcategory = {
  id: number
  slug: string
  name: string
  description: string | null
  icon: string | null
  productCount: number
}
type Department = Subcategory & { subcategories: Subcategory[] }

/**
 * Storefront header. Two rows on desktop — a quiet navy strip with three
 * verifiable promises, then logo / departments / search / actions. Search
 * takes the widest share of the row because a catalog this size is
 * navigated by search more than by menu. Compacts once the user scrolls.
 */
export function SiteHeaderClient({ departments = [] }: { departments?: Department[] }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header className={cn("sticky top-0 z-40 border-b border-border bg-background", scrolled && "shadow-[var(--shadow-e1)]")}>
      <div
        className={cn("overflow-hidden transition-all duration-300 ease-out motion-reduce:transition-none", scrolled ? "max-h-0 opacity-0" : "max-h-10 opacity-100")}
        aria-hidden={scrolled}
      >
        <TrustStrip />
      </div>

      <div
        className={cn(
          "mx-auto flex max-w-[90rem] items-center gap-2 px-4 transition-[height] duration-300 ease-out motion-reduce:transition-none sm:gap-3 sm:px-6",
          scrolled ? "h-14" : "h-16 lg:h-[4.25rem]",
        )}
      >
        <MobileNav departments={departments} />

        <Link href="/" aria-label="DistroSource home" className="flex shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <BrandLogo href={null} heightClassName={cn("transition-all duration-300 motion-reduce:transition-none", scrolled ? "h-7" : "h-8 sm:h-9")} />
        </Link>

        <DesktopNav departments={departments} />

        <HeaderSearch className="mx-auto hidden w-full max-w-2xl flex-1 md:block" />

        <div className="ml-auto flex shrink-0 items-center gap-0.5 md:ml-0">
          <ThemeToggle />
          <Link
            href="/account/wishlist"
            className="hidden h-10 items-center gap-2 rounded-md px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex"
            aria-label="Wishlist"
          >
            <Heart size={ICON_SIZE.nav} aria-hidden="true" />
            <span className="hidden xl:inline">Wishlist</span>
          </Link>
          <AccountMenu />
          <CartTrigger />
        </div>
      </div>

      <div className="border-t border-border px-4 py-2 md:hidden">
        <HeaderSearch />
      </div>
    </header>
  )
}

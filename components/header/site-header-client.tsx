"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { motion } from "motion/react"
import { DesktopNav } from "@/components/header/desktop-nav"
import { MobileNav } from "@/components/header/mobile-nav"
import { SearchTrigger } from "@/components/header/search-command"
import { CartTrigger } from "@/components/header/cart-trigger"
import { AccountMenu } from "@/components/header/account-menu"
import { ThemeToggle } from "@/components/header/theme-toggle"
import { AnnouncementBar } from "@/components/header/announcement-bar"
import { BrandLogo } from "@/components/brand-logo"
import { VerifyEmailBanner } from "@/components/verify-email-banner"
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
 * Floating glass header. At the top of the page it sits flush and full
 * width; once the page scrolls it detaches into a rounded, blurred bar
 * with a hairline and a soft shadow — the page content visibly passes
 * underneath it.
 */
export function SiteHeaderClient({ departments = [] }: { departments?: Department[] }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <>
      <AnnouncementBar />
      <VerifyEmailBanner />
      <header className={cn("sticky top-0 z-40 transition-[padding] duration-300", scrolled ? "px-3 pt-3 sm:px-5" : "px-0 pt-0")}>
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 300, damping: 34 }}
          className={cn(
            "mx-auto flex h-16 items-center gap-3 transition-[border-radius,box-shadow,background-color] duration-300",
            scrolled
              ? "glass max-w-[80rem] rounded-full border border-border px-3 shadow-[var(--shadow-e3)] sm:px-4"
              : "container-x border-b border-transparent bg-background",
          )}
        >
          <MobileNav departments={departments} />

          <Link href="/" aria-label="DistroSource home" className="flex shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <BrandLogo href={null} heightClassName="h-8 sm:h-9" />
          </Link>

          <DesktopNav departments={departments} />

          <div className="mx-auto hidden w-full max-w-sm flex-1 md:block xl:max-w-md">
            <SearchTrigger />
          </div>

          <div className="ml-auto flex shrink-0 items-center gap-0.5 md:ml-0">
            <SearchTrigger size="icon" className="md:hidden" />
            <ThemeToggle />
            <Link
              href="/account/wishlist"
              className="hidden size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex"
              aria-label="Wishlist"
            >
              <Heart size={ICON_SIZE.nav} aria-hidden="true" />
            </Link>
            <AccountMenu />
            <CartTrigger />
          </div>
        </motion.div>
      </header>
    </>
  )
}

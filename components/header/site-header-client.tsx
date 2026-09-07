"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { DesktopNav } from "@/components/header/desktop-nav"
import { MobileNav } from "@/components/header/mobile-nav"
import { SearchTrigger } from "@/components/header/search-command"
import { CartTrigger } from "@/components/header/cart-trigger"
import { AccountMenu } from "@/components/header/account-menu"
import { ThemeToggle } from "@/components/header/theme-toggle"
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
 * Storefront header: one slim row. Logo, departments and links on the left;
 * the search pill in the middle; theme, wishlist, account and cart on the
 * right. Becomes translucent with a hairline once the page scrolls.
 */
export function SiteHeaderClient({ departments = [] }: { departments?: Department[] }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-200",
        scrolled
          ? "border-border bg-background/85 shadow-[var(--shadow-e1)] backdrop-blur-md supports-[backdrop-filter]:bg-background/75"
          : "border-transparent bg-background",
      )}
    >
      <VerifyEmailBanner />

      <div className="container-x flex h-16 items-center gap-3">
        <MobileNav departments={departments} />

        <Link href="/" aria-label="DistroSource home" className="flex shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <BrandLogo href={null} heightClassName="h-8 sm:h-9" />
        </Link>

        <DesktopNav departments={departments} />

        <div className="mx-auto hidden w-full max-w-md flex-1 md:block lg:max-w-sm xl:max-w-md">
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
      </div>
    </header>
  )
}

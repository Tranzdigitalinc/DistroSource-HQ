"use client"

import Link from "next/link"
import { DesktopNav } from "@/components/header/desktop-nav"
import { MobileNav } from "@/components/header/mobile-nav"
import { HeaderSearch } from "@/components/header/header-search"
import { CartTrigger } from "@/components/header/cart-trigger"
import { AccountMenu } from "@/components/header/account-menu"
import { ThemeToggle } from "@/components/header/theme-toggle"
import { BrandLogo } from "@/components/brand-logo"
import { VerifyEmailBanner } from "@/components/verify-email-banner"
import { Heart } from "@/lib/storefront-icons"

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
 * Premium storefront shell: one calm navigation row, strong search and no
 * decorative chrome. The catalog should be the visual event, not the header.
 */
export function SiteHeaderClient({ departments = [] }: { departments?: Department[] }) {
  return (
    <header className="sticky top-0 z-50 border-b border-border/80 bg-background/88 backdrop-blur-xl supports-[backdrop-filter]:bg-background/78">
      <VerifyEmailBanner />

      <div className="mx-auto flex h-[72px] max-w-[94rem] items-center gap-3 px-4 sm:px-6 lg:gap-5 lg:px-8">
        <MobileNav departments={departments} />

        <Link
          href="/"
          aria-label="DistroSource home"
          className="flex shrink-0 items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <BrandLogo href={null} heightClassName="h-8 sm:h-9" />
        </Link>

        <DesktopNav departments={departments} />

        <HeaderSearch className="mx-auto hidden w-full max-w-[34rem] flex-1 md:block" />

        <div className="ml-auto flex shrink-0 items-center gap-0.5 md:ml-0">
          <Link
            href="/account/wishlist"
            aria-label="Wishlist"
            className="hidden size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:flex"
          >
            <Heart size={19} aria-hidden="true" />
          </Link>
          <ThemeToggle />
          <AccountMenu />
          <CartTrigger />
        </div>
      </div>

      <div className="border-t border-border/70 px-4 py-2.5 md:hidden sm:px-6">
        <HeaderSearch />
      </div>
    </header>
  )
}

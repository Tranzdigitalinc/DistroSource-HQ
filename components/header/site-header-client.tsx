"use client"

import Link from "next/link"
import { DesktopNav } from "@/components/header/desktop-nav"
import { MobileNav } from "@/components/header/mobile-nav"
import { HeaderSearch } from "@/components/header/header-search"
import { CartTrigger } from "@/components/header/cart-trigger"
import { AccountMenu } from "@/components/header/account-menu"
import { ThemeToggle } from "@/components/header/theme-toggle"
import { TrustStrip } from "@/components/header/trust-strip"
import { BrandLogo } from "@/components/brand-logo"

type Category = { id: number; slug: string; name: string; description: string | null }

export function SiteHeaderClient({ categories = [] }: { categories?: Category[] }) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/98 backdrop-blur-sm supports-backdrop-filter:bg-background/90">
      <TrustStrip />
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6">
        <MobileNav categories={categories} />
        <Link href="/" className="flex min-w-0 shrink items-center gap-2 transition-opacity hover:opacity-90"><BrandLogo href={null} heightClassName="h-11 sm:h-12" /></Link>
        <DesktopNav categories={categories} />
        <HeaderSearch className="mx-auto hidden max-w-md flex-1 md:block" categories={categories} />
        <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1"><ThemeToggle /><CartTrigger /><AccountMenu /></div>
      </div>
      <div className="border-t border-border/60 px-4 py-2 md:hidden"><HeaderSearch categories={categories} /></div>
    </header>
  )
}

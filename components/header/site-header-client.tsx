"use client"

import Link from "next/link"
import { DesktopNav } from "@/components/header/desktop-nav"
import { MobileNav } from "@/components/header/mobile-nav"
import { HeaderSearch } from "@/components/header/header-search"
import { CountrySelector } from "@/components/header/country-selector"
import { CartTrigger } from "@/components/header/cart-trigger"
import { AccountMenu } from "@/components/header/account-menu"
import { ThemeToggle } from "@/components/header/theme-toggle"
import { TrustStrip } from "@/components/header/trust-strip"
import { BrandLogo } from "@/components/brand-logo"

type Category = { id: number; slug: string; name: string; description: string | null; iconName: string; productCount?: number }
type Brand = { id: number; slug: string; name: string; categoryId: number; isFeatured: boolean; logoUrl?: string | null }

export function SiteHeaderClient({ categories = [], brands = [] }: { categories?: Category[]; brands?: Brand[] }) {
  return (
    <header className="glass-panel sticky top-0 z-40 border-b border-accent/15 supports-backdrop-filter:bg-background/60">
      <TrustStrip />
      <div className="mx-auto flex h-[68px] max-w-7xl items-center gap-3 px-4 sm:px-6">
        <MobileNav categories={categories} />
        <Link href="/" className="flex min-w-0 shrink items-center gap-2 transition-opacity hover:opacity-90"><BrandLogo href={null} heightClassName="h-14 sm:h-16" /></Link>
        <DesktopNav categories={categories} brands={brands} />
        <HeaderSearch className="mx-auto hidden max-w-md flex-1 md:block" brands={brands} categories={categories} />
        <div className="ml-auto flex shrink-0 items-center gap-0.5 sm:gap-1"><ThemeToggle /><CountrySelector /><CartTrigger /><AccountMenu /></div>
      </div>
      <div className="border-t border-border/60 px-4 py-2 md:hidden"><HeaderSearch brands={brands} categories={categories} /></div>
    </header>
  )
}

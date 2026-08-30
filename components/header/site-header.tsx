import Link from "next/link"
import { getBrands, getCategories } from "@/lib/queries/catalog"
import { DesktopNav } from "@/components/header/desktop-nav"
import { MobileNav } from "@/components/header/mobile-nav"
import { HeaderSearch } from "@/components/header/header-search"
import { CountrySelector } from "@/components/header/country-selector"
import { CartTrigger } from "@/components/header/cart-trigger"
import { AccountMenu } from "@/components/header/account-menu"
import { ThemeToggle } from "@/components/header/theme-toggle"
import { TrustStrip } from "@/components/header/trust-strip"
import { BrandLogo } from "@/components/brand-logo"

export async function SiteHeader() {
  const [categories, brands] = await Promise.all([getCategories(), getBrands()])

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/80">
      <TrustStrip />
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <MobileNav categories={categories} />

        <Link href="/" className="flex shrink-0 items-center">
          <BrandLogo href={null} height={44} />
        </Link>

        <DesktopNav categories={categories} brands={brands} />

        <HeaderSearch className="mx-auto hidden max-w-md flex-1 md:block" />

        <div className="ml-auto flex items-center gap-1">
          <ThemeToggle />
          <CountrySelector />
          <CartTrigger />
          <AccountMenu />
        </div>
      </div>
      <div className="border-t border-border/60 px-4 py-2 md:hidden">
        <HeaderSearch />
      </div>
    </header>
  )
}

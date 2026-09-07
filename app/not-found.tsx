import Link from "next/link"
import { ArrowRight, Grid, ShoppingBag, ICON_SIZE } from "@/lib/storefront-icons"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { HeaderSearch } from "@/components/header/header-search"
import { Reveal } from "@/components/motion/reveal"

export const metadata = {
  title: "Page not found — DistroSource",
}

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-24">
        <span aria-hidden="true" className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 select-none font-display text-[18rem] font-black leading-none tracking-tighter text-foreground/[0.04] sm:text-[26rem]">
          404
        </span>
        <Reveal className="relative flex w-full max-w-lg flex-col items-center text-center">
          <p className="eyebrow">Not found</p>
          <h1 className="text-display mt-4 text-4xl sm:text-5xl">This page has moved on.</h1>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            The page you&apos;re after doesn&apos;t exist, or the link is out of date. Search the catalog or start from a department.
          </p>
          <div className="mt-8 w-full max-w-md">
            <HeaderSearch className="w-full" size="lg" />
          </div>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button nativeButton={false} render={<Link href="/products" />} className="h-10 rounded-full px-4 font-semibold">
              <ShoppingBag size={ICON_SIZE.base} aria-hidden="true" />
              Browse products
            </Button>
            <Button variant="outline" nativeButton={false} render={<Link href="/categories" />} className="h-10 rounded-full bg-transparent px-4 font-semibold">
              <Grid size={ICON_SIZE.base} aria-hidden="true" />
              Departments
            </Button>
            <Button variant="ghost" nativeButton={false} render={<Link href="/" />} className="h-10 rounded-full px-4 font-semibold">
              Home
              <ArrowRight size={ICON_SIZE.base} aria-hidden="true" />
            </Button>
          </div>
        </Reveal>
      </main>
      <SiteFooter />
    </div>
  )
}

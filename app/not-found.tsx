import Link from "next/link"
import { ArrowRight, Grid, SearchEmpty, ShoppingBag, ICON_SIZE } from "@/lib/storefront-icons"
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
      <main className="flex flex-1 items-center justify-center px-6 py-20">
        <Reveal className="flex w-full max-w-lg flex-col items-center text-center">
          <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
            <SearchEmpty size={ICON_SIZE.feature} aria-hidden="true" />
          </span>

          <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">
            This page has moved on.
          </h1>
          <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-muted-foreground">
            The page you&apos;re after doesn&apos;t exist, or the link is out of date. Search the catalog or
            start from a department.
          </p>

          <div className="mt-7 w-full max-w-md">
            <HeaderSearch className="w-full" />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button nativeButton={false} render={<Link href="/products" />} className="font-semibold">
              <ShoppingBag size={ICON_SIZE.base} aria-hidden="true" />
              Browse products
            </Button>
            <Button
              variant="outline"
              nativeButton={false}
              render={<Link href="/categories" />}
              className="bg-transparent font-semibold"
            >
              <Grid size={ICON_SIZE.base} aria-hidden="true" />
              Departments
            </Button>
            <Button variant="ghost" nativeButton={false} render={<Link href="/" />} className="font-semibold">
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

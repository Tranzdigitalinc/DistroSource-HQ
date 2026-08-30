import Link from "next/link"
import { ArrowRight, SearchX, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { Reveal } from "@/components/motion/reveal"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <Reveal className="flex max-w-md flex-col items-center text-center">
          <span className="relative flex size-20 items-center justify-center rounded-2xl bg-secondary">
            <SearchX className="size-9 text-muted-foreground" />
            <span className="absolute -right-1 -top-1 flex size-7 items-center justify-center rounded-full bg-destructive/15 text-destructive">
              <span className="font-display text-sm font-bold">!</span>
            </span>
          </span>
          <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">Page not found</h1>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or may have moved. Check the URL, or head back to
            browse our full catalog.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button nativeButton={false} render={<Link href="/" />}>
              Back to home
            </Button>
            <Button variant="outline" nativeButton={false} render={<Link href="/products" />}>
              <ShoppingBag className="size-4" />
              Browse products
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </Reveal>
      </main>
      <SiteFooter />
    </div>
  )
}

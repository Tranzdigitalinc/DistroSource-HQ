import Link from "next/link"
import { ArrowRight, SearchX } from "lucide-react"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex flex-1 items-center justify-center px-6 py-24">
        <div className="flex max-w-md flex-col items-center text-center">
          <span className="flex size-16 items-center justify-center rounded-2xl bg-secondary text-muted-foreground">
            <SearchX className="size-8" />
          </span>
          <h1 className="mt-6 font-display text-3xl font-bold tracking-tight">Page not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The page you&apos;re looking for doesn&apos;t exist or may have moved. Check the URL, or head back to
            browse our full catalog.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button nativeButton={false} render={<Link href="/" />}>
              Back to home
            </Button>
            <Button variant="outline" nativeButton={false} render={<Link href="/products" />}>
              Browse all products
              <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

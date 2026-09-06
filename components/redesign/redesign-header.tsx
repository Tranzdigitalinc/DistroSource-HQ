import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"
import { AccountMenu } from "@/components/header/account-menu"
import { CartTrigger } from "@/components/header/cart-trigger"
import { ThemeToggle } from "@/components/header/theme-toggle"
import { ArrowUpRight, Menu, Search } from "@/lib/storefront-icons"
import type { getCategoryTree } from "@/lib/queries/catalog"

type Departments = Awaited<ReturnType<typeof getCategoryTree>>

function PreviewSearch({ compact = false }: { compact?: boolean }) {
  return (
    <form
      action="/redesign-preview/products"
      method="get"
      role="search"
      className={compact ? "relative w-full" : "relative hidden w-full max-w-xl md:block"}
    >
      <Search
        size={18}
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
      />
      <input
        name="q"
        type="search"
        placeholder="Search templates, assets, systems..."
        className="h-11 w-full border border-border bg-secondary/35 pl-11 pr-4 text-sm text-foreground outline-none transition-[border-color,background-color,box-shadow] placeholder:text-muted-foreground focus:border-primary/60 focus:bg-background focus:shadow-[0_0_0_3px_color-mix(in_oklch,var(--primary)_10%,transparent)]"
      />
    </form>
  )
}

export function RedesignHeader({ departments }: { departments: Departments }) {
  const visible = departments.filter((department) => department.productCount > 0).slice(0, 6)

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/92 backdrop-blur-xl supports-[backdrop-filter]:bg-background/82">
      <div className="border-b border-border bg-navy text-navy-foreground">
        <div className="mx-auto flex min-h-8 max-w-[1500px] items-center justify-between gap-4 px-4 py-1.5 sm:px-8 lg:px-10">
          <p className="font-mono text-[9px] font-semibold uppercase tracking-[0.14em] text-navy-foreground/65 sm:text-[10px]">
            Preview build · reference-led storefront
          </p>
          <div className="hidden items-center gap-5 font-mono text-[9px] uppercase tracking-[0.08em] text-navy-foreground/55 sm:flex">
            <span>Instant access</span>
            <span>Clear licensing</span>
            <span>Secure checkout</span>
          </div>
        </div>
      </div>

      <div className="mx-auto flex h-[72px] max-w-[1500px] items-center gap-4 px-4 sm:px-8 lg:px-10">
        <details className="group relative md:hidden">
          <summary className="flex size-10 cursor-pointer list-none items-center justify-center border border-border text-foreground transition-colors hover:border-primary/40 hover:text-primary [&::-webkit-details-marker]:hidden">
            <Menu size={20} aria-hidden="true" />
            <span className="sr-only">Open navigation</span>
          </summary>
          <div className="absolute left-0 top-[calc(100%+0.75rem)] w-[min(86vw,22rem)] border border-border bg-background p-3 shadow-[var(--shadow-e2)]">
            <nav aria-label="Preview mobile navigation" className="grid gap-1">
              <Link href="/redesign-preview/products" className="px-3 py-3 text-sm font-semibold hover:bg-secondary/50">
                All products
              </Link>
              {visible.map((department) => (
                <Link
                  key={department.slug}
                  href={`/redesign-preview/products?category=${encodeURIComponent(department.slug)}`}
                  className="flex items-center justify-between gap-3 px-3 py-3 text-sm hover:bg-secondary/50"
                >
                  <span>{department.name}</span>
                  <span className="font-mono text-[10px] text-muted-foreground">{department.productCount}</span>
                </Link>
              ))}
              <Link href="/gaming" className="mt-1 border-t border-border px-3 py-3 text-sm font-semibold text-primary">
                Gaming assets
              </Link>
            </nav>
          </div>
        </details>

        <Link
          href="/redesign-preview"
          aria-label="DistroSource redesign preview home"
          className="flex shrink-0 items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <BrandLogo href={null} heightClassName="h-8 sm:h-9" />
        </Link>

        <nav aria-label="Preview primary navigation" className="hidden items-center gap-1 lg:flex">
          <Link
            href="/redesign-preview/products"
            className="px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:text-primary"
          >
            Products
          </Link>
          <details className="group relative">
            <summary className="cursor-pointer list-none px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:text-primary [&::-webkit-details-marker]:hidden">
              Departments
            </summary>
            <div className="absolute left-0 top-[calc(100%+1.05rem)] w-[36rem] border border-border bg-background p-4 shadow-[var(--shadow-e2)]">
              <div className="grid grid-cols-2 gap-px bg-border">
                {visible.map((department) => (
                  <Link
                    key={department.slug}
                    href={`/redesign-preview/products?category=${encodeURIComponent(department.slug)}`}
                    className="group/item flex min-h-24 flex-col justify-between bg-background p-4 transition-colors hover:bg-secondary/45"
                  >
                    <span className="font-display text-base font-bold tracking-tight">{department.name}</span>
                    <span className="flex items-center justify-between gap-3 font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">
                      {department.productCount} products
                      <ArrowUpRight className="size-3.5 transition-transform group-hover/item:-translate-y-0.5 group-hover/item:translate-x-0.5" />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </details>
          <Link href="/gaming" className="px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:text-primary">
            Gaming
          </Link>
        </nav>

        <PreviewSearch />

        <div className="ml-auto flex shrink-0 items-center gap-0.5">
          <ThemeToggle />
          <AccountMenu />
          <CartTrigger />
        </div>
      </div>

      <div className="border-t border-border px-4 py-2.5 md:hidden sm:px-8">
        <PreviewSearch compact />
      </div>

      <div className="hidden border-t border-border lg:block">
        <div className="mx-auto flex max-w-[1500px] items-center gap-1 overflow-x-auto px-10 py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
          <span className="mr-2 text-primary">Browse:</span>
          {visible.map((department) => (
            <Link
              key={department.slug}
              href={`/redesign-preview/products?category=${encodeURIComponent(department.slug)}`}
              className="whitespace-nowrap px-2.5 py-1.5 transition-colors hover:text-foreground"
            >
              {department.name}
            </Link>
          ))}
        </div>
      </div>
    </header>
  )
}

import Link from "next/link"
import { BrandLogo } from "@/components/brand-logo"
import { ArrowUpRight, Download, ShieldCheck } from "@/lib/storefront-icons"

const shopLinks = [
  { label: "All products", href: "/redesign-preview/products" },
  { label: "Business & Office", href: "/redesign-preview/products?category=business-office" },
  { label: "Web & Development", href: "/redesign-preview/products?category=web-development" },
  { label: "Design Resources", href: "/redesign-preview/products?category=design-resources" },
]

const supportLinks = [
  { label: "Help Center", href: "/help" },
  { label: "Licensing", href: "/licenses" },
  { label: "Contact", href: "/contact" },
  { label: "Refund Policy", href: "/legal/refund-policy" },
]

export function RedesignFooter() {
  return (
    <footer className="border-t border-navy-foreground/10 bg-navy text-navy-foreground">
      <div className="mx-auto max-w-[1500px] px-6 py-14 sm:px-8 lg:px-10 lg:py-20">
        <div className="grid gap-14 lg:grid-cols-[1.35fr_0.65fr_0.65fr]">
          <div className="max-w-xl">
            <BrandLogo heightClassName="h-10" />
            <h2 className="mt-8 font-display text-4xl font-black leading-[0.95] tracking-[-0.045em] sm:text-5xl">
              Everything digital.
              <span className="block text-primary">One source.</span>
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-6 text-navy-foreground/60 sm:text-base">
              Curated digital products for business, design, development, gaming and everyday work — with clear licensing and instant access.
            </p>

            <div className="mt-8 grid gap-px border border-navy-foreground/10 bg-navy-foreground/10 sm:grid-cols-2">
              <div className="flex items-center gap-3 bg-navy px-4 py-4 text-sm text-navy-foreground/75">
                <Download size={18} className="text-primary" aria-hidden="true" />
                Instant digital delivery
              </div>
              <div className="flex items-center gap-3 bg-navy px-4 py-4 text-sm text-navy-foreground/75">
                <ShieldCheck size={18} className="text-primary" aria-hidden="true" />
                Secure payment flow
              </div>
            </div>
          </div>

          <nav aria-label="Preview shop links">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-foreground/35">Shop</p>
            <ul className="mt-5 space-y-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group inline-flex items-center gap-2 text-sm text-navy-foreground/70 transition-colors hover:text-navy-foreground"
                  >
                    {link.label}
                    <ArrowUpRight className="size-3.5 opacity-0 transition-all group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Preview support links">
            <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-navy-foreground/35">Support</p>
            <ul className="mt-5 space-y-3">
              {supportLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-navy-foreground/70 transition-colors hover:text-navy-foreground">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-navy-foreground/10 pt-6 font-mono text-[10px] uppercase tracking-[0.08em] text-navy-foreground/35 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} DistroSource</p>
          <div className="flex flex-wrap gap-x-5 gap-y-2">
            <Link href="/legal/terms" className="hover:text-navy-foreground">Terms</Link>
            <Link href="/legal/privacy" className="hover:text-navy-foreground">Privacy</Link>
            <Link href="/legal/cookie-policy" className="hover:text-navy-foreground">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

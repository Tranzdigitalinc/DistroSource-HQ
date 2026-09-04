"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowRight, Check, ShieldCheck, ICON_SIZE } from "@/lib/storefront-icons"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import { subscribeToNewsletter } from "@/lib/actions/newsletter"

// "Bundles" is absent on purpose: every bundle is a draft, so the listing
// is empty. Add it back when the first bundle publishes.
const columns = [
  {
    title: "Shop",
    links: [
      { label: "Departments", href: "/categories" },
      { label: "Products", href: "/products" },
      { label: "Deals", href: "/deals" },
      { label: "New arrivals", href: "/products?sort=newest" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Licensing", href: "/licenses" },
      { label: "Team licensing", href: "/team-licensing" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Terms", href: "/legal/terms" },
      { label: "Privacy", href: "/legal/privacy" },
      { label: "Refund Policy", href: "/legal/refund-policy" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Orders", href: "/account/orders" },
      { label: "Downloads", href: "/account/library" },
      { label: "Wishlist", href: "/account/wishlist" },
    ],
  },
]

const legalLinks = [
  { label: "Cookie Policy", href: "/legal/cookie-policy" },
  { label: "Acceptable Use", href: "/legal/acceptable-use" },
  { label: "Payment Terms", href: "/legal/payment-terms" },
]

function NewsletterForm() {
  const [email, setEmail] = useState("")
  const [isPending, startTransition] = useTransition()
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    startTransition(async () => {
      try {
        await subscribeToNewsletter(email)
        setSubmitted(true)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not subscribe. Please try again.")
      }
    })
  }

  if (submitted) {
    return (
      <p className="flex items-center gap-2 text-sm text-navy-foreground/80" role="status">
        <Check size={ICON_SIZE.sm} className="text-primary" aria-hidden="true" />
        You&apos;re subscribed. Watch your inbox.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm gap-2">
      <label htmlFor="footer-email" className="sr-only">
        Email address
      </label>
      <input
        id="footer-email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        autoComplete="email"
        required
        className="h-10 min-w-0 flex-1 rounded-md border border-navy-foreground/20 bg-navy-foreground/5 px-3 text-sm text-navy-foreground placeholder:text-navy-foreground/40 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
      <Button type="submit" disabled={isPending} className="shrink-0 px-4 font-semibold">
        Subscribe
        <ArrowRight size={ICON_SIZE.sm} aria-hidden="true" />
      </Button>
    </form>
  )
}

export function SiteFooter() {
  return (
    <footer className="bg-navy text-navy-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)]">
          <div className="flex max-w-sm flex-col gap-5">
            <BrandLogo heightClassName="h-10" />
            <p className="text-sm leading-relaxed text-navy-foreground/65">
              Professional downloadable digital products for business, design, development and everyday work.
            </p>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.08em] text-navy-foreground/50">Newsletter</p>
              <NewsletterForm />
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-navy-foreground/50">{column.title}</h3>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="text-sm text-navy-foreground/75 transition-colors hover:text-navy-foreground">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-navy-foreground/15 pt-6 text-xs text-navy-foreground/55 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>&copy; {new Date().getFullYear()} DistroSource</span>
            {legalLinks.map((l) => (
              <Link key={l.href} href={l.href} className="transition-colors hover:text-navy-foreground">
                {l.label}
              </Link>
            ))}
          </div>
          {/* Text disclosure only — no card or wallet logos. Which methods
              Polar exposes is configured in Polar, not knowable here. */}
          <p className="flex items-center gap-1.5">
            <ShieldCheck size={ICON_SIZE.sm} className="shrink-0 text-primary" aria-hidden="true" />
            Payments processed securely by Polar, our Merchant of Record.
          </p>
        </div>
      </div>
    </footer>
  )
}

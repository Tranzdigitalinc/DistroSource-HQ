"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowRight, ArrowUp, Check, Download, Lock, Refresh, ShieldCheck, ICON_SIZE } from "@/lib/storefront-icons"
import { BrandLogo } from "@/components/brand-logo"
import { subscribeToNewsletter } from "@/lib/actions/newsletter"

const columns = [
  {
    title: "Departments",
    links: [
      { label: "Business & Office", href: "/categories/business-office" },
      { label: "Web & Development", href: "/categories/web-development" },
      { label: "Design Resources", href: "/categories/design-resources" },
      { label: "Fonts & Typography", href: "/categories/fonts-typography" },
      { label: "Media", href: "/categories/media" },
      { label: "3D & Print", href: "/categories/3d-and-print" },
      { label: "Gaming", href: "/gaming" },
    ],
  },
  {
    title: "Shop",
    links: [
      { label: "All products", href: "/products" },
      { label: "New arrivals", href: "/products?sort=newest" },
      { label: "Deals", href: "/deals" },
      { label: "Free products", href: "/products?free=true" },
      { label: "Bundles", href: "/categories/product-bundles" },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Licensing", href: "/licenses" },
      { label: "Team licensing", href: "/team-licensing" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "My Library", href: "/account/library" },
      { label: "Orders", href: "/account/orders" },
      { label: "Wishlist", href: "/account/wishlist" },
      { label: "Settings", href: "/account/settings" },
    ],
  },
]

const legalLinks = [
  { label: "Terms", href: "/legal/terms" },
  { label: "Privacy", href: "/legal/privacy" },
  { label: "Refunds", href: "/legal/refund-policy" },
  { label: "Cookies", href: "/legal/cookie-policy" },
  { label: "Acceptable Use", href: "/legal/acceptable-use" },
  { label: "Payment Terms", href: "/legal/payment-terms" },
]

const promises = [
  { icon: Download, title: "Instant delivery", body: "Files unlock the moment you pay." },
  { icon: ShieldCheck, title: "Licence up front", body: "Terms shown before checkout." },
  { icon: Refresh, title: "Re-download anytime", body: "Everything stays in My Library." },
  { icon: Lock, title: "Secure checkout", body: "Polar or TamPay handle payment." },
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
        <Check size={ICON_SIZE.sm} weight="bold" className="text-primary" aria-hidden="true" />
        You&apos;re subscribed. Watch your inbox.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md items-center rounded-full border border-navy-foreground/15 bg-navy-foreground/[0.06] p-1 pl-4 transition-colors focus-within:border-primary/70">
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
        className="h-10 min-w-0 flex-1 bg-transparent text-sm text-navy-foreground placeholder:text-navy-foreground/40 focus:outline-none"
      />
      <button
        type="submit"
        disabled={isPending}
        className="flex h-10 shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
      >
        Subscribe
        <ArrowRight size={ICON_SIZE.sm} weight="bold" aria-hidden="true" />
      </button>
    </form>
  )
}

/**
 * Mega footer on navy: the four promises as a strip, then brand + newsletter
 * beside four link columns, legal row, and the oversized clipped wordmark.
 */
export function SiteFooter() {
  return (
    <footer className="grain relative overflow-hidden bg-navy text-navy-foreground">
      <div aria-hidden className="mesh-blob animate-mesh-2 pointer-events-none left-[-10%] top-[-30%] h-[30rem] w-[30rem] bg-primary/15" />

      <div className="container-x relative">
        <ul className="grid grid-cols-2 gap-x-6 gap-y-6 border-b border-navy-foreground/10 py-10 lg:grid-cols-4">
          {promises.map((p) => (
            <li key={p.title} className="flex items-start gap-3">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy-foreground/[0.07] text-primary">
                <p.icon size={ICON_SIZE.nav} weight="duotone" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">{p.title}</p>
                <p className="mt-0.5 text-xs text-navy-foreground/55">{p.body}</p>
              </div>
            </li>
          ))}
        </ul>

        <div className="grid gap-12 py-14 lg:grid-cols-[minmax(0,4fr)_minmax(0,8fr)] lg:gap-16">
          <div className="flex max-w-md flex-col gap-6">
            <BrandLogo heightClassName="h-10" variant="on-dark" />
            <p className="text-sm leading-relaxed text-navy-foreground/65">
              The department store for digital work — templates, fonts, code, media and game-server resources, delivered the moment you pay.
            </p>
            <div>
              <p className="eyebrow mb-3 text-navy-foreground/55">New products, once a week</p>
              <NewsletterForm />
            </div>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-navy-foreground/50">{column.title}</h3>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="group inline-flex items-center gap-1 text-sm text-navy-foreground/75 transition-colors hover:text-navy-foreground">
                        {link.label}
                        <ArrowRight size={11} weight="bold" className="-translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 text-primary" aria-hidden="true" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-4 border-t border-navy-foreground/10 py-6 text-xs text-navy-foreground/55 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>&copy; {new Date().getFullYear()} DistroSource</span>
            {legalLinks.map((l) => (
              <Link key={l.href} href={l.href} className="transition-colors hover:text-navy-foreground">
                {l.label}
              </Link>
            ))}
          </div>
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex items-center gap-1.5 self-start rounded-full border border-navy-foreground/15 px-3 py-1.5 font-mono text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors hover:border-navy-foreground/40 hover:text-navy-foreground sm:self-auto"
          >
            Back to top
            <ArrowUp size={12} weight="bold" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div aria-hidden="true" className="pointer-events-none relative select-none overflow-hidden">
        <p className="container-x -mb-[0.28em] translate-y-[0.12em] font-display text-[clamp(4rem,14vw,13rem)] font-black leading-none tracking-[-0.04em] text-navy-foreground/[0.06]">
          DistroSource
        </p>
      </div>
    </footer>
  )
}

"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowRight, Check, ShieldCheck } from "@/lib/storefront-icons"
import { BrandLogo } from "@/components/brand-logo"
import { Button } from "@/components/ui/button"
import { subscribeToNewsletter } from "@/lib/actions/newsletter"
import { trackWhopEvent } from "@/lib/whop-pixel"

const columns = [
  { title: "Shop", links: [{ label: "Departments", href: "/categories" }, { label: "All products", href: "/products" }, { label: "Gaming", href: "/gaming" }, { label: "Deals", href: "/deals" }, { label: "New arrivals", href: "/products?sort=newest" }] },
  { title: "Resources", links: [{ label: "Help Center", href: "/help" }, { label: "Licensing", href: "/licenses" }, { label: "Team licensing", href: "/team-licensing" }, { label: "Contact", href: "/contact" }] },
  { title: "Company", links: [{ label: "About", href: "/about" }, { label: "Terms", href: "/legal/terms" }, { label: "Privacy", href: "/legal/privacy" }, { label: "Refund Policy", href: "/legal/refund-policy" }] },
  { title: "Account", links: [{ label: "Orders", href: "/account/orders" }, { label: "Downloads", href: "/account/library" }, { label: "Wishlist", href: "/account/wishlist" }] },
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

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!email.trim()) return
    startTransition(async () => {
      try {
        await subscribeToNewsletter(email)
        trackWhopEvent("lead", { email: email.trim().toLowerCase(), event_id: `newsletter-${Date.now()}` })
        trackWhopEvent("newsletter_subscribe", { email: email.trim().toLowerCase(), event_id: `newsletter-signup-${Date.now()}` })
        setSubmitted(true)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not subscribe. Please try again.")
      }
    })
  }

  if (submitted) return <p className="flex items-center gap-2 text-sm text-navy-foreground/75" role="status"><Check size={14} className="text-primary" />You&apos;re subscribed.</p>

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-md gap-2">
      <label htmlFor="footer-email" className="sr-only">Email address</label>
      <input id="footer-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required className="h-11 min-w-0 flex-1 rounded-xl border border-navy-foreground/16 bg-navy-foreground/5 px-3.5 text-sm text-navy-foreground placeholder:text-navy-foreground/35 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25" />
      <Button type="submit" disabled={isPending} className="h-11 shrink-0 rounded-xl px-4 font-bold">Join <ArrowRight size={14} /></Button>
    </form>
  )
}

export function SiteFooter() {
  return (
    <footer className="bg-navy text-navy-foreground">
      <div className="mx-auto max-w-[94rem] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
        <div className="border-b border-navy-foreground/12 pb-12">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-primary">DistroSource</p>
          <p className="mt-4 max-w-5xl font-display text-4xl font-black leading-[0.94] tracking-[-0.05em] text-navy-foreground sm:text-5xl lg:text-6xl">Useful digital products, without the noise.</p>
        </div>

        <div className="grid gap-12 py-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.9fr)]">
          <div className="max-w-md">
            <BrandLogo heightClassName="h-9" />
            <p className="mt-4 text-sm leading-6 text-navy-foreground/55">A digital department store for business, design, development, gaming and everyday creative work.</p>
            <p className="mb-2 mt-7 font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-navy-foreground/42">Occasional product updates</p>
            <NewsletterForm />
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-9 sm:grid-cols-4">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-navy-foreground/42">{column.title}</h3>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {column.links.map((link) => <li key={link.href}><Link href={link.href} className="text-sm text-navy-foreground/68 transition-colors hover:text-navy-foreground">{link.label}</Link></li>)}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="flex flex-col gap-4 border-t border-navy-foreground/12 pt-6 text-xs text-navy-foreground/45 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2"><span>&copy; {new Date().getFullYear()} DistroSource</span>{legalLinks.map((link) => <Link key={link.href} href={link.href} className="hover:text-navy-foreground">{link.label}</Link>)}</div>
          <p className="flex items-center gap-1.5"><ShieldCheck size={13} className="text-primary" />Secure payment options are shown at checkout.</p>
        </div>
      </div>
    </footer>
  )
}

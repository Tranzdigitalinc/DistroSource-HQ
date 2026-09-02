"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShieldCheck, Send, ArrowRight } from "@/lib/storefront-icons"
import { toast } from "sonner"
import { Reveal } from "@/components/motion/reveal"
import { BrandLogo } from "@/components/brand-logo"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { subscribeToNewsletter } from "@/lib/actions/newsletter"

const footerColumns = [
  {
    title: "Shop",
    links: [
      { label: "All Products", href: "/products" },
      { label: "Today's Deals", href: "/deals" },
      { label: "All Categories", href: "/categories" },
      { label: "Bundles", href: "/products?bundle=true" },
      { label: "Free Resources", href: "/products?free=true" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign In", href: "/sign-in" },
      { label: "Sign Up", href: "/sign-up" },
      { label: "My Orders", href: "/account/orders" },
      { label: "My Library", href: "/account/library" },
      { label: "Profile", href: "/account/settings" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Contact Us", href: "/contact" },
      { label: "Order Help", href: "/help/orders" },
      { label: "FAQs", href: "/faq" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Team Licensing", href: "/team-licensing" },
      { label: "Compare Products", href: "/compare" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/legal/terms" },
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Refund Policy", href: "/legal/refund-policy" },
      { label: "Delivery Policy", href: "/legal/delivery-policy" },
      { label: "Cookie Policy", href: "/legal/cookie-policy" },
      { label: "Acceptable Use", href: "/legal/acceptable-use" },
      { label: "Payment Terms", href: "/legal/payment-terms" },
    ],
  },
]

const paymentIcons = [
  { file: "visa.svg", label: "Visa" },
  { file: "mastercard.svg", label: "Mastercard" },
  { file: "american-express.svg", label: "American Express" },
  { file: "paypal.svg", label: "PayPal" },
  { file: "apple-pay.svg", label: "Apple Pay" },
  { file: "google-pay.svg", label: "Google Pay" },
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
        toast.success("You're on the list! Watch your inbox for exclusive deals.")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not subscribe. Please try again.")
      }
    })
  }

  if (submitted) {
    return (
      <p className="flex items-center gap-2 font-mono text-sm font-medium text-primary">
        <Send className="size-4" />
        Thanks! You&apos;ll hear from us soon.
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        required
        className="h-10 max-w-[220px] rounded-[4px] border-navy-foreground/20 bg-navy-foreground/5 text-sm text-navy-foreground placeholder:text-navy-foreground/40"
      />
      <Button
        type="submit"
        size="sm"
        disabled={isPending}
        className="h-10 rounded-[4px] bg-primary px-4 font-mono text-xs font-semibold uppercase tracking-[0.04em] text-primary-foreground hover:bg-primary/90"
      >
        Subscribe
        <ArrowRight className="size-3.5" />
      </Button>
    </form>
  )
}

export function SiteFooter() {
  return (
    <footer className="bg-navy text-navy-foreground">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <Reveal className="mb-12 flex flex-col gap-5 border-b border-navy-foreground/15 pb-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
              Newsletter
            </span>
            <h3 className="mt-1 font-display text-xl font-bold tracking-tight text-navy-foreground">
              Get deals in your inbox
            </h3>
            <p className="mt-1 text-sm text-navy-foreground/60">Exclusive discounts and new brand drops, weekly.</p>
          </div>
          <NewsletterForm />
        </Reveal>

        <Reveal className="pb-10">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_2fr]">
            <div className="max-w-sm">
              <BrandLogo heightClassName="h-14 sm:h-16" />
              <p className="mt-4 text-sm leading-relaxed text-navy-foreground/60">
                Your one-stop marketplace for website templates, fonts, presentations, Notion systems, and every
                other digital asset — with instant access to every download.
              </p>
              <div className="mt-5 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.04em] text-navy-foreground/50">
                <ShieldCheck className="size-4 text-primary" />
                Encrypted checkout on every order
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
              {footerColumns.map((column, i) => (
                <div key={column.title}>
                  <h3 className="flex items-baseline gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-navy-foreground/50">
                    <span className="text-primary">{String(i + 1).padStart(2, "0")}</span>
                    {column.title}
                  </h3>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {column.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="text-sm text-navy-foreground/70 transition-colors hover:text-navy-foreground"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="flex flex-col gap-4 border-t border-navy-foreground/15 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-navy-foreground/50">
            &copy; {new Date().getFullYear()} DistroSource. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            {paymentIcons.map((icon) => (
              <span
                key={icon.file}
                className="flex h-7 w-11 shrink-0 items-center justify-center rounded-[3px] border border-navy-foreground/10 bg-navy-foreground/95"
                title={icon.label}
              >
                <Image
                  src={`/payment-icons/${icon.file}`}
                  alt={icon.label}
                  width={28}
                  height={18}
                  className="h-4 w-auto object-contain"
                />
              </span>
            ))}
          </div>
        </div>
        <p className="mt-4 text-center font-mono text-[11px] uppercase tracking-[0.04em] text-navy-foreground/40 sm:text-left">
          Every purchase unlocks instantly in your library — no shipping, ever.
        </p>
      </div>
    </footer>
  )
}

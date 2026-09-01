"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import Image from "next/image"
import { ShieldCheck, Send, ArrowRight } from "lucide-react"
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
      { label: "All Gift Cards", href: "/categories/gift-cards" },
      { label: "Today's Deals", href: "/deals" },
      { label: "Gaming", href: "/categories/gaming" },
      { label: "Streaming & Entertainment", href: "/categories/streaming" },
      { label: "Mobile Top-Up", href: "/categories/mobile-topup" },
      { label: "Software & Productivity", href: "/categories/software" },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Sign In", href: "/sign-in" },
      { label: "Sign Up", href: "/sign-up" },
      { label: "My Orders", href: "/account/orders" },
      { label: "My Gift Cards", href: "/account/codes" },
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
      { label: "Bulk Gifting for Business", href: "/bulk-gifting" },
      { label: "Countries We Serve", href: "/countries" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms of Service", href: "/legal/terms" },
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Refund Policy", href: "/legal/refund-policy" },
      { label: "Delivery Policy", href: "/legal/delivery-policy" },
      { label: "Gift Card Terms", href: "/legal/gift-card-terms" },
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
      <p className="flex items-center gap-2 text-sm font-medium text-accent">
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
        className="h-9 max-w-[220px] bg-background/50 text-sm"
      />
      <Button type="submit" size="sm" disabled={isPending} className="h-9 px-3">
        Subscribe
        <ArrowRight className="size-3.5" />
      </Button>
    </form>
  )
}

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <Reveal className="mb-10 flex flex-col gap-4 rounded-xl border border-border bg-card p-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-display text-base font-semibold text-foreground">Get deals in your inbox</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Subscribe for exclusive discounts and new brand drops.
            </p>
          </div>
          <NewsletterForm />
        </Reveal>

        <Reveal className="pb-10">
          <div className="max-w-sm">
            <BrandLogo height={48} />
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Your one-stop marketplace for gift cards, game top-ups, mobile recharges, and software licenses —
              delivered instantly, worldwide.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="size-4 text-accent" />
              Encrypted checkout on every order
            </div>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-5">
            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="font-display text-sm font-semibold text-foreground">{column.title}</h3>
                <ul className="mt-3 flex flex-col gap-2">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Reveal>

        <div className="flex flex-col gap-4 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} RedeemCove. All rights reserved.</p>
          <div className="flex items-center gap-2">
            {paymentIcons.map((icon) => (
              <span
                key={icon.file}
                className="flex h-7 w-11 shrink-0 items-center justify-center rounded-md border border-border bg-white"
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
        <p className="mt-4 text-center text-xs text-muted-foreground sm:text-left">
          Digital codes are delivered to your account instantly after purchase.
        </p>
      </div>
    </footer>
  )
}

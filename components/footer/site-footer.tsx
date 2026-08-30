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

const footerColumns = [
  {
    title: "Shop",
    links: [
      { label: "Gaming", href: "/categories/gaming" },
      { label: "Gift Cards", href: "/categories/gift-cards" },
      { label: "Mobile Top-Up", href: "/categories/mobile-topup" },
      { label: "Software & Productivity", href: "/categories/software" },
      { label: "Food & Delivery", href: "/categories/food-delivery" },
      { label: "Streaming & Entertainment", href: "/categories/streaming" },
      { label: "Today's Deals", href: "/deals" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Bulk Gifting for Business", href: "/bulk-gifting" },
      { label: "Countries We Serve", href: "/countries" },
      { label: "All Brands", href: "/brands" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/account/support" },
      { label: "Track an Order", href: "/account/orders" },
      { label: "Contact Us", href: "/account/support" },
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
    startTransition(() => {
      setTimeout(() => {
        setSubmitted(true)
        toast.success("You're on the list! Watch your inbox for exclusive deals.")
      }, 500)
    })
  }

  if (submitted) {
    return (
      <p className="flex items-center gap-2 text-sm font-medium text-primary">
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

        <Reveal className="grid grid-cols-2 gap-8 pb-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <BrandLogo height={48} />
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Your one-stop marketplace for gift cards, game top-ups, mobile recharges, and software licenses —
              delivered instantly, worldwide.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="size-4 text-primary" />
              Encrypted checkout on every order
            </div>
          </div>

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

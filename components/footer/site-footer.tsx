import Link from "next/link"
import { ShieldCheck, Zap, Globe2, HeartHandshake } from "lucide-react"

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

const trustBadges = [
  { icon: Zap, label: "Instant Delivery" },
  { icon: ShieldCheck, label: "Secure Checkout" },
  { icon: Globe2, label: "190+ Countries" },
  { icon: HeartHandshake, label: "24/7 Support" },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-2 gap-8 border-b border-border/60 pb-8 sm:grid-cols-4">
          {trustBadges.map((badge) => (
            <div key={badge.label} className="flex items-center gap-2.5">
              <badge.icon className="size-5 shrink-0 text-primary" />
              <span className="text-sm font-medium text-foreground/80">{badge.label}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-8 py-10 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex size-8 items-center justify-center rounded-lg bg-primary font-display text-sm font-bold text-primary-foreground">
                RC
              </span>
              <span className="font-display text-lg font-semibold tracking-tight text-foreground">RedeemCove</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Your one-stop marketplace for gift cards, game top-ups, mobile recharges, and software licenses —
              delivered instantly, worldwide.
            </p>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h3 className="font-display text-sm font-semibold text-foreground">{column.title}</h3>
              <ul className="mt-3 flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} RedeemCove. All rights reserved.</p>
          <p>Digital codes are delivered to your account instantly after purchase.</p>
        </div>
      </div>
    </footer>
  )
}

import Link from "next/link"
import {
  ArrowRight,
  Building2,
  CircleHelp,
  CreditCard,
  Download,
  FileText,
  Package,
  RefreshCw,
  User,
  ICON_SIZE,
} from "@/lib/storefront-icons"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { HeaderSearch } from "@/components/header/header-search"
import { Button } from "@/components/ui/button"
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal"

export const metadata = {
  title: "Help Center — DistroSource",
  description: "Answers about orders, downloads, licensing, payments, refunds and your DistroSource account.",
}

// Information architecture per the enhancement brief: Buying & Orders,
// Downloads, Licensing, Account, Refunds, Payments, Product Questions.
// Each links to a real page — no dead topics.
const topics = [
  { icon: Package, title: "Buying & orders", description: "Placing an order, order status, and confirmation emails.", href: "/help/orders" },
  { icon: Download, title: "Downloads", description: "Where your files live, re-downloading, and product updates.", href: "/account/library" },
  { icon: FileText, title: "Licensing", description: "Personal, Commercial and Agency licence tiers explained.", href: "/legal/terms" },
  { icon: User, title: "Account", description: "Signing in, changing your email or password, and closing an account.", href: "/account" },
  { icon: RefreshCw, title: "Refunds", description: "When a refund is available and how it is processed.", href: "/legal/refund-policy" },
  { icon: CreditCard, title: "Payments", description: "Accepted payment methods, currency, and failed charges.", href: "/legal/payment-terms" },
  { icon: CircleHelp, title: "Product questions", description: "File formats, compatibility, and what a product includes.", href: "/faq" },
  { icon: Building2, title: "Team licensing", description: "Multi-seat licensing and invoicing for businesses.", href: "/team-licensing" },
]

export default function HelpCenterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-hero">
          <div className="mx-auto max-w-3xl px-4 py-14 text-center sm:px-6 md:py-16">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Help Center</p>
            <h1 className="mt-3 font-display text-3xl font-bold leading-[1.1] tracking-tight text-hero-foreground text-balance sm:text-4xl">
              How can we help?
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted-foreground text-pretty">
              Pick a topic below, search the catalog, or send us a message.
            </p>
            <div className="mx-auto mt-6 max-w-xl">
              <HeaderSearch size="lg" />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-14">
          <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.04}>
            {topics.map((topic) => (
              <RevealItem key={topic.title}>
                <Link
                  href={topic.href}
                  className="group flex h-full flex-col rounded-lg border border-border bg-card p-5 transition-colors hover:border-border-strong hover:bg-secondary/40"
                >
                  <span className="flex size-10 items-center justify-center rounded-md bg-secondary text-muted-foreground group-hover:text-foreground">
                    <topic.icon size={ICON_SIZE.feature} aria-hidden="true" />
                  </span>
                  <h3 className="mt-4 font-display text-sm font-bold text-foreground">{topic.title}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">{topic.description}</p>
                  <span className="mt-3 flex items-center gap-1 text-xs font-semibold text-foreground">
                    Open
                    <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </span>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        <section className="border-t border-border bg-secondary/40">
          <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-4 py-14 text-center sm:px-6">
            <h2 className="font-display text-xl font-bold">Still need help?</h2>
            <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
              Send us a message with your order number and we&apos;ll reply by email. Typical response within 1 business day.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button render={<Link href="/contact" />} nativeButton={false} className="font-semibold">
                Contact support
                <ArrowRight size={ICON_SIZE.base} aria-hidden="true" />
              </Button>
              <Button variant="outline" render={<Link href="/faq" />} nativeButton={false} className="font-semibold">
                Read the FAQ
              </Button>
            </div>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

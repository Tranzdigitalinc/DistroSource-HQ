import Link from "next/link"
import {
  PackageSearch,
  CreditCard,
  ShieldCheck,
  FileText,
  Building2,
  Library,
  ArrowRight,
  MessageCircle,
  HelpCircle,
} from "lucide-react"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal"

export const metadata = {
  title: "Help Center — DistroSource",
  description: "Find answers about orders, downloads, payments, refunds, and your DistroSource account.",
}

const categories = [
  {
    icon: PackageSearch,
    title: "Order Help",
    description: "Track an order, resolve a delayed delivery, or get a download link re-sent.",
    href: "/help/orders",
  },
  {
    icon: CreditCard,
    title: "Payments & billing",
    description: "Accepted payment methods, billing questions, and failed charges.",
    href: "/legal/payment-terms",
  },
  {
    icon: Library,
    title: "Downloads & My Library",
    description: "Where to find your files, re-download past purchases, and get product updates.",
    href: "/account/library",
  },
  {
    icon: FileText,
    title: "Licensing",
    description: "Understand Personal, Commercial, Extended, and Agency license tiers.",
    href: "/legal/terms",
  },
  {
    icon: ShieldCheck,
    title: "Refunds & cancellations",
    description: "When a refund is available and how to request one.",
    href: "/legal/refund-policy",
  },
  {
    icon: Building2,
    title: "Team Licensing",
    description: "Multi-seat pricing, invoicing, and license requests for teams and agencies.",
    href: "/team-licensing",
  },
]

export default function HelpCenterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-hero">
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage:
                "radial-gradient(circle at 15% 30%, oklch(0.72 0.14 220 / 0.45), transparent 45%), radial-gradient(circle at 85% 80%, oklch(0.6 0.15 240 / 0.35), transparent 45%)",
            }}
          />
          <div className="relative mx-auto max-w-3xl px-6 py-16 text-center sm:px-8">
            <span className="mx-auto flex w-fit items-center gap-1.5 rounded-full bg-hero-foreground/10 px-3 py-1 text-xs font-medium text-hero-foreground/90 ring-1 ring-inset ring-hero-foreground/20">
              <HelpCircle className="size-3.5 text-hero-accent" />
              Help Center
            </span>
            <h1 className="mt-5 font-display text-3xl font-bold leading-[1.1] tracking-tight text-hero-foreground text-balance sm:text-4xl">
              How can we help?
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-hero-foreground/75 text-pretty">
              Browse a topic below, check our FAQs, or reach out directly and we&apos;ll get back to you within one
              business day.
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-14 sm:px-8">
          <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3" stagger={0.06}>
            {categories.map((category) => (
              <RevealItem key={category.title}>
                <Link
                  href={category.href}
                  className="group flex h-full flex-col rounded-xl border border-border bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5"
                >
                  <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <category.icon className="size-5" />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-foreground">{category.title}</h3>
                  <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {category.description}
                  </p>
                  <span className="mt-3 flex items-center gap-1 text-sm font-medium text-primary">
                    Learn more
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              </RevealItem>
            ))}
          </RevealGroup>
        </section>

        <section className="bg-secondary/40 py-14">
          <Reveal className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 text-center sm:px-8">
            <span className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <MessageCircle className="size-5" />
            </span>
            <h2 className="font-display text-xl font-semibold">Still need help?</h2>
            <p className="text-sm text-muted-foreground">
              Browse our full <Link href="/faq" className="font-medium text-primary hover:underline">FAQ list</Link>{" "}
              or <Link href="/contact" className="font-medium text-primary hover:underline">contact our team</Link>{" "}
              directly. Signed-in customers can also track open tickets from{" "}
              <Link href="/account/support" className="font-medium text-primary hover:underline">
                Account &rarr; Support
              </Link>
              .
            </p>
          </Reveal>
        </section>
      </main>
      <SiteFooter />
    </div>
  )
}

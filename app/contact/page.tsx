import Link from "next/link"
import { Mail, MessageCircle, Building2, ArrowRight } from "lucide-react"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { Reveal } from "@/components/motion/reveal"
import { ContactForm } from "@/components/contact/contact-form"

export const metadata = {
  title: "Contact Us — DistroSource",
  description: "Get in touch with the DistroSource team for order support, licensing questions, or business inquiries.",
}

const channels = [
  {
    icon: MessageCircle,
    title: "Order & account support",
    description: "For download issues, licensing questions, or account access — the fastest way to reach us.",
    action: { label: "Visit the Help Center", href: "/help" },
  },
  {
    icon: Mail,
    title: "General inquiries",
    description: "Press, partnerships, or anything that doesn't fit elsewhere.",
    action: { label: "hello@distrosource.com", href: "mailto:hello@distrosource.com" },
  },
  {
    icon: Building2,
    title: "Business & team licensing",
    description: "Volume seats, agency use, and team licensing programs.",
    action: { label: "business@distrosource.com", href: "mailto:business@distrosource.com?subject=Team%20licensing%20inquiry" },
  },
]

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
          <Reveal className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Contact</p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-balance md:text-4xl">
              We&apos;re here to help
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Whether it&apos;s an order question, a billing concern, or a partnership idea, send us a message and our
              team will respond within one business day.
            </p>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_1.4fr]">
            <Reveal className="flex flex-col gap-4">
              {channels.map((channel) => (
                <div key={channel.title} className="rounded-xl border border-border bg-card p-5">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <channel.icon className="size-4.5" />
                  </span>
                  <h3 className="mt-3 text-sm font-semibold text-foreground">{channel.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{channel.description}</p>
                  <Link
                    href={channel.action.href}
                    className="mt-3 flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    {channel.action.label}
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              ))}
            </Reveal>

            <Reveal>
              <ContactForm />
            </Reveal>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

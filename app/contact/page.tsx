import Link from "next/link"
import { ArrowRight, BriefcaseBusiness, CircleHelp, Library, RefreshCw, ICON_SIZE } from "@/lib/storefront-icons"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { Reveal } from "@/components/motion/reveal"
import { ContactForm } from "@/components/contact/contact-form"

export const metadata = {
  title: "Contact — DistroSource",
  description: "Get in touch with the DistroSource team for order support, licensing questions, or business inquiries.",
}

// Self-serve routes that resolve the most common tickets without waiting on
// a reply. Nothing here promises a channel that isn't actually staffed.
const shortcuts = [
  { icon: Library, title: "Re-download a purchase", description: "Every paid product stays in your library.", href: "/account/library", label: "Open My Library" },
  { icon: RefreshCw, title: "Request a refund", description: "Check eligibility and how refunds are processed.", href: "/legal/refund-policy", label: "Refund policy" },
  { icon: CircleHelp, title: "Browse the Help Center", description: "Orders, downloads, licensing, payments and accounts.", href: "/help", label: "Help Center" },
  { icon: BriefcaseBusiness, title: "Team licensing", description: "Multi-seat and agency licensing for businesses.", href: "/team-licensing", label: "Team licensing" },
]

export default function ContactPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
          <Reveal className="max-w-2xl">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Contact</p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-balance md:text-4xl">Talk to the team</h1>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground text-pretty">
              Order questions, download problems, licensing, billing — send a message and we&apos;ll reply by email.
              Typical response within 1 business day.
            </p>
          </Reveal>

          <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <Reveal>
              <ContactForm />
            </Reveal>

            <Reveal className="flex flex-col gap-3">
              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Faster than a ticket</p>
              {shortcuts.map((s) => (
                <Link
                  key={s.href}
                  href={s.href}
                  className="group flex items-start gap-3 rounded-lg border border-border bg-card p-4 transition-colors hover:border-border-strong hover:bg-secondary/40"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-muted-foreground group-hover:text-foreground">
                    <s.icon size={ICON_SIZE.base} aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-foreground">{s.title}</span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">{s.description}</span>
                    <span className="mt-1.5 flex items-center gap-1 text-xs font-medium text-foreground">
                      {s.label}
                      <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                    </span>
                  </span>
                </Link>
              ))}
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Signed-in customers can follow up on open requests under{" "}
                <Link href="/account/support" className="font-medium text-foreground hover:underline">Account → Support</Link>.
              </p>
            </Reveal>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

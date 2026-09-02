import Link from "next/link"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { Reveal } from "@/components/motion/reveal"

const legalLinks = [
  { label: "Terms of Service", href: "/legal/terms" },
  { label: "Privacy Policy", href: "/legal/privacy" },
  { label: "Refund Policy", href: "/legal/refund-policy" },
  { label: "Delivery Policy", href: "/legal/delivery-policy" },
  { label: "Cookie Policy", href: "/legal/cookie-policy" },
  { label: "Acceptable Use", href: "/legal/acceptable-use" },
  { label: "Payment Terms", href: "/legal/payment-terms" },
]

export interface LegalSection {
  heading: string
  body: React.ReactNode
}

export function LegalPageLayout({
  title,
  updatedAt,
  intro,
  sections,
  currentHref,
}: {
  title: string
  updatedAt: string
  intro: string
  sections: LegalSection[]
  currentHref: string
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
          <Reveal className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Legal</p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-balance md:text-4xl">{title}</h1>
            <p className="mt-3 text-sm text-muted-foreground">Last updated {updatedAt}</p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{intro}</p>
          </Reveal>

          <div className="mt-10 flex flex-col gap-10 md:flex-row md:gap-12">
            <aside className="md:w-56 md:shrink-0">
              <nav className="flex flex-col gap-1 md:sticky md:top-24">
                {legalLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={link.href === currentHref ? "page" : undefined}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      link.href === currentHref
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </aside>

            <Reveal className="min-w-0 flex-1 rounded-2xl border border-border bg-card p-6 sm:p-8">
              <div className="flex flex-col gap-8">
                {sections.map((section) => (
                  <section key={section.heading} className="flex flex-col gap-3">
                    <h2 className="font-display text-lg font-semibold text-foreground">{section.heading}</h2>
                    <div className="flex flex-col gap-3 text-sm leading-relaxed text-muted-foreground">
                      {section.body}
                    </div>
                  </section>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

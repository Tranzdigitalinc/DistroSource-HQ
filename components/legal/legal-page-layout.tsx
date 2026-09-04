import Link from "next/link"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { Reveal } from "@/components/motion/reveal"
import { cn } from "@/lib/utils"

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

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
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
  const toc = sections.map((s, i) => ({ id: `${i + 1}-${slugify(s.heading)}`, heading: s.heading }))

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-14">
          <Reveal className="max-w-2xl">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Legal</p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-balance md:text-4xl">{title}</h1>
            <p className="mt-2 text-sm text-muted-foreground">Last updated {updatedAt}</p>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground text-pretty">{intro}</p>
          </Reveal>

          <div className="mt-10 grid gap-10 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-12">
            <aside className="flex flex-col gap-8 md:sticky md:top-24 md:self-start">
              <nav aria-label="Legal documents" className="flex flex-col gap-0.5">
                <p className="mb-1 px-3 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Documents</p>
                {legalLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    aria-current={link.href === currentHref ? "page" : undefined}
                    className={cn(
                      "rounded-md px-3 py-1.5 text-sm transition-colors",
                      link.href === currentHref
                        ? "bg-secondary font-semibold text-foreground"
                        : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {toc.length > 2 && (
                <nav aria-label="On this page" className="hidden flex-col gap-0.5 border-l border-border md:flex">
                  <p className="mb-1 pl-3 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">On this page</p>
                  {toc.map((item) => (
                    <a
                      key={item.id}
                      href={`#${item.id}`}
                      className="-ml-px border-l border-transparent py-1 pl-3 text-xs text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                    >
                      {item.heading}
                    </a>
                  ))}
                </nav>
              )}
            </aside>

            <Reveal className="min-w-0 rounded-lg border border-border bg-card px-6 py-8 sm:px-10 sm:py-10">
              <div className="flex max-w-3xl flex-col divide-y divide-border">
                {sections.map((section, i) => (
                  <section key={section.heading} id={toc[i].id} className="scroll-mt-28 py-7 first:pt-0 last:pb-0">
                    {/* Headings already carry their own numbering in the policy copy. */}
                    <h2 className="font-display text-lg font-bold text-foreground">{section.heading}</h2>
                    <div className="mt-3 flex flex-col gap-3 text-[15px] leading-relaxed text-muted-foreground">
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

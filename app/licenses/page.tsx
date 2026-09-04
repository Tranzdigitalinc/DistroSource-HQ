import Link from "next/link"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"

export const metadata = {
  title: "Licenses — DistroSource",
  description: "Understand how DistroSource digital product licenses apply to personal, commercial, and agency use.",
}

const tiers = [
  {
    name: "Personal",
    description: "For your own personal, non-commercial use.",
    details: "Use the product for private projects, learning, and personal organization. It may not be used for client work or revenue-generating business activity.",
  },
  {
    name: "Commercial",
    description: "For one commercial project or one client project.",
    details: "Use the product in a single business or client project. A separate license is required for additional projects, clients, or materially different uses.",
  },
  {
    name: "Agency",
    description: "For multiple client projects within the product limits.",
    details: "Use the product across multiple client projects according to the limits stated on the product page and in your purchase record.",
  },
]

export default function LicensesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 md:py-16">
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-primary">Licensing</p>
          <h1 className="mt-3 font-display text-4xl font-bold tracking-tight text-balance">Use every download with confidence.</h1>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
            Each DistroSource product includes a license selector and product-specific terms. Choose the tier that matches your intended use before checkout.
          </p>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {tiers.map((tier) => (
              <section key={tier.name} className="flex flex-col gap-3 border border-border bg-card p-5">
                <h2 className="font-display text-xl font-bold">{tier.name}</h2>
                <p className="text-sm font-medium text-foreground">{tier.description}</p>
                <p className="text-sm leading-relaxed text-muted-foreground">{tier.details}</p>
              </section>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-border pt-8 text-sm leading-relaxed text-muted-foreground">
            <p>
              A license grants usage rights; it does not transfer ownership of the underlying files or intellectual property. Do not resell, redistribute, sublicense, or repackage a download unless its product-specific terms expressly allow it.
            </p>
            <p>
              Product-specific limits always control. Review the license details shown on the product page and in your account before using a download for a client or team.
            </p>
            <p>
              Have licensing questions? <Link href="/contact" className="font-medium text-primary hover:underline">Contact support</Link>. Typical response within 1 business day.
            </p>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

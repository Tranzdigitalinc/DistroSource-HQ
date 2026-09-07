"use client"

import Link from "next/link"
import NumberFlow from "@number-flow/react"
import { useInView } from "motion/react"
import { useRef } from "react"
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal"
import { Magnetic } from "@/components/motion/magnetic"
import { ArrowRight, Download, Lock, Refresh, ShieldCheck, ICON_SIZE } from "@/lib/storefront-icons"

// Every line here is verifiable on the live site.
const points = [
  { icon: Download, title: "Instant delivery", body: "Paid products unlock in My Library the moment the payment is confirmed. No waiting, no emails to dig through." },
  { icon: ShieldCheck, title: "Licence stated up front", body: "Personal, commercial or agency — the terms are on the product page before you pay, not in a PDF afterwards." },
  { icon: Refresh, title: "Re-download anytime", body: "Purchases stay in your library. Lost a file or switched machines? Download it again, including updates." },
  { icon: Lock, title: "Secure checkout", body: "Payments are handled by Polar, TamPay or Whop. DistroSource never sees or stores your card details." },
]

/**
 * Buy-with-confidence block plus the closing call to action. Live counts
 * tick up when they enter the viewport; the CTA card is the one orange
 * surface on the page.
 */
export function Confidence({ stats }: { stats: { productCount: number; categoryCount: number } }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  // Derived, not stored: NumberFlow animates from 0 to the real value once in view.
  const counts = inView ? { products: stats.productCount, categories: stats.categoryCount, departments: 7 } : { products: 0, categories: 0, departments: 0 }

  return (
    <section className="border-t border-border">
      <div className="container-x py-16 sm:py-24">
        <div ref={ref} className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
          <Reveal>
            <p className="eyebrow">Buy with confidence</p>
            <h2 className="text-display mt-4 text-3xl sm:text-4xl lg:text-5xl">Straightforward, from checkout to download.</h2>
            <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-border pt-8">
              {[
                { label: "Products", value: counts.products },
                { label: "Categories", value: counts.categories },
                { label: "Departments", value: counts.departments },
              ].map((s) => (
                <div key={s.label}>
                  <dt className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">{s.label}</dt>
                  <dd className="mt-1 font-display text-3xl font-bold tabular-nums tracking-tight sm:text-4xl">
                    <NumberFlow value={s.value} />
                  </dd>
                </div>
              ))}
            </dl>
          </Reveal>

          <RevealGroup className="grid gap-4 sm:grid-cols-2" stagger={0.06}>
            {points.map((p) => (
              <RevealItem key={p.title} className="h-full">
                <div className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6 transition-[border-color,box-shadow] hover:border-border-strong hover:shadow-[var(--shadow-e2)]">
                  <span className="flex size-11 items-center justify-center rounded-2xl bg-secondary text-primary">
                    <p.icon size={ICON_SIZE.feature} weight="duotone" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-bold tracking-tight">{p.title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                  </div>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>

        <Reveal className="mt-16 sm:mt-24">
          <div className="grain relative overflow-hidden rounded-3xl bg-primary px-6 py-14 text-primary-foreground sm:px-12 sm:py-20">
            <div aria-hidden className="mesh-blob animate-mesh-1 right-[-10%] top-[-40%] h-[28rem] w-[28rem] bg-[oklch(0.85_0.16_70)]/60" />
            <div aria-hidden className="mesh-blob animate-mesh-3 bottom-[-50%] left-[10%] h-[24rem] w-[24rem] bg-navy/40" />
            <div className="relative flex flex-col items-start gap-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-2xl">
                <p className="eyebrow text-primary-foreground/70 [&::before]:bg-primary-foreground">Ready when you are</p>
                <h2 className="text-display mt-4 text-3xl sm:text-4xl lg:text-5xl">Find it, buy it, download it. Two minutes, start to finish.</h2>
                <p className="mt-4 max-w-xl text-base leading-relaxed text-primary-foreground/80">No account needed to check out. Guest orders can be claimed later so your files are never lost.</p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Magnetic>
                  <Link
                    href="/products"
                    className="group inline-flex h-12 items-center gap-2 rounded-full bg-navy px-6 text-[15px] font-semibold text-navy-foreground transition-transform active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
                  >
                    Browse the catalog
                    <ArrowRight size={ICON_SIZE.base} weight="bold" className="transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                </Magnetic>
                <Link href="/deals" className="inline-flex h-12 items-center rounded-full border border-primary-foreground/40 px-6 text-[15px] font-semibold text-primary-foreground transition-colors hover:bg-primary-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground">
                  See today&apos;s deals
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

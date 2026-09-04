"use client"

import { Zap, ShieldCheck, Headphones, Library, ICON_SIZE } from "@/lib/storefront-icons"
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal"
import { cn } from "@/lib/utils"

// Every line here is something a reviewer can verify on the live site. No
// "real sample file" promises (downloads are still being finalised) and no
// response-time guarantee — "typical" is the honest word.
const badges = [
  {
    icon: Zap,
    title: "Instant access",
    body: "Paid products unlock in My Library the moment Polar confirms the payment. No shipping, no waiting.",
  },
  {
    icon: ShieldCheck,
    title: "Secure checkout",
    body: "Payments are handled by Polar as merchant of record. DistroSource never sees or stores your card details.",
  },
  {
    icon: Library,
    title: "Re-download anytime",
    body: "Purchases stay in your library. Lost a file or switched machines? Download it again from your account.",
  },
  {
    icon: Headphones,
    title: "Support by email",
    body: "Order, download and licensing questions are answered by a person. Typical response within 1 business day.",
  },
]

export function TrustBadges() {
  return (
    <section className="border-y border-border bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 md:py-16">
        <Reveal className="mb-8 max-w-2xl">
          <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">How buying works</p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Straightforward, from checkout to download
          </h2>
        </Reveal>
        <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.06}>
          {badges.map((badge, i) => {
            const highlighted = i === 0
            return (
              <RevealItem key={badge.title} className="h-full">
                <div
                  className={cn(
                    "flex h-full flex-col gap-4 rounded-lg border p-6",
                    highlighted ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-10 items-center justify-center rounded-md",
                      highlighted ? "bg-primary-foreground/15 text-primary-foreground" : "bg-secondary text-foreground",
                    )}
                  >
                    <badge.icon size={ICON_SIZE.feature} aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="font-display text-base font-bold">{badge.title}</h3>
                    <p className={cn("mt-1.5 text-sm leading-relaxed", highlighted ? "text-primary-foreground/85" : "text-muted-foreground")}>
                      {badge.body}
                    </p>
                  </div>
                </div>
              </RevealItem>
            )
          })}
        </RevealGroup>
      </div>
    </section>
  )
}

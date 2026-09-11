import { RevealGroup, RevealItem } from "@/components/motion/reveal"

// Every line is something a reviewer can verify on the live site. No
// response-time guarantees, no "worldwide" claims.
const points = [
  { n: "01", title: "Instant delivery", body: "Paid products unlock in My Library the moment the payment is confirmed." },
  { n: "02", title: "Licence stated up front", body: "Personal, commercial or extended — the terms are on the product page, not in an email." },
  { n: "03", title: "Re-download anytime", body: "Purchases stay in your library. Lost a file or switched machines? Download it again." },
  { n: "04", title: "Secure checkout", body: "Payments are handled by Polar, Fungies, TamPay or Card2Crypto. DistroSource never stores card details." },
]

/** Compact closing strip: numerals, not icons; facts, not slogans. */
export function WhyStrip() {
  return (
    <section className="border-t border-border">
      <div className="container-x py-14 sm:py-16">
        <RevealGroup className="grid gap-x-8 gap-y-8 sm:grid-cols-2 lg:grid-cols-4" stagger={0.05}>
          {points.map((p) => (
            <RevealItem key={p.n}>
              <div className="flex gap-4 border-l border-border pl-4">
                <span className="font-mono text-xs font-semibold text-primary">{p.n}</span>
                <div>
                  <h3 className="font-display text-base font-bold tracking-tight">{p.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{p.body}</p>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}

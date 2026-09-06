import { Zap, ShieldCheck, Headphones, Library } from "@/lib/storefront-icons"
import { RevealGroup, RevealItem } from "@/components/motion/reveal"

const badges = [
  { icon: Zap, title: "Instant access", body: "Digital products are delivered after confirmed payment — no shipping or fulfilment delay." },
  { icon: ShieldCheck, title: "Secure payment", body: "Payment details are handled by the selected checkout provider, not stored by DistroSource." },
  { icon: Library, title: "Your library", body: "Eligible purchases remain available from your account so you can return to your files later." },
  { icon: Headphones, title: "Human support", body: "Questions about orders, downloads and licensing can be handled through DistroSource support." },
]

export function TrustBadges() {
  return (
    <section className="border-y border-border/70 bg-background">
      <div className="mx-auto max-w-[94rem] px-4 py-14 sm:px-6 lg:px-8 lg:py-18">
        <div className="mb-8 max-w-2xl">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.15em] text-primary">Buying on DistroSource</p>
          <h2 className="mt-2 font-display text-3xl font-black tracking-[-0.04em] text-foreground">Confidence should feel quiet.</h2>
        </div>
        <RevealGroup className="grid gap-px overflow-hidden rounded-2xl border border-border/80 bg-border/70 sm:grid-cols-2 lg:grid-cols-4" stagger={0.045}>
          {badges.map((badge) => (
            <RevealItem key={badge.title} className="h-full bg-background">
              <div className="h-full p-5 sm:p-6">
                <badge.icon size={19} className="text-primary" aria-hidden="true" />
                <h3 className="mt-7 font-display text-base font-black tracking-tight text-foreground">{badge.title}</h3>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">{badge.body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}

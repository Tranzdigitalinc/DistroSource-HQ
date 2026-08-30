import { Zap, ShieldCheck, Headphones, RefreshCcw } from "lucide-react"
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal"

const badges = [
  {
    icon: Zap,
    title: "Instant delivery",
    body: "Codes land in your account and inbox within seconds of payment — no waiting, no queues.",
  },
  {
    icon: ShieldCheck,
    title: "Secure checkout",
    body: "Every order is encrypted end-to-end and every code is generated fresh at the point of sale.",
  },
  {
    icon: RefreshCcw,
    title: "Verified codes",
    body: "Every catalog listing is sourced directly from authorized distributors and publishers.",
  },
  {
    icon: Headphones,
    title: "24/7 support",
    body: "Real people review every ticket — order issues get a response, not a bot loop.",
  },
]

export function TrustBadges() {
  return (
    <section className="border-t border-border/60 bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
        <Reveal className="mb-10 max-w-2xl">
          <h2 className="font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
            Why shoppers trust RedeemCove
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            No middlemen guesswork, no delivery delays — just a straightforward marketplace built around getting
            your code into your hands correctly, the first time.
          </p>
        </Reveal>
        <RevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
          {badges.map((badge) => (
            <RevealItem key={badge.title}>
              <div className="flex h-full flex-col gap-3 rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40">
                <badge.icon className="size-5 text-accent" />
                <h3 className="font-display text-base font-semibold text-foreground">{badge.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{badge.body}</p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}

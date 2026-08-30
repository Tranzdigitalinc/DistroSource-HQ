import { Zap, ShieldCheck, Headphones, RefreshCcw } from "lucide-react"

const badges = [
  {
    icon: Zap,
    title: "Instant delivery",
    body: "Codes land in your account and inbox within seconds of payment.",
  },
  {
    icon: ShieldCheck,
    title: "Secure checkout",
    body: "Every order is encrypted and protected end-to-end.",
  },
  {
    icon: RefreshCcw,
    title: "Verified codes",
    body: "Sourced directly from authorized distributors and publishers.",
  },
  {
    icon: Headphones,
    title: "24/7 support",
    body: "Real help from our team whenever you need it.",
  },
]

export function TrustBadges() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-14 sm:px-8">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {badges.map((badge) => (
          <div key={badge.title} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-5">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <badge.icon className="size-5" />
            </div>
            <h3 className="font-display text-base font-bold">{badge.title}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground">{badge.body}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

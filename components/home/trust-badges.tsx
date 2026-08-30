"use client"

import { motion } from "motion/react"
import { Zap, ShieldCheck, Headphones, RefreshCcw } from "lucide-react"
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal"

const badges = [
  {
    icon: Zap,
    title: "Instant delivery",
    body: "Codes land in your account and inbox within seconds of payment — no waiting, no queues.",
    gradient: "from-amber-500/15 to-orange-500/15",
    iconColor: "text-amber-500",
  },
  {
    icon: ShieldCheck,
    title: "Secure checkout",
    body: "Every order is encrypted end-to-end and every code is generated fresh at the point of sale.",
    gradient: "from-emerald-500/15 to-teal-500/15",
    iconColor: "text-emerald-500",
  },
  {
    icon: RefreshCcw,
    title: "Verified codes",
    body: "Every catalog listing is sourced directly from authorized distributors and publishers.",
    gradient: "from-sky-500/15 to-blue-500/15",
    iconColor: "text-sky-500",
  },
  {
    icon: Headphones,
    title: "24/7 support",
    body: "Real people review every ticket — order issues get a response, not a bot loop.",
    gradient: "from-rose-500/15 to-pink-500/15",
    iconColor: "text-rose-500",
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
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30"
              >
                <div className={`flex size-10 items-center justify-center rounded-lg bg-gradient-to-br ${badge.gradient}`}>
                  <badge.icon className={`size-5 ${badge.iconColor}`} />
                </div>
                <h3 className="font-display text-base font-semibold text-foreground">{badge.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{badge.body}</p>
              </motion.div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  )
}

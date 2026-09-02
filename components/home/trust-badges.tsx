"use client"

import { motion } from "motion/react"
import { Zap, ShieldCheck, Headphones, RefreshCcw } from "lucide-react"
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal"

const badges = [
  {
    icon: Zap,
    title: "Instant access",
    body: "Every purchase unlocks in My Library the moment payment clears — no waiting, no queues.",
  },
  {
    icon: ShieldCheck,
    title: "Secure checkout",
    body: "Every order is encrypted end-to-end and download links are gated to your account only.",
  },
  {
    icon: RefreshCcw,
    title: "Real, working files",
    body: "Nothing goes live until it has real preview images and a real sample file to download.",
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
            Why shoppers trust DistroSource
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            No guesswork, no delivery delays — just a straightforward department store built around getting the
            right file into your hands correctly, the first time.
          </p>
        </Reveal>
        <RevealGroup className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
          {badges.map((badge) => (
            <RevealItem key={badge.title}>
              <motion.div
                whileHover={{ y: -4 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-all hover:border-accent/35 hover:shadow-lg hover:shadow-accent/10"
              >
                <div className="flex size-10 items-center justify-center rounded-lg bg-gradient-to-br from-accent/20 to-primary/20">
                  <badge.icon className="size-5 text-accent" />
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

"use client"

import { Zap, ShieldCheck, Headphones, RefreshCcw } from "lucide-react"
import { Reveal, RevealGroup, RevealItem } from "@/components/motion/reveal"
import { cn } from "@/lib/utils"

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
          <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">Why it works</p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Why shoppers trust DistroSource
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            No guesswork, no delivery delays — just a straightforward department store built around getting the
            right file into your hands correctly, the first time.
          </p>
        </Reveal>
        <RevealGroup className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
          {badges.map((badge, i) => {
            const highlighted = i === 0
            return (
              <RevealItem key={badge.title}>
                <div
                  className={cn(
                    "flex h-full flex-col gap-4 p-6",
                    highlighted ? "bg-primary text-primary-foreground" : "bg-card",
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "flex size-10 items-center justify-center rounded-[4px]",
                        highlighted ? "bg-primary-foreground/15 text-primary-foreground" : "bg-primary/10 text-primary",
                      )}
                    >
                      <badge.icon className="size-5" />
                    </span>
                    <span
                      className={cn(
                        "font-mono text-[10px] font-semibold",
                        highlighted ? "text-primary-foreground/60" : "text-muted-foreground/60",
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <h3 className="font-display text-base font-bold">{badge.title}</h3>
                  <p
                    className={cn(
                      "text-sm leading-relaxed",
                      highlighted ? "text-primary-foreground/85" : "text-muted-foreground",
                    )}
                  >
                    {badge.body}
                  </p>
                </div>
              </RevealItem>
            )
          })}
        </RevealGroup>
      </div>
    </section>
  )
}

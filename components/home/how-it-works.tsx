"use client"

import { Search, CreditCard, Mail, Gift } from "lucide-react"
import { RevealGroup, RevealItem } from "@/components/motion/reveal"

const steps = [
  {
    icon: Search,
    label: "01",
    title: "Pick your product",
    description: "Browse gift cards, top-ups, and software licenses from 500+ trusted brands worldwide.",
  },
  {
    icon: CreditCard,
    label: "02",
    title: "Pay securely",
    description: "Check out with card, PayPal, or your favorite wallet through our encrypted checkout.",
  },
  {
    icon: Mail,
    label: "03",
    title: "Get it instantly",
    description: "Your code is emailed and saved to your account the moment your payment clears.",
  },
  {
    icon: Gift,
    label: "04",
    title: "Redeem and enjoy",
    description: "Follow the redemption steps for your brand and enjoy your purchase right away.",
  },
]

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
      <div className="mb-10 text-center">
        <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">How it works</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          From checkout to redemption in under a minute — no waiting, no shipping.
        </p>
      </div>
      <RevealGroup className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4" stagger={0.08}>
        {steps.map((step, i) => (
          <RevealItem key={step.title}>
            <div className="relative flex h-full flex-col gap-4 rounded-2xl border border-border bg-card p-6">
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <step.icon aria-hidden="true" className="size-5" />
                </span>
                <span className="font-display text-3xl font-semibold text-muted-foreground/20">{step.label}</span>
              </div>
              <div>
                <h3 className="font-display text-base font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {step.description}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div className="absolute right-0 top-1/2 hidden h-px w-4 -translate-y-1/2 translate-x-full bg-border lg:block" />
              )}
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  )
}

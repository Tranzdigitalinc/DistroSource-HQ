"use client"

import { Search, SlidersHorizontal, CreditCard, FolderDown } from "lucide-react"
import { RevealGroup, RevealItem } from "@/components/motion/reveal"

const steps = [
  {
    icon: Search,
    label: "01",
    title: "Search & browse",
    description: "Explore templates, fonts, presentations, and dozens of other categories in one catalog.",
  },
  {
    icon: SlidersHorizontal,
    label: "02",
    title: "Preview & choose a license",
    description: "Check real previews, file formats, and compatibility, then pick the license that fits your use.",
  },
  {
    icon: CreditCard,
    label: "03",
    title: "Check out securely",
    description: "Pay with card or PayPal through an encrypted checkout — no accounts required until purchase.",
  },
  {
    icon: FolderDown,
    label: "04",
    title: "Download from My Library",
    description: "Your files unlock instantly in My Library, ready to download whenever you need them again.",
  },
]

export function HowItWorks() {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
      <div className="mb-10 text-center">
        <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">How it works</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          From browsing to downloading in minutes — no shipping, no waiting.
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

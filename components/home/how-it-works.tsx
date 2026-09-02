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
      <div className="mb-10 border-b border-border pb-6 text-center">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">The process</p>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">How it works</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          From browsing to downloading in minutes — no shipping, no waiting.
        </p>
      </div>
      <RevealGroup
        className="grid grid-cols-1 gap-px border border-border bg-border sm:grid-cols-2 lg:grid-cols-4"
        stagger={0.08}
      >
        {steps.map((step) => (
          <RevealItem key={step.title}>
            <div className="relative flex h-full flex-col gap-4 bg-card p-6">
              <div className="flex items-center justify-between">
                <span className="flex size-11 items-center justify-center rounded-[4px] bg-primary/10 text-primary">
                  <step.icon aria-hidden="true" className="size-5" />
                </span>
                <span className="font-mono text-2xl font-bold text-muted-foreground/25">{step.label}</span>
              </div>
              <div>
                <h3 className="font-display text-base font-bold text-foreground">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground text-pretty">
                  {step.description}
                </p>
              </div>
            </div>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  )
}

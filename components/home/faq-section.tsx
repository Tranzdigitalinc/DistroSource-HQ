"use client"

import Link from "next/link"
import { ArrowRight } from "@/lib/storefront-icons"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Reveal } from "@/components/motion/reveal"

const faqs = [
  {
    question: "How do I get my files after I buy?",
    answer:
      "As soon as your payment is confirmed, every item on your order unlocks in My Library under your account — download it immediately or come back anytime.",
  },
  {
    question: "What license should I choose?",
    answer:
      "Personal licenses cover your own non-commercial projects, Commercial licenses cover a single commercial or client project, and Agency licenses cover multiple client projects up to the limits stated on the product. No license tier permits reselling or redistributing the underlying files. Each product page explains what's included.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "Checkout is temporarily under maintenance while we work on payment processing. We'll display accepted payment methods here again once it's back online.",
  },
  {
    question: "Can I get a refund if a file doesn't work for me?",
    answer:
      "Yes — reach out within 14 days of purchase if a file is defective or not as described and we'll make it right. Once a download link has been used, refunds are reviewed case by case.",
  },
  {
    question: "Will I be notified about product updates?",
    answer:
      "Yes. When a product you own gets a new version, it shows up under Product Updates in your account and you can re-download the latest files at no extra cost.",
  },
]

export function FAQSection() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16 sm:px-8">
      <Reveal className="mb-10 border-b border-border pb-6 text-center">
        <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">Reference</p>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight sm:text-4xl">Frequently asked questions</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Can&apos;t find what you&apos;re looking for?{" "}
          <Link href="/account/support" className="font-medium text-primary hover:underline">
            Contact support
          </Link>
        </p>
      </Reveal>
      <Reveal className="border border-border bg-card px-6 sm:px-8">
        <Accordion multiple={false} className="divide-y divide-border">
          {faqs.map((faq, i) => (
            <AccordionItem key={faq.question} value={faq.question} className="py-1">
              <AccordionTrigger className="flex items-baseline gap-3 py-4 text-sm font-semibold text-foreground hover:no-underline sm:text-base">
                <span className="font-mono text-xs font-semibold text-muted-foreground/50">
                  {String(i + 1).padStart(2, "0")}
                </span>
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-4 pl-8 text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
      <Reveal className="mt-6 flex justify-center">
        <Link
          href="/account/support"
          className="flex items-center gap-1.5 font-mono text-xs font-semibold uppercase tracking-[0.04em] text-primary hover:underline"
        >
          Visit the help center
          <ArrowRight className="size-3.5" />
        </Link>
      </Reveal>
    </section>
  )
}

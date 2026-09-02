"use client"

import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Reveal } from "@/components/motion/reveal"

const faqs = [
  {
    question: "How fast will I receive my code?",
    answer:
      "Instantly. As soon as your payment is confirmed, your code is emailed to you and saved in your account under Orders — no waiting, no shipping.",
  },
  {
    question: "Are these codes genuine and safe to use?",
    answer:
      "Yes. We source directly from authorized distributors and verify every code before it's listed, so every purchase is guaranteed to work.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major cards, PayPal, Apple Pay, and Google Pay. All transactions are processed through an encrypted, PCI-compliant checkout.",
  },
  {
    question: "Can I get a refund if I change my mind?",
    answer:
      "Unused codes can be refunded within 14 days of purchase. Once a code has been revealed or redeemed, it's no longer eligible for a refund.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "There's nothing to ship — everything is delivered digitally. We support customers in 60+ countries with local currency pricing at checkout.",
  },
]

export function FAQSection() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-16 sm:px-8">
      <Reveal className="mb-10 text-center">
        <h2 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">Frequently asked questions</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          Can&apos;t find what you&apos;re looking for?{" "}
          <Link href="/account/support" className="font-medium text-primary hover:underline">
            Contact support
          </Link>
        </p>
      </Reveal>
      <Reveal className="rounded-2xl border border-border bg-card px-6 sm:px-8">
        <Accordion multiple={false} className="divide-y divide-border">
          {faqs.map((faq) => (
            <AccordionItem key={faq.question} value={faq.question} className="py-1">
              <AccordionTrigger className="py-4 text-sm font-semibold text-foreground hover:no-underline sm:text-base">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="pb-4 text-sm leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </Reveal>
      <Reveal className="mt-6 flex justify-center">
        <Link
          href="/account/support"
          className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          Visit the help center
          <ArrowRight className="size-3.5" />
        </Link>
      </Reveal>
    </section>
  )
}

import Link from "next/link"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { Reveal } from "@/components/motion/reveal"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

export const metadata = {
  title: "Frequently Asked Questions — RedeemCove",
  description: "Answers to common questions about orders, payments, gift cards, and your RedeemCove account.",
}

const faqGroups = [
  {
    category: "Orders & delivery",
    faqs: [
      {
        question: "How fast will I receive my code?",
        answer:
          "Instantly. As soon as your payment is confirmed, your code is issued to your account under Orders and My Gift Cards, and a copy is emailed to you — no waiting, no shipping.",
      },
      {
        question: "What if my order is delayed?",
        answer:
          "A small number of orders are held briefly for automated fraud review. If your order still shows \"Processing\" after 30 minutes, visit Order Help or contact support with your order number.",
      },
      {
        question: "Do you ship internationally?",
        answer:
          "There's nothing to ship — everything is delivered digitally. We support customers in 60+ countries with local currency pricing at checkout.",
      },
    ],
  },
  {
    category: "Payments & billing",
    faqs: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept all major cards, PayPal, Apple Pay, and Google Pay. All transactions are processed through an encrypted, PCI-compliant checkout.",
      },
      {
        question: "Why was my payment declined?",
        answer:
          "Common causes include insufficient funds, a bank's fraud hold on digital goods, or incorrect billing details. Try an alternate payment method, or contact your bank directly.",
      },
      {
        question: "Will I be charged extra fees for currency conversion?",
        answer:
          "RedeemCove doesn't add conversion fees, but if your card uses a different currency than the one displayed, your bank may apply its own exchange rate and foreign transaction fee.",
      },
    ],
  },
  {
    category: "Gift cards & redemption",
    faqs: [
      {
        question: "Are these codes genuine and safe to use?",
        answer:
          "Yes. We source directly from authorized distributors and verify every code before it's listed, so every purchase is guaranteed to work.",
      },
      {
        question: "Do gift cards expire?",
        answer:
          "Most gift cards sold on RedeemCove do not expire, but expiration terms are ultimately set by the issuing brand and disclosed on the product page before purchase.",
      },
      {
        question: "Can I use a gift card in any country?",
        answer:
          "No — gift cards are region-locked by the issuing brand. Always check the region shown on the product page matches your account before purchasing.",
      },
    ],
  },
  {
    category: "Refunds & account",
    faqs: [
      {
        question: "Can I get a refund if I change my mind?",
        answer:
          "Unused codes can be refunded within 14 days of purchase. Once a code has been revealed or redeemed, it's no longer eligible for a refund. See our Refund Policy for full details.",
      },
      {
        question: "How do I reset my password?",
        answer:
          "Go to the Sign In page and select \"Forgot password\" to receive a reset link by email.",
      },
      {
        question: "How do I delete my account?",
        answer:
          "Contact support through the Help Center and we'll process your deletion request, subject to any order records we're required to retain for tax or accounting purposes.",
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-14">
          <Reveal className="text-center">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Help Center / FAQs</p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-balance md:text-4xl">
              Frequently asked questions
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
              Can&apos;t find what you&apos;re looking for?{" "}
              <Link href="/contact" className="font-medium text-primary hover:underline">
                Contact our team
              </Link>
              .
            </p>
          </Reveal>

          <div className="mt-10 flex flex-col gap-10">
            {faqGroups.map((group) => (
              <Reveal key={group.category}>
                <h2 className="mb-3 font-display text-lg font-semibold text-foreground">{group.category}</h2>
                <div className="rounded-2xl border border-border bg-card px-6 sm:px-8">
                  <Accordion multiple={false} className="divide-y divide-border">
                    {group.faqs.map((faq) => (
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
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

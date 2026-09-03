import Link from "next/link"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { Reveal } from "@/components/motion/reveal"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"

export const metadata = {
  title: "Frequently Asked Questions — DistroSource",
  description: "Answers to common questions about orders, licensing, downloads, and your DistroSource account.",
}

const faqGroups = [
  {
    category: "Orders & downloads",
    faqs: [
      {
        question: "How fast can I download my files?",
        answer:
          "Instantly. As soon as your payment is confirmed, your files are added to My Library and available to download right away, and a confirmation email is sent to you — no waiting, no shipping.",
      },
      {
        question: "What if my order is delayed?",
        answer:
          "A small number of orders are held briefly for automated fraud review. If your order still shows \"Processing\" after 30 minutes, visit Order Help or contact support with your order number.",
      },
      {
        question: "Do you ship anything physically?",
        answer:
          "No — every product on DistroSource is a digital file delivered straight to your account. There's nothing to ship and no customs or shipping fees, anywhere in the world.",
      },
    ],
  },
  {
    category: "Payments & billing",
    faqs: [
      {
        question: "What payment methods do you accept?",
        answer:
          "We accept PayPal and major debit and credit cards through PayPal Checkout, all processed through an encrypted, PCI-compliant checkout.",
      },
      {
        question: "Why was my payment declined?",
        answer:
          "Common causes include insufficient funds, a bank's fraud hold on digital goods, or incorrect billing details. Try an alternate payment method, or contact your bank directly.",
      },
      {
        question: "Will I be charged extra fees for currency conversion?",
        answer:
          "All prices on DistroSource are in U.S. dollars. If your card uses a different currency, your bank may apply its own exchange rate and foreign transaction fee — DistroSource does not add any conversion fee.",
      },
    ],
  },
  {
    category: "Licensing & usage",
    faqs: [
      {
        question: "What's the difference between the license tiers?",
        answer:
          "Personal licenses cover non-commercial, personal projects. Commercial licenses cover use in a single business or client project. Extended Commercial and Agency tiers extend that to unlimited projects and multi-client use. None of our license tiers permit reselling or redistributing the underlying files themselves. Each product page lists exactly what its tiers include.",
      },
      {
        question: "Can I use a product across my whole team?",
        answer:
          "Standard license tiers cover a single user. For multi-seat access across a team or agency, use our Team Licensing program to request a custom quote.",
      },
      {
        question: "Do I own the files after I buy them?",
        answer:
          "You own a license to use the files under the terms you purchased — copyright and resale rights to the underlying design or code remain with DistroSource and its creators unless a listing says otherwise.",
      },
    ],
  },
  {
    category: "Refunds & account",
    faqs: [
      {
        question: "Can I get a refund if I change my mind?",
        answer:
          "Undownloaded orders can be refunded within 14 days of purchase. Once a file has been downloaded, it's no longer eligible for a refund. See our Refund Policy for full details.",
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

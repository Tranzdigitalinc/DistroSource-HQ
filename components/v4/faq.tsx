"use client"

import Link from "next/link"
import { AnimatePresence, motion } from "motion/react"
import { useState } from "react"
import { ArrowRight, Plus } from "@/lib/storefront-icons"

const faqs = [
  {
    question: "How do I receive digital products?",
    answer: "Once payment is confirmed, eligible products unlock digitally. Your order confirmation and account library show the access available for that purchase.",
  },
  {
    question: "Which licence should I choose?",
    answer: "Each product page shows the licence tiers available for that item. Review the usage description before buying; the underlying files may not be resold or redistributed unless a product explicitly says otherwise.",
  },
  {
    question: "Which payment methods are available?",
    answer: "The checkout shows the payment options currently available for your order. Availability can vary by provider and payment method, so the checkout itself is the source of truth.",
  },
  {
    question: "Can I download a purchase again later?",
    answer: "Purchases associated with your account remain visible in My Library where the product supports account-based re-downloads and updates.",
  },
  {
    question: "What if a product has a problem?",
    answer: "Contact support with the order and product details. Refund and remedy eligibility depends on the product, download status, and the published refund policy.",
  },
]

export function V4FAQ() {
  const [open, setOpen] = useState(0)

  return (
    <section className="py-20 sm:py-24 lg:py-28">
      <div className="mx-auto grid max-w-[1320px] gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20 lg:px-8">
        <div>
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-primary">Questions, answered</p>
          <h2 className="mt-4 font-display text-[clamp(2.5rem,5vw,5.2rem)] font-black leading-[0.9] tracking-[-0.06em]">Before you click buy.</h2>
          <p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">Practical answers about access, licensing and checkout. Need something specific?</p>
          <Link href="/account/support" className="group mt-6 inline-flex items-center gap-2 text-sm font-semibold">Talk to support <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" /></Link>
        </div>

        <div className="border-y border-border">
          {faqs.map((faq, index) => {
            const active = open === index
            return (
              <div key={faq.question} className="border-b border-border last:border-b-0">
                <button
                  type="button"
                  onClick={() => setOpen(active ? -1 : index)}
                  className="group flex w-full items-center gap-4 py-6 text-left sm:py-7"
                  aria-expanded={active}
                >
                  <span className="font-mono text-[9px] font-black text-muted-foreground/50">0{index + 1}</span>
                  <span className="flex-1 font-display text-lg font-black tracking-[-0.025em] sm:text-xl">{faq.question}</span>
                  <motion.span animate={{ rotate: active ? 45 : 0 }} transition={{ type: "spring", stiffness: 420, damping: 30 }} className="flex size-9 shrink-0 items-center justify-center rounded-full border border-border group-hover:bg-secondary">
                    <Plus size={14} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {active && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.28 }} className="overflow-hidden">
                      <p className="max-w-2xl pb-7 pl-9 pr-12 text-sm leading-7 text-muted-foreground">{faq.answer}</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

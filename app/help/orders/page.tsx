import Link from "next/link"
import { PackageSearch, Download, KeyRound, RefreshCcw, ArrowRight } from "lucide-react"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { Reveal } from "@/components/motion/reveal"
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Order Help — DistroSource",
  description: "Track your order, re-download a purchase, or get help with a license key.",
}

const steps = [
  {
    icon: PackageSearch,
    title: "1. Find your order",
    description: "Sign in and go to Account → My Orders to see every purchase and its delivery status.",
  },
  {
    icon: KeyRound,
    title: "2. Get your license key",
    description: "Open the order and click \"View license\" to see your key, seat count, and activation instructions.",
  },
  {
    icon: Download,
    title: "3. Download your files",
    description: "Head to Account → My Library to download the current version, or any previous release, at any time.",
  },
  {
    icon: RefreshCcw,
    title: "4. Request help if needed",
    description: "If a download fails, a key won't activate, or a file arrived corrupted, open a support ticket with your order number.",
  },
]

const faqs = [
  {
    question: "My order says \"Processing\" — is that normal?",
    answer:
      "Yes, briefly. Most orders complete within seconds, but a small number are held for a minute or two of automated fraud review. If it's still processing after 30 minutes, contact support with your order number.",
  },
  {
    question: "I can't find my license key — where is it?",
    answer:
      "Your key is always available in Account → My Orders and Account → My Licenses, even after it's been activated. A copy is also emailed to your account address at checkout.",
  },
  {
    question: "I downloaded a file but it won't open or looks corrupted.",
    answer:
      "Try re-downloading from Account → My Library first — most issues are caused by an interrupted download. If the file still won't open, contact support with your order number and the exact error message.",
  },
  {
    question: "Can I move my purchase to a different account?",
    answer:
      "License keys are tied to the account that made the purchase and generally can't be transferred. If you bought the wrong account by mistake, contact support as soon as possible and we'll see what we can do.",
  },
  {
    question: "How do I get a refund on an order?",
    answer:
      "Refund eligibility depends on whether the files have been downloaded or the license activated. See our Refund Policy for full details, or open a ticket from your order page to start a request.",
  },
]

export default function OrderHelpPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-14">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">Help Center / Order Help</p>
            <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-balance md:text-4xl">
              Order and delivery help
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">
              Everything you need to track a purchase, find a license key, or resolve a download issue — most
              orders sort themselves out in under a minute.
            </p>
          </Reveal>

          <Reveal className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {steps.map((step) => (
              <div key={step.title} className="rounded-xl border border-border bg-card p-5">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <step.icon className="size-4.5" />
                </span>
                <h3 className="mt-3 text-sm font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </Reveal>

          <Reveal className="mt-10 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-secondary/40 p-5">
            <p className="flex-1 text-sm text-muted-foreground">
              Ready to check your orders or start a support ticket?
            </p>
            <Button size="sm" nativeButton={false} render={<Link href="/account/orders" />}>
              View my orders
            </Button>
            <Button size="sm" variant="outline" nativeButton={false} render={<Link href="/account/support" />}>
              Open a ticket
              <ArrowRight className="size-3.5" />
            </Button>
          </Reveal>

          <div className="mt-12">
            <h2 className="font-display text-lg font-semibold text-foreground">Order FAQs</h2>
            <Reveal className="mt-4 rounded-2xl border border-border bg-card px-6 sm:px-8">
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
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

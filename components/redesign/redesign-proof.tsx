import Link from "next/link"
import { ArrowUpRight, Download, FileCheck, Headphones, Library } from "@/lib/storefront-icons"

const proof = [
  {
    icon: Download,
    index: "01",
    title: "Digital delivery",
    body: "Completed purchases unlock digitally — no shipping step and no physical fulfilment delay.",
  },
  {
    icon: Library,
    index: "02",
    title: "Your library",
    body: "Owned products stay associated with your account so you can return to your downloads later.",
  },
  {
    icon: FileCheck,
    index: "03",
    title: "License up front",
    body: "Available license choices and product details are shown before the purchase decision, not hidden after checkout.",
  },
  {
    icon: Headphones,
    index: "04",
    title: "Human support",
    body: "Order, download and licensing questions can be taken to DistroSource support when you need help.",
  },
]

const faqs = [
  {
    question: "Where do purchased files go?",
    answer: "After a successful purchase, eligible downloadable items appear in your account library. You can return there later rather than treating the checkout page as your only chance to download.",
  },
  {
    question: "How do licenses work?",
    answer: "A product can offer one or more license options. The available tiers, pricing and product-specific details are shown on the product page. The underlying files may not be resold or redistributed unless a product explicitly says otherwise.",
  },
  {
    question: "Can products receive updates?",
    answer: "Products can carry version and changelog information. When an owned product has updated files available, the latest eligible download remains tied to the account library flow.",
  },
  {
    question: "What if I need help with an order or file?",
    answer: "Use DistroSource support for order, access, download or licensing questions. Include the relevant order or product details so the issue can be checked against the actual purchase.",
  },
]

export function RedesignProof() {
  return (
    <>
      <section className="border-y border-border bg-background">
        <div className="mx-auto max-w-[1500px] px-6 py-16 sm:px-8 lg:px-10 lg:py-24">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-16">
            <div className="max-w-xl">
              <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Buying digital, without mystery</p>
              <h2 className="mt-3 font-display text-4xl font-black leading-[0.96] tracking-[-0.045em] text-foreground sm:text-5xl">
                The useful details stay visible.
              </h2>
              <p className="mt-4 text-sm leading-6 text-muted-foreground sm:text-base">
                DistroSource should feel like a department store with a good clerk: enough information to decide, no invented urgency, and a clear place to return after purchase.
              </p>
              <Link href="/help" className="mt-7 inline-flex min-h-11 items-center gap-2 border border-border px-4 py-2.5 text-sm font-bold text-foreground transition-colors hover:border-primary hover:text-primary">
                Visit help center
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </Link>
            </div>

            <div className="grid gap-px border border-border bg-border sm:grid-cols-2">
              {proof.map(({ icon: Icon, index, title, body }) => (
                <article key={title} className="min-h-56 bg-background p-6">
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex size-11 items-center justify-center border border-border bg-card text-primary">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <span className="font-mono text-[10px] font-bold text-muted-foreground/55">{index}</span>
                  </div>
                  <h3 className="mt-8 font-display text-xl font-black tracking-tight text-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{body}</p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary/25">
        <div className="mx-auto grid max-w-[1500px] gap-10 px-6 py-16 sm:px-8 lg:grid-cols-[minmax(0,0.72fr)_minmax(0,1.28fr)] lg:gap-16 lg:px-10 lg:py-24">
          <div>
            <p className="font-mono text-[10px] font-bold uppercase tracking-[0.14em] text-primary">Common questions</p>
            <h2 className="mt-3 font-display text-4xl font-black leading-[0.98] tracking-[-0.045em] text-foreground sm:text-5xl">Before you open a ticket.</h2>
            <p className="mt-4 max-w-lg text-sm leading-6 text-muted-foreground sm:text-base">
              The short answers to the questions that matter most when buying downloadable products.
            </p>
          </div>

          <div className="border-t border-border">
            {faqs.map((faq, index) => (
              <details key={faq.question} className="group border-b border-border">
                <summary className="flex min-h-16 cursor-pointer list-none items-center gap-4 py-4 text-left [&::-webkit-details-marker]:hidden">
                  <span className="font-mono text-[10px] font-bold text-muted-foreground/55">{String(index + 1).padStart(2, "0")}</span>
                  <span className="flex-1 font-display text-base font-bold text-foreground sm:text-lg">{faq.question}</span>
                  <span aria-hidden="true" className="flex size-8 items-center justify-center border border-border text-lg leading-none text-muted-foreground transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="max-w-3xl pb-5 pl-10 pr-10 text-sm leading-6 text-muted-foreground">{faq.answer}</p>
              </details>
            ))}
            <div className="flex flex-wrap items-center justify-between gap-4 py-5">
              <p className="text-sm text-muted-foreground">Still need a hand?</p>
              <Link href="/account/support" className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline">
                Contact support <ArrowUpRight className="size-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

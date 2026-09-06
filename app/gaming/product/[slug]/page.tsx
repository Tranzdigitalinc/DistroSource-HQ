import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { GamingGallery } from "@/components/gaming/gaming-gallery"
import { TebexBuyButton } from "@/components/gaming/tebex-buy-button"
import { V4GamingCard } from "@/components/v4/gaming-card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ChevronRight, Download, Lock, ShieldCheck, Support } from "@/lib/storefront-icons"
import { getGamingBadges, getGamingProductBySlug, getGamingProductSlugs, getRelatedGamingProducts } from "@/lib/gaming/queries"
import { CATEGORY_LABEL, PLATFORM_LABEL } from "@/lib/gaming/types"
import { formatUsd } from "@/lib/format"

export function generateStaticParams() {
  return getGamingProductSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = getGamingProductBySlug(slug)
  if (!product) return {}
  const title = `${product.title} — ${PLATFORM_LABEL[product.platform]} | DistroSource Gaming`
  return { title, description: product.shortDescription, alternates: { canonical: `/gaming/product/${product.slug}` } }
}

function formatDate(iso: string) {
  const [year, month, day] = iso.split("-").map(Number)
  return new Date(year, month - 1, day).toLocaleDateString("en-US", { dateStyle: "medium" })
}

export default async function GamingProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = getGamingProductBySlug(slug)
  if (!product) notFound()

  const badges = getGamingBadges(product)
  const related = getRelatedGamingProducts(product, 8)
  const discounted = Boolean(product.originalPrice && product.originalPrice > product.price)
  const facts: [string, string][] = [
    ["Platform", PLATFORM_LABEL[product.platform]],
    ["Category", CATEGORY_LABEL[product.category]],
    ["Version", `v${product.version}`],
    ["Updated", formatDate(product.lastUpdated)],
  ]

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1 bg-[oklch(0.105_0.018_255)] text-white">
        <section className="border-b border-white/10">
          <div className="mx-auto max-w-[1540px] px-4 pb-14 pt-5 sm:px-6 sm:pb-18 lg:px-8 lg:pb-24">
            <nav aria-label="Breadcrumb" className="mb-7 flex min-w-0 items-center gap-1.5 overflow-hidden text-[11px] text-white/35">
              <Link href="/gaming" className="shrink-0 hover:text-white">Gaming</Link><ChevronRight size={11} />
              <Link href={`/gaming/products?platform=${product.platform}`} className="shrink-0 hover:text-white">{PLATFORM_LABEL[product.platform]}</Link><ChevronRight size={11} />
              <span className="truncate text-white">{product.title}</span>
            </nav>

            <div className="grid items-start gap-9 lg:grid-cols-[minmax(0,1.35fr)_minmax(360px,0.65fr)] lg:gap-12 xl:gap-16">
              <div className="min-w-0"><GamingGallery images={product.images} art={product.art} title={product.title} /></div>

              <aside className="lg:sticky lg:top-24">
                <div className="flex flex-wrap items-center gap-2 font-mono text-[9px] font-black uppercase tracking-[0.11em] text-white/40">
                  <span className="text-primary">{PLATFORM_LABEL[product.platform]}</span><span>/</span><span>{CATEGORY_LABEL[product.category]}</span>
                  {badges.map((badge) => <span key={badge} className="rounded-full bg-white/8 px-2.5 py-1 text-white/60">{badge}</span>)}
                </div>
                <h1 className="mt-4 font-display text-[clamp(3rem,5vw,5.6rem)] font-black leading-[0.84] tracking-[-0.075em]">{product.title}</h1>
                <p className="mt-5 text-sm leading-7 text-white/48 sm:text-base">{product.shortDescription}</p>

                <div className="mt-7 overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.045]">
                  <div className="p-5 sm:p-6">
                    <p className="font-mono text-[9px] font-black uppercase tracking-[0.12em] text-white/35">One-time purchase</p>
                    <div className="mt-2 flex items-end gap-2">
                      <span className="font-display text-5xl font-black tracking-[-0.06em]">{formatUsd(product.price)}</span>
                      {discounted && <span className="pb-1 text-sm text-white/30 line-through">{formatUsd(product.originalPrice!)}</span>}
                    </div>
                    <TebexBuyButton product={product} className="mt-6 h-14 w-full rounded-full text-sm font-bold" label="Buy through Tebex" />
                    <Link href={`/gaming/products?platform=${product.platform}`} className="mt-2 flex h-11 items-center justify-center rounded-full border border-white/10 text-xs font-semibold text-white/60 transition-colors hover:bg-white/[0.06] hover:text-white">Browse more {PLATFORM_LABEL[product.platform]}</Link>
                  </div>

                  <dl className="grid grid-cols-2 gap-px bg-white/10">
                    {facts.map(([label, value]) => <div key={label} className="bg-[oklch(0.13_0.018_255)] px-4 py-3.5"><dt className="font-mono text-[8px] font-black uppercase tracking-[0.1em] text-white/30">{label}</dt><dd className="mt-1 truncate text-[11px] font-semibold text-white/75">{value}</dd></div>)}
                  </dl>

                  <div className="space-y-2 border-t border-white/10 px-5 py-4 text-[11px] text-white/42 sm:px-6">
                    <p className="flex items-center gap-2"><Download size={13} className="text-primary" /> Access follows successful payment confirmation</p>
                    <p className="flex items-center gap-2"><Lock size={13} className="text-primary" /> Checkout handled through Tebex for this product</p>
                    <p className="flex items-center gap-2"><ShieldCheck size={13} className="text-primary" /> Official DistroSource gaming resource</p>
                  </div>
                </div>

                <Link href="/contact?topic=product" className="mt-4 flex items-center gap-3 rounded-[22px] border border-white/10 p-4 text-sm text-white/55 transition-colors hover:bg-white/[0.04] hover:text-white">
                  <span className="flex size-10 items-center justify-center rounded-full bg-white/[0.06] text-primary"><Support size={16} /></span>
                  <span><strong className="block text-white">Need help?</strong><span className="text-xs">Installation, compatibility or purchase support</span></span>
                </Link>
              </aside>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <div className="grid gap-14 lg:grid-cols-[260px_1fr] lg:gap-16">
            <div className="lg:sticky lg:top-24 lg:self-start">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.14em] text-primary">Product details</p>
              <h2 className="mt-4 font-display text-4xl font-black leading-[0.92] tracking-[-0.055em]">Everything before install.</h2>
            </div>

            <div className="space-y-16">
              <section><p className="font-mono text-[9px] font-black uppercase tracking-[0.12em] text-white/30">Overview</p><p className="mt-4 max-w-3xl text-[15px] leading-8 text-white/55">{product.description}</p></section>

              <section><h3 className="font-display text-2xl font-black tracking-[-0.04em]">Features</h3><ul className="mt-5 grid max-w-4xl gap-3 sm:grid-cols-2">{product.features.map((feature) => <li key={feature} className="flex items-start gap-3 rounded-2xl bg-white/[0.035] p-4 text-sm leading-6 text-white/55"><ShieldCheck size={14} className="mt-0.5 shrink-0 text-primary" />{feature}</li>)}</ul></section>

              <section><h3 className="font-display text-2xl font-black tracking-[-0.04em]">What&apos;s included</h3><div className="mt-5 grid gap-px overflow-hidden rounded-[26px] bg-white/10 sm:grid-cols-2">{product.included.map((item) => <div key={item} className="bg-[oklch(0.13_0.018_255)] px-5 py-4 text-sm text-white/65">{item}</div>)}</div></section>

              <section><h3 className="font-display text-2xl font-black tracking-[-0.04em]">Compatibility & requirements</h3><div className="mt-5 flex flex-wrap gap-2">{product.compatibility.map((item) => <span key={item} className="rounded-full border border-white/10 px-3 py-2 text-xs text-white/55">{item}</span>)}</div><ul className="mt-5 space-y-2 text-sm leading-6 text-white/48">{product.requirements.map((item) => <li key={item}>— {item}</li>)}</ul></section>

              <section><h3 className="font-display text-2xl font-black tracking-[-0.04em]">Installation</h3><ol className="mt-5 space-y-3">{product.installation.map((step, index) => <li key={step} className="grid gap-3 border-b border-white/10 pb-4 sm:grid-cols-[44px_1fr]"><span className="font-mono text-[10px] font-black text-primary">0{index + 1}</span><p className="text-sm leading-7 text-white/55">{step}</p></li>)}</ol></section>

              {product.changelog.length > 0 && <section><h3 className="font-display text-2xl font-black tracking-[-0.04em]">Changelog</h3><ul className="mt-5 divide-y divide-white/10 border-y border-white/10">{product.changelog.map((entry) => <li key={entry.version} className="grid gap-3 py-5 sm:grid-cols-[130px_1fr]"><div><strong className="font-display text-lg">v{entry.version}</strong><p className="mt-1 font-mono text-[9px] text-white/30">{formatDate(entry.date)}</p></div><ul className="space-y-1 text-sm text-white/48">{entry.notes.map((note) => <li key={note}>— {note}</li>)}</ul></li>)}</ul></section>}

              {product.faq.length > 0 && <section><h3 className="font-display text-2xl font-black tracking-[-0.04em]">FAQ</h3><Accordion className="mt-4 max-w-4xl">{product.faq.map((item) => <AccordionItem key={item.question} value={item.question} className="border-white/10"><AccordionTrigger className="text-left text-sm font-semibold text-white">{item.question}</AccordionTrigger><AccordionContent className="text-sm leading-7 text-white/48">{item.answer}</AccordionContent></AccordionItem>)}</Accordion></section>}
            </div>
          </div>
        </section>

        {related.length > 0 && <section className="border-t border-white/10 bg-white/[0.02] py-16 sm:py-20"><div className="mx-auto max-w-[1540px] px-4 sm:px-6 lg:px-8"><div className="mb-8"><p className="font-mono text-[10px] font-black uppercase tracking-[0.14em] text-primary">Keep building</p><h2 className="mt-3 font-display text-4xl font-black tracking-[-0.055em]">More {PLATFORM_LABEL[product.platform]} resources.</h2></div><div className="grid grid-cols-2 gap-x-3 gap-y-9 sm:gap-x-5 lg:grid-cols-4">{related.map((item) => <V4GamingCard key={item.id} product={item} />)}</div></div></section>}

        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[oklch(0.105_0.018_255)]/90 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl lg:hidden"><div className="mx-auto flex max-w-xl items-center gap-4"><div className="min-w-0"><p className="font-display text-xl font-black">{formatUsd(product.price)}</p><p className="truncate text-[10px] text-white/35">{PLATFORM_LABEL[product.platform]}</p></div><TebexBuyButton product={product} className="h-12 flex-1 rounded-full" label="Buy now" /></div></div>
      </main>
      <SiteFooter />
    </div>
  )
}

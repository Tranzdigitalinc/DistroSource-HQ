import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { GamingGallery } from "@/components/gaming/gaming-gallery"
import { GamingProductCard } from "@/components/gaming/gaming-product-card"
import { TebexBuyButton } from "@/components/gaming/tebex-buy-button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ChevronRight, ShieldCheck } from "@/lib/storefront-icons"
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
  return { title, description: product.shortDescription, alternates: { canonical: `/gaming/product/${product.slug}` }, openGraph: { title, description: product.shortDescription, url: `/gaming/product/${product.slug}`, type: "website" } }
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
  const related = getRelatedGamingProducts(product, 4)
  const discounted = Boolean(product.originalPrice && product.originalPrice > product.price)
  const facts: [string, string][] = [
    ["Platform", PLATFORM_LABEL[product.platform]],
    ["Category", CATEGORY_LABEL[product.category]],
    ["Version", `v${product.version}`],
    ["Updated", formatDate(product.lastUpdated)],
  ]

  return (
    <div className="flex min-h-screen flex-col bg-[#07111f] text-white">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-[1600px] px-4 pb-24 pt-6 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 overflow-hidden text-xs text-white/35"><Link href="/gaming" className="hover:text-white">Gaming</Link><ChevronRight size={11} /><Link href={`/gaming/products?platform=${product.platform}`} className="hover:text-white">{PLATFORM_LABEL[product.platform]}</Link><ChevronRight size={11} /><span className="truncate text-white/65">{product.title}</span></nav>

          <section className="mt-7 grid items-start gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.72fr)] lg:gap-12 xl:gap-16">
            <div className="min-w-0"><GamingGallery images={product.images} art={product.art} title={product.title} /></div>
            <aside className="lg:sticky lg:top-24">
              <div className="flex flex-wrap gap-2 font-mono text-[8px] font-black uppercase tracking-[0.11em] text-white/40"><span>{PLATFORM_LABEL[product.platform]}</span><span>/</span><span>{CATEGORY_LABEL[product.category]}</span>{badges.slice(0, 2).map((badge) => <span key={badge} className="bg-primary px-2 py-1 text-primary-foreground">{badge}</span>)}</div>
              <h1 className="mt-4 font-display text-[clamp(3rem,5.6vw,5.8rem)] font-black leading-[0.84] tracking-[-0.075em]">{product.title}</h1>
              <p className="mt-5 max-w-xl text-sm leading-7 text-white/48 sm:text-base">{product.shortDescription}</p>
              <p className="mt-4 flex items-center gap-2 text-xs text-white/40"><ShieldCheck size={13} className="text-primary" /> Official DistroSource Gaming product</p>

              <div className="mt-7 border border-white/12 bg-white/[0.035]">
                <div className="border-b border-white/10 p-5 sm:p-6"><p className="font-mono text-[8px] font-black uppercase tracking-[0.12em] text-white/35">One-time purchase</p><div className="mt-3 flex flex-wrap items-baseline gap-2"><span className="font-display text-5xl font-black leading-none tracking-[-0.065em] text-white">{formatUsd(product.price)}</span>{discounted && <span className="text-sm text-white/30 line-through">{formatUsd(product.originalPrice!)}</span>}<span className="font-mono text-[9px] uppercase text-white/30">USD</span></div></div>
                <dl className="grid grid-cols-2 gap-px bg-white/10">{facts.map(([key, value]) => <div key={key} className="bg-[#0a1523] px-4 py-3"><dt className="font-mono text-[8px] font-black uppercase tracking-[0.1em] text-white/28">{key}</dt><dd className="mt-1 truncate text-xs font-semibold text-white/75">{value}</dd></div>)}</dl>
                <div className="p-5 sm:p-6"><TebexBuyButton product={product} className="h-14 w-full rounded-none text-sm font-black" /><p className="mt-3 text-center text-[10px] leading-5 text-white/32">Secure Gaming checkout is handled separately through Tebex. Your regular DistroSource cart is unaffected.</p></div>
              </div>
            </aside>
          </section>

          <section className="mt-20 grid gap-10 border-t border-white/10 pt-12 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16">
            <div><p className="font-mono text-[9px] font-black uppercase tracking-[0.14em] text-primary">Product details</p><h2 className="mt-3 font-display text-3xl font-black leading-[0.94] tracking-[-0.05em]">Know what you’re installing.</h2></div>
            <div className="space-y-14">
              <DetailSection title="Overview"><p className="max-w-4xl text-[15px] leading-8 text-white/48">{product.description}</p></DetailSection>
              <DetailSection title="Features"><ul className="grid max-w-4xl gap-x-8 gap-y-3 sm:grid-cols-2">{product.features.map((feature) => <li key={feature} className="flex items-start gap-2 border-b border-white/8 pb-3 text-sm leading-6 text-white/52"><ShieldCheck size={13} className="mt-1 shrink-0 text-primary" />{feature}</li>)}</ul></DetailSection>
              <DetailSection title="What’s included"><ul className="max-w-4xl border-y border-white/10">{product.included.map((item, index) => <li key={item} className="grid grid-cols-[44px_1fr] border-b border-white/10 py-3 text-sm text-white/65"><span className="font-mono text-[9px] text-white/25">{String(index + 1).padStart(2, "0")}</span><span>{item}</span></li>)}</ul></DetailSection>
              <DetailSection title="Compatibility"><div className="flex max-w-4xl flex-wrap gap-2">{product.compatibility.map((item) => <span key={item} className="border border-white/12 px-3 py-2 text-xs font-semibold text-white/60">{item}</span>)}</div></DetailSection>
              <DetailSection title="Requirements"><ul className="max-w-4xl list-disc space-y-2 pl-5 text-sm leading-7 text-white/48">{product.requirements.map((item) => <li key={item}>{item}</li>)}</ul></DetailSection>
              <DetailSection title="Installation"><ol className="max-w-4xl border-y border-white/10">{product.installation.map((step, index) => <li key={step} className="grid grid-cols-[54px_1fr] border-b border-white/10 py-4 text-sm leading-6 text-white/50"><span className="font-mono text-[9px] font-black text-primary">0{index + 1}</span><span>{step}</span></li>)}</ol></DetailSection>
              {product.changelog.length > 0 && <DetailSection title="Changelog"><ul className="max-w-4xl border-y border-white/10">{product.changelog.map((entry) => <li key={entry.version} className="grid gap-2 border-b border-white/10 py-4 sm:grid-cols-[150px_1fr]"><div><span className="font-mono text-sm font-black">v{entry.version}</span><span className="mt-1 block text-xs text-white/30">{formatDate(entry.date)}</span></div><ul className="list-disc space-y-1 pl-5 text-sm text-white/48">{entry.notes.map((note) => <li key={note}>{note}</li>)}</ul></li>)}</ul></DetailSection>}
              {product.faq.length > 0 && <DetailSection title="FAQ"><Accordion className="max-w-4xl">{product.faq.map((item) => <AccordionItem key={item.question} value={item.question} className="border-white/10"><AccordionTrigger className="text-left text-sm font-semibold text-white hover:no-underline">{item.question}</AccordionTrigger><AccordionContent className="text-sm leading-7 text-white/48">{item.answer}</AccordionContent></AccordionItem>)}</Accordion></DetailSection>}
            </div>
          </section>

          {related.length > 0 && <section className="mt-20 border-t border-white/10 pt-12"><div className="mb-7"><p className="font-mono text-[9px] font-black uppercase tracking-[0.14em] text-primary">Keep exploring</p><h2 className="mt-2 font-display text-3xl font-black tracking-[-0.05em]">More {PLATFORM_LABEL[product.platform]} products</h2></div><div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">{related.map((item) => <GamingProductCard key={item.id} product={item} className="[&_h3]:text-white [&_.text-foreground]:text-white [&_.text-muted-foreground]:text-white/45 [&_.border-border]:border-white/10" />)}</div></section>}
        </div>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#07111f]/95 px-4 py-3 backdrop-blur lg:hidden"><div className="mx-auto flex max-w-xl items-center gap-4"><div><p className="font-display text-xl font-black">{formatUsd(product.price)}</p><p className="font-mono text-[8px] uppercase tracking-[0.1em] text-white/30">{PLATFORM_LABEL[product.platform]}</p></div><TebexBuyButton product={product} className="h-12 flex-1 rounded-none" /></div></div>
      </main>
      <SiteFooter />
    </div>
  )
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <section><h3 className="mb-5 font-display text-2xl font-black tracking-[-0.04em] text-white">{title}</h3>{children}</section>
}

import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { GamingGallery } from "@/components/gaming/gaming-gallery"
import { GamingProductCard } from "@/components/gaming/gaming-product-card"
import { TebexBuyButton } from "@/components/gaming/tebex-buy-button"
import { Button } from "@/components/ui/button"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ChevronRight, Download, Lock, RefreshCw, ShieldCheck, Support, ICON_SIZE } from "@/lib/storefront-icons"
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
  return {
    title,
    description: product.shortDescription,
    alternates: { canonical: `/gaming/product/${product.slug}` },
    openGraph: {
      title,
      description: product.shortDescription,
      url: `/gaming/product/${product.slug}`,
      type: "website",
    },
  }
}

function formatDate(iso: string) {
  // These are calendar dates, not instants. `new Date("2026-07-09")` parses
  // as UTC midnight, which formats as the previous day for any viewer behind
  // UTC — so a release dated the 9th shows as the 8th. Read the parts and
  // build a local date instead.
  const [year, month, day] = iso.split("-").map(Number)
  return new Date(year, month - 1, day).toLocaleDateString("en-US", { dateStyle: "medium" })
}

export default async function GamingProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = getGamingProductBySlug(slug)
  if (!product) notFound()

  const badges = getGamingBadges(product)
  const related = getRelatedGamingProducts(product, 4)
  const discounted = product.originalPrice && product.originalPrice > product.price

  const facts: [string, string][] = [
    ["Platform", PLATFORM_LABEL[product.platform]],
    ["Category", CATEGORY_LABEL[product.category]],
    ["Version", `v${product.version}`],
    ["Last updated", formatDate(product.lastUpdated)],
  ]

  const sections: { id: string; title: string; body: React.ReactNode }[] = [
    {
      id: "overview",
      title: "Overview",
      body: <p className="max-w-3xl text-[15px] leading-relaxed text-muted-foreground">{product.description}</p>,
    },
    {
      id: "features",
      title: "Features",
      body: (
        <ul className="grid max-w-3xl grid-cols-1 gap-2 sm:grid-cols-2">
          {product.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm leading-relaxed text-muted-foreground">
              <ShieldCheck size={ICON_SIZE.sm} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
              {f}
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: "included",
      title: "What's included",
      body: (
        <ul className="max-w-3xl divide-y divide-border rounded-lg border border-border">
          {product.included.map((item) => (
            <li key={item} className="px-4 py-3 text-sm text-foreground">
              {item}
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: "compatibility",
      title: "Compatibility",
      body: (
        <div className="flex max-w-3xl flex-wrap gap-2">
          {product.compatibility.map((c) => (
            <span key={c} className="rounded-md border border-border bg-secondary px-2.5 py-1.5 text-xs font-medium text-foreground">
              {c}
            </span>
          ))}
        </div>
      ),
    },
    {
      id: "requirements",
      title: "Requirements",
      body: (
        <ul className="max-w-3xl list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-muted-foreground">
          {product.requirements.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
      ),
    },
    {
      id: "installation",
      title: "Installation",
      body: (
        <ol className="max-w-3xl space-y-3">
          {product.installation.map((step, i) => (
            <li key={step} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-[11px] font-bold text-foreground">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      ),
    },
    {
      id: "changelog",
      title: "Changelog",
      body: (
        <ul className="max-w-3xl divide-y divide-border rounded-lg border border-border">
          {product.changelog.map((entry) => (
            <li key={entry.version} className="px-4 py-3.5">
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-foreground">v{entry.version}</span>
                <span className="font-mono text-xs text-muted-foreground">{formatDate(entry.date)}</span>
              </div>
              <ul className="mt-1.5 list-disc space-y-1 pl-5 text-sm text-muted-foreground">
                {entry.notes.map((n) => (
                  <li key={n}>{n}</li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      ),
    },
    {
      id: "faq",
      title: "FAQ",
      body: (
        <Accordion className="max-w-3xl">
          {product.faq.map((item) => (
            <AccordionItem key={item.question} value={item.question}>
              <AccordionTrigger className="text-left text-sm font-semibold">{item.question}</AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">{item.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ),
    },
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-6 pb-28 sm:px-6 md:py-8 lg:pb-8">
          <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/gaming" className="hover:text-foreground">Gaming</Link>
            <ChevronRight size={12} aria-hidden="true" />
            <Link href={`/gaming/products?platform=${product.platform}`} className="hover:text-foreground">
              {PLATFORM_LABEL[product.platform]}
            </Link>
            <ChevronRight size={12} aria-hidden="true" />
            <span className="truncate font-medium text-foreground">{product.title}</span>
          </nav>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12">
            <div className="lg:col-start-1 lg:row-start-1">
              <GamingGallery images={product.images} art={product.art} title={product.title} />
            </div>

            {/* ---- Purchase panel ---- */}
            <div className="flex flex-col gap-5 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-24">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded bg-secondary px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.06em] text-foreground">
                    {PLATFORM_LABEL[product.platform]}
                  </span>
                  <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">
                    {CATEGORY_LABEL[product.category]}
                  </span>
                  {badges.map((badge) => (
                    <span key={badge} className="rounded bg-primary px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-primary-foreground">
                      {badge}
                    </span>
                  ))}
                </div>
                <h1 className="mt-3 font-display text-2xl font-bold leading-tight tracking-tight text-balance md:text-3xl">
                  {product.title}
                </h1>
                <p className="mt-2 text-base leading-relaxed text-muted-foreground text-pretty">{product.shortDescription}</p>
                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <ShieldCheck size={13} className="text-success" aria-hidden="true" />
                  Official DistroSource Product
                </p>
              </div>

              <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-[var(--shadow-e1)]">
                <div className="border-b border-border px-5 py-4">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-3xl font-bold tabular-nums tracking-tight text-foreground">
                      {formatUsd(product.price)}
                    </span>
                    {discounted && (
                      <span className="text-sm text-muted-foreground line-through">{formatUsd(product.originalPrice!)}</span>
                    )}
                    <span className="font-mono text-xs font-medium uppercase text-muted-foreground">USD</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">One-time payment · lifetime access to updates</p>
                </div>

                <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 border-b border-border px-5 py-3.5 text-xs">
                  {facts.map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="text-muted-foreground">{k}</dt>
                      <dd className="min-w-0 truncate text-foreground">{v}</dd>
                    </div>
                  ))}
                </dl>

                <div className="flex flex-col gap-2.5 px-5 py-4">
                  <TebexBuyButton product={product} className="w-full" />
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full bg-transparent font-semibold"
                    nativeButton={false}
                    render={<Link href={`/gaming/products?platform=${product.platform}`} />}
                  >
                    Browse more {PLATFORM_LABEL[product.platform]}
                  </Button>
                </div>

                <ul className="flex flex-col gap-1.5 border-t border-border bg-secondary/30 px-5 py-3.5">
                  {[
                    { icon: Download, text: "Instant access after payment clears" },
                    { icon: RefreshCw, text: "Product updates included" },
                    { icon: Lock, text: "Secure checkout by Tebex" },
                  ].map(({ icon: Icon, text }) => (
                    <li key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Icon size={ICON_SIZE.sm} className="shrink-0 text-success" aria-hidden="true" />
                      {text}
                    </li>
                  ))}
                </ul>
              </div>

              {/* ---- Support: DistroSource is the only party involved ---- */}
              <div className="rounded-lg border border-border bg-card p-5">
                <div className="flex items-start gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-foreground">
                    <Support size={ICON_SIZE.base} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Need help?</p>
                    <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                      Get support for installation, compatibility or your purchase.
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  className="mt-3 w-full bg-transparent font-semibold"
                  nativeButton={false}
                  render={<Link href="/contact?topic=product" />}
                >
                  Contact DistroSource Support
                </Button>
              </div>
            </div>

            {/* ---- Detail sections ---- */}
            <div className="flex flex-col gap-10 lg:col-start-1 lg:row-start-2">
              {sections.map((section) => (
                <section key={section.id} id={section.id} className="scroll-mt-24">
                  <h2 className="mb-4 font-display text-xl font-bold tracking-tight text-foreground">{section.title}</h2>
                  {section.body}
                </section>
              ))}
            </div>
          </div>

          {related.length > 0 && (
            <section className="mt-16 border-t border-border pt-10">
              <h2 className="mb-6 font-display text-xl font-bold tracking-tight">More {PLATFORM_LABEL[product.platform]} products</h2>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                {related.map((item) => (
                  <GamingProductCard key={item.id} product={item} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ---- Mobile sticky buy bar ---- */}
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 shadow-[var(--shadow-e3)] backdrop-blur supports-[backdrop-filter]:bg-background/90 lg:hidden">
          <div className="mx-auto flex max-w-lg items-center gap-4">
            <div className="min-w-0">
              <p className="font-display text-lg font-bold leading-tight tabular-nums">{formatUsd(product.price)}</p>
              <p className="truncate text-[11px] text-muted-foreground">{PLATFORM_LABEL[product.platform]}</p>
            </div>
            <TebexBuyButton product={product} className="flex-1" />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

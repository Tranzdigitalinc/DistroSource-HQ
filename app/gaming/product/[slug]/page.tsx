import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import type { ReactNode } from "react"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { GamingCard } from "@/components/gaming/gaming-card"
import { GamingGallery } from "@/components/gaming/gaming-gallery"
import { GamingPurchasePanel } from "@/components/gaming/gaming-purchase-panel"
import { Button } from "@/components/ui/button"
import { getGamingProductBySlug, getGamingProductSlugs, getRelatedGamingProducts } from "@/lib/gaming/queries"
import { FRAMEWORK_LABEL, FRAMEWORK_ORDER, SUBSCRIPTION_MODELS, categoryLabel, platformLabel } from "@/lib/gaming/catalog/taxonomy"
import { formatGamingPrice, listPrice } from "@/lib/gaming/catalog/pricing"
import { Check, ChevronRight } from "@/lib/storefront-icons"

export function generateStaticParams() {
  return getGamingProductSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = getGamingProductBySlug(slug)
  if (!product) return {}
  const title = `${product.title} — ${platformLabel(product.platform)} | DistroSource Gaming`
  const cover = product.media.find((m) => m.kind === "image")
  return {
    title,
    description: product.summary,
    alternates: { canonical: `/gaming/product/${product.slug}` },
    openGraph: {
      title,
      description: product.summary,
      url: `/gaming/product/${product.slug}`,
      type: "website",
      images: cover && cover.kind === "image" ? [{ url: cover.src, width: cover.width, height: cover.height, alt: cover.alt }] : undefined,
    },
  }
}

function Section({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 border-t border-border pt-8">
      <h2 id={`${id}-title`} className="mb-4 font-display text-xl font-bold tracking-tight text-foreground">
        {title}
      </h2>
      {children}
    </section>
  )
}

function Bullets({ items, numbered = false }: { items: string[]; numbered?: boolean }) {
  if (numbered) {
    return (
      <ol className="flex max-w-3xl flex-col gap-3">
        {items.map((step, i) => (
          <li key={step} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary font-mono text-[11px] font-bold text-foreground">{i + 1}</span>
            <span className="pt-0.5">{step}</span>
          </li>
        ))}
      </ol>
    )
  }
  return (
    <ul className="flex max-w-3xl flex-col gap-2">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground">
          <span className="mt-2 size-1.5 shrink-0 rounded-full bg-foreground/40" aria-hidden="true" />
          {item}
        </li>
      ))}
    </ul>
  )
}

export default async function GamingProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = getGamingProductBySlug(slug)
  if (!product) notFound()

  const related = getRelatedGamingProducts(product, 3)
  const recurring = product.pricing.kind === "subscription"
  const frameworks = FRAMEWORK_ORDER.filter((f) => product.frameworks.includes(f))

  const facts: [string, string][] = [
    ["Platform", platformLabel(product.platform)],
    ["Category", categoryLabel(product.platform, product.category)],
    ...(recurring ? ([["Plan type", product.models.map((m) => SUBSCRIPTION_MODELS[m].label).join(" · ")]] as [string, string][]) : []),
    ...(frameworks.length ? ([["Frameworks", frameworks.map((f) => FRAMEWORK_LABEL[f]).join(", ")]] as [string, string][]) : []),
    ["Status", product.availability === "on-sale" ? "Available" : "Launching soon"],
  ]

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 pb-32 pt-6 sm:px-6 md:pt-8 lg:pb-16">
          <nav aria-label="Breadcrumb" className="mb-5 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            <Link href="/gaming" className="hover:text-foreground">
              Gaming
            </Link>
            <ChevronRight size={12} aria-hidden="true" />
            <Link href={`/gaming/products?platform=${product.platform}`} className="hover:text-foreground">
              {platformLabel(product.platform)}
            </Link>
            <ChevronRight size={12} aria-hidden="true" />
            <span className="truncate font-medium text-foreground">{product.title}</span>
          </nav>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)] lg:gap-12">
            <div className="flex flex-col gap-10">
              <GamingGallery media={product.media} title={product.title} />

              <div className="flex flex-col gap-10 max-lg:order-last">
                <Section id="overview" title="Overview">
                  <div className="flex max-w-3xl flex-col gap-4 text-[15px] leading-relaxed text-muted-foreground">
                    {product.description.map((p) => (
                      <p key={p.slice(0, 32)}>{p}</p>
                    ))}
                  </div>
                </Section>

                <Section id="what-you-get" title="What you get">
                  <ul className="grid max-w-3xl grid-cols-1 gap-2.5 sm:grid-cols-2">
                    {product.whatYouGet.map((item) => (
                      <li key={item} className="flex items-start gap-2.5 rounded-lg border border-border bg-card px-3.5 py-3 text-sm leading-snug text-foreground">
                        <Check size={16} className="mt-px shrink-0 text-success" aria-hidden="true" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </Section>

                {product.eligibleResourceTypes && product.eligibleResourceTypes.length > 0 && (
                  <Section id="eligible" title="Eligible resources">
                    <p className="mb-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
                      The plan covers these resource types. Individual resources are listed in your Gaming Library as they publish.
                    </p>
                    <ul className="flex max-w-3xl flex-wrap gap-2">
                      {product.eligibleResourceTypes.map((t) => (
                        <li key={t} className="rounded-md border border-border bg-secondary/60 px-2.5 py-1.5 text-xs font-medium text-foreground">
                          {t}
                        </li>
                      ))}
                    </ul>
                  </Section>
                )}

                <Section id="features" title="Features">
                  <dl className="grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
                    {product.features.map((f) => (
                      <div key={f.title} className="rounded-lg border border-border bg-card p-4">
                        <dt className="text-sm font-semibold text-foreground">{f.title}</dt>
                        <dd className="mt-1.5 text-[13px] leading-relaxed text-muted-foreground">{f.body}</dd>
                      </div>
                    ))}
                  </dl>
                </Section>

                <Section id="compatibility" title="Compatibility and requirements">
                  <div className="grid max-w-3xl grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-foreground">Works with</h3>
                      <Bullets items={product.compatibility} />
                    </div>
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-foreground">You need</h3>
                      <Bullets items={product.requirements} />
                    </div>
                  </div>
                </Section>

                {product.cadence && (
                  <Section id="cadence" title="Updates and content cadence">
                    <Bullets items={product.cadence} />
                  </Section>
                )}

                <Section id="license" title="License">
                  <Bullets items={product.license} />
                </Section>

                <Section id="installation" title="Installation">
                  <Bullets items={product.installation} numbered />
                </Section>

                {product.afterCancel && (
                  <Section id="after-cancellation" title="If you cancel">
                    <Bullets items={product.afterCancel} />
                  </Section>
                )}
              </div>
            </div>

            <aside id="purchase" className="flex scroll-mt-24 flex-col gap-5 lg:sticky lg:top-24">
              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                  {platformLabel(product.platform)}
                  <span className="px-1.5 text-muted-foreground" aria-hidden="true">·</span>
                  {recurring ? "Subscription" : categoryLabel(product.platform, product.category)}
                </p>
                <h1 className="mt-2 font-display text-3xl font-bold leading-tight tracking-tight text-balance md:text-4xl">{product.title}</h1>
                <p className="mt-2.5 text-base leading-relaxed text-muted-foreground text-pretty">{product.summary}</p>
                <ul className="mt-4 flex flex-wrap gap-1.5" aria-label="Compatibility and tags">
                  {frameworks.map((f) => (
                    <li key={f} className="rounded-md bg-foreground px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-background">
                      {FRAMEWORK_LABEL[f]}
                    </li>
                  ))}
                  {product.models.map((m) => (
                    <li key={m} className="rounded-md border border-border px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.06em] text-foreground">
                      {SUBSCRIPTION_MODELS[m].badge}
                    </li>
                  ))}
                </ul>
              </div>

              <GamingPurchasePanel pricing={product.pricing} availability={product.availability} cadence={product.cadence?.[0]} afterCancel={product.afterCancel?.[0]} />

              <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 rounded-xl border border-border bg-card px-5 py-4 text-sm">
                {facts.map(([k, v]) => (
                  <div key={k} className="contents">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="text-right font-medium text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
            </aside>
          </div>

          {related.length > 0 && (
            <section aria-labelledby="related-title" className="mt-16 border-t border-border pt-10">
              <div className="mb-6 flex items-end justify-between gap-4">
                <h2 id="related-title" className="font-display text-2xl font-bold tracking-tight">
                  More from DistroSource Gaming
                </h2>
                <Link href="/gaming/products" className="text-sm font-semibold text-primary hover:underline">
                  Browse all
                </Link>
              </div>
              <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <li key={item.id} className="flex">
                    <GamingCard product={item} className="w-full" />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 shadow-[0_-12px_30px_-20px_oklch(0.2_0.03_258/0.5)] backdrop-blur lg:hidden">
          <div className="mx-auto flex max-w-lg items-center gap-4">
            <div className="min-w-0">
              <p className="font-display text-lg font-bold leading-tight tabular-nums">
                {formatGamingPrice(listPrice(product.pricing))}
                {recurring && <span className="text-xs font-semibold text-muted-foreground">/mo</span>}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">{product.availability === "on-sale" ? product.title : "Launching soon"}</p>
            </div>
            <Button render={<a href="#purchase" />} nativeButton={false} size="lg" className="flex-1 font-semibold">
              {recurring ? "View plans" : "View price"}
            </Button>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

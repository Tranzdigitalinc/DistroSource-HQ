import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { Star, ChevronRight, Download, ShieldCheck, RefreshCw, ImageOff } from "lucide-react"
import { getProductBySlug, getRecommendedProducts } from "@/lib/queries/catalog"
import { getWishlistProductIds } from "@/lib/actions/wishlist"
import { stripLiteMarkdown } from "@/lib/html-to-text"
import { PurchasePanel } from "@/components/product/purchase-panel"
import { LiteMarkdown } from "@/components/product/lite-markdown"
import { ReviewList } from "@/components/product/review-list"
import { ProductGrid } from "@/components/catalog/product-grid"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { Reveal } from "@/components/motion/reveal"
import { ShareProductButton } from "@/components/product/share-product-button"
import { CompareButton } from "@/components/product/compare-button"
import { RecentlyViewedTracker } from "@/components/product/recently-viewed-tracker"
import { formatDate } from "@/lib/format"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = await getProductBySlug(slug)
  if (!data) return {}
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://distrosource.com"
  const canonical = `${siteUrl}/products/${data.product.slug}`
  const description = data.product.seoDescription ?? data.product.tagline ?? undefined
  const image = data.product.coverImageUrl ?? data.product.thumbnailUrl ?? undefined
  return {
    title: data.product.seoTitle ?? `${data.product.name} — DistroSource`,
    description,
    alternates: { canonical },
    openGraph: {
      title: data.product.name,
      description,
      url: canonical,
      type: "website",
      images: image ? [{ url: image, alt: data.product.name }] : undefined,
    },
    twitter: { card: "summary_large_image", title: data.product.name, description, images: image ? [image] : undefined },
  }
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const data = await getProductBySlug(slug)
  if (!data) notFound()

  const { product, category, images, licenses, reviews, versions, avgRating, reviewCount } = data
  const related = await getRecommendedProducts(category.id, product.id, 8)
  const wishlistIds = await getWishlistProductIds()

  const gallery = images.length > 0 ? images.map((i) => i.url) : [product.coverImageUrl, product.thumbnailUrl].filter(Boolean) as string[]
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://distrosource.com"
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: stripLiteMarkdown(product.description),
    image: gallery.length ? gallery : undefined,
    aggregateRating: reviewCount > 0 ? { "@type": "AggregateRating", ratingValue: avgRating, reviewCount } : undefined,
    offers: licenses.map((license) => ({
      "@type": "Offer",
      priceCurrency: "USD",
      price: license.price,
      availability: "https://schema.org/InStock",
      url: `${siteUrl}/products/${product.slug}`,
    })),
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <RecentlyViewedTracker productId={product.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
          <nav
            className="mb-6 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.04em] text-muted-foreground"
            aria-label="Breadcrumb"
          >
            <Link href="/" className="transition-colors hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <Link href={`/categories/${category.slug}`} className="transition-colors hover:text-foreground">
              {category.name}
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <span className="truncate font-medium text-foreground">{product.name}</span>
          </nav>

          <Reveal className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-10">
            <div className="flex flex-col gap-4">
              <div className="group relative aspect-[4/3] w-full overflow-hidden border border-border bg-secondary">
                {gallery[0] ? (
                  <Image
                    src={gallery[0] || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    priority
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground/40">
                    <ImageOff className="size-10" />
                  </div>
                )}
                {product.isNewRelease && (
                  <Badge className="absolute left-0 top-0 rounded-none border-none bg-navy font-mono text-[10px] font-semibold uppercase tracking-[0.04em] text-navy-foreground">
                    New
                  </Badge>
                )}
              </div>
              {gallery.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {gallery.slice(1, 5).map((src) => (
                    <div key={src} className="relative aspect-[4/3] overflow-hidden border border-border bg-secondary">
                      <Image src={src || "/placeholder.svg"} alt="" fill className="object-cover" sizes="20vw" />
                    </div>
                  ))}
                </div>
              )}

              {reviewCount > 0 && (
                <div className="flex flex-wrap items-center gap-3 border-y border-border py-3 text-sm">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.round(avgRating ?? 0) ? "fill-primary text-primary" : "fill-none text-border"}`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <span className="font-mono font-bold">{avgRating?.toFixed(1)}</span>
                  <span className="text-muted-foreground">({reviewCount.toLocaleString()} reviews)</span>
                </div>
              )}

              <div className="grid grid-cols-3 divide-x divide-border border border-border">
                <div className="flex flex-col items-start gap-1.5 px-3 py-3">
                  <Download className="size-4 shrink-0 text-primary" />
                  <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.02em] text-muted-foreground">
                    Instant download
                  </span>
                </div>
                <div className="flex flex-col items-start gap-1.5 px-3 py-3">
                  <ShieldCheck className="size-4 shrink-0 text-primary" />
                  <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.02em] text-muted-foreground">
                    Secure checkout
                  </span>
                </div>
                <div className="flex flex-col items-start gap-1.5 px-3 py-3">
                  <RefreshCw className="size-4 shrink-0 text-primary" />
                  <span className="font-mono text-[10.5px] font-semibold uppercase tracking-[0.02em] text-muted-foreground">
                    v{product.currentVersion}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <span className="font-mono text-xs font-semibold uppercase tracking-[0.08em] text-primary">
                  {category.name}
                </span>
                <h1 className="mt-2 font-display text-2xl font-bold text-balance md:text-3xl">{product.name}</h1>
                {product.tagline && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{product.tagline}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-2">
                  <ShareProductButton name={product.name} />
                  <CompareButton productId={product.id} />
                </div>
              </div>
              <PurchasePanel
                productId={product.id}
                licenses={licenses}
                initialWishlisted={wishlistIds.includes(product.id)}
              />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <Tabs defaultValue="details" className="mt-12">
              <TabsList
                variant="line"
                className="border-b border-border font-mono text-xs font-semibold uppercase tracking-[0.04em]"
              >
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="updates">Updates ({versions.length})</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({reviewCount})</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="py-6">
                <div className="max-w-2xl space-y-6">
                  <LiteMarkdown text={product.description} className="flex flex-col gap-3" />
                  <dl className="divide-y divide-border border border-border">
                    {product.fileFormats.length > 0 && (
                      <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-4">
                        <dt className="w-36 shrink-0 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                          File formats
                        </dt>
                        <dd className="text-sm text-foreground">{product.fileFormats.join(", ")}</dd>
                      </div>
                    )}
                    {product.softwareCompatibility.length > 0 && (
                      <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-4">
                        <dt className="w-36 shrink-0 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                          Compatible with
                        </dt>
                        <dd className="text-sm text-foreground">{product.softwareCompatibility.join(", ")}</dd>
                      </div>
                    )}
                    {product.fileSizeMb && (
                      <div className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-4">
                        <dt className="w-36 shrink-0 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                          File size
                        </dt>
                        <dd className="font-mono text-sm text-foreground">{product.fileSizeMb} MB</dd>
                      </div>
                    )}
                    {product.includedFiles.length > 0 && (
                      <div className="flex flex-col gap-1.5 px-4 py-3 sm:flex-row sm:gap-4">
                        <dt className="w-36 shrink-0 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">
                          Included
                        </dt>
                        <dd className="text-sm text-foreground">
                          <ul className="space-y-1">
                            {product.includedFiles.map((file) => (
                              <li key={file} className="flex items-baseline gap-2">
                                <span className="text-primary">—</span>
                                {file}
                              </li>
                            ))}
                          </ul>
                        </dd>
                      </div>
                    )}
                  </dl>
                  {product.documentation && (
                    <p className="text-sm leading-relaxed text-muted-foreground">{product.documentation}</p>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="updates" className="py-6">
                <div className="max-w-2xl">
                  {versions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No version history yet — this is the initial release.</p>
                  ) : (
                    <ul className="flex flex-col divide-y divide-border border border-border">
                      {versions.map((v) => (
                        <li key={v.id} className="flex flex-col gap-1 px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm font-bold text-foreground">v{v.version}</span>
                            <span className="font-mono text-xs text-muted-foreground">{formatDate(v.releasedAt)}</span>
                          </div>
                          {v.changelog && <p className="text-sm text-muted-foreground">{v.changelog}</p>}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </TabsContent>
              <TabsContent value="reviews" className="py-6">
                <div className="max-w-2xl">
                  <ReviewList reviews={reviews} />
                </div>
              </TabsContent>
            </Tabs>
          </Reveal>

          {related.length > 0 && (
            <Reveal className="mt-16 border-t border-border pt-10">
              <p className="font-mono text-xs font-semibold uppercase tracking-[0.18em] text-primary">Related</p>
              <h2 className="mt-2 mb-6 font-display text-xl font-bold">Recommended for you</h2>
              <ProductGrid items={related} />
            </Reveal>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

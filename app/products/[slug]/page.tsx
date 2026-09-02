import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { Star, ChevronRight, Download, ShieldCheck, RefreshCw, ImageOff } from "lucide-react"
import { getProductBySlug, getRecommendedProducts } from "@/lib/queries/catalog"
import { getWishlistProductIds } from "@/lib/actions/wishlist"
import { PurchasePanel } from "@/components/product/purchase-panel"
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
    description: product.description,
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
          <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
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
              <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border bg-secondary">
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
                  <Badge className="absolute left-3 top-3 border-none bg-primary font-semibold text-primary-foreground">
                    New
                  </Badge>
                )}
              </div>
              {gallery.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {gallery.slice(1, 5).map((src) => (
                    <div key={src} className="relative aspect-[4/3] overflow-hidden rounded-lg border border-border/60 bg-secondary">
                      <Image src={src || "/placeholder.svg"} alt="" fill className="object-cover" sizes="20vw" />
                    </div>
                  ))}
                </div>
              )}

              {reviewCount > 0 && (
                <div className="flex flex-wrap items-center gap-3 text-sm">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-4 w-4 ${i < Math.round(avgRating ?? 0) ? "fill-primary text-primary" : "fill-none text-border"}`}
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <span className="font-display font-semibold">{avgRating?.toFixed(1)}</span>
                  <span className="text-muted-foreground">({reviewCount.toLocaleString()} reviews)</span>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5">
                  <Download className="size-4 shrink-0 text-accent" />
                  <span className="text-xs font-medium text-muted-foreground">Instant download</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5">
                  <ShieldCheck className="size-4 shrink-0 text-accent" />
                  <span className="text-xs font-medium text-muted-foreground">Secure checkout</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5">
                  <RefreshCw className="size-4 shrink-0 text-accent" />
                  <span className="text-xs font-medium text-muted-foreground">v{product.currentVersion}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wide text-primary">{category.name}</span>
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
              <TabsList variant="line" className="border-b border-border">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="updates">Updates ({versions.length})</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({reviewCount})</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="py-6">
                <div className="max-w-2xl space-y-4 text-sm leading-relaxed text-muted-foreground">
                  <p>{product.description}</p>
                  {product.fileFormats.length > 0 && (
                    <p>
                      <span className="font-semibold text-foreground">File formats:</span> {product.fileFormats.join(", ")}
                    </p>
                  )}
                  {product.softwareCompatibility.length > 0 && (
                    <p>
                      <span className="font-semibold text-foreground">Compatible with:</span>{" "}
                      {product.softwareCompatibility.join(", ")}
                    </p>
                  )}
                  {product.fileSizeMb && (
                    <p>
                      <span className="font-semibold text-foreground">File size:</span> {product.fileSizeMb} MB
                    </p>
                  )}
                  {product.includedFiles.length > 0 && (
                    <div>
                      <p className="font-semibold text-foreground">What&apos;s included:</p>
                      <ul className="mt-1 list-disc pl-5">
                        {product.includedFiles.map((file) => (
                          <li key={file}>{file}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {product.documentation && <p>{product.documentation}</p>}
                </div>
              </TabsContent>
              <TabsContent value="updates" className="py-6">
                <div className="max-w-2xl">
                  {versions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No version history yet — this is the initial release.</p>
                  ) : (
                    <ul className="flex flex-col gap-4">
                      {versions.map((v) => (
                        <li key={v.id} className="border-b border-border pb-4 last:border-0 last:pb-0">
                          <div className="flex items-center gap-2">
                            <span className="font-display text-sm font-semibold">v{v.version}</span>
                            <span className="text-xs text-muted-foreground">{formatDate(v.releasedAt)}</span>
                          </div>
                          {v.changelog && <p className="mt-1 text-sm text-muted-foreground">{v.changelog}</p>}
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
              <h2 className="mb-6 font-display text-xl font-bold">Recommended for you</h2>
              <ProductGrid items={related} />
            </Reveal>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

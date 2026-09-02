import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { Star, ChevronRight, Zap, ShieldCheck, Truck as TruckIcon } from "lucide-react"
import { getProductBySlug, getRecommendedProducts } from "@/lib/queries/catalog"
import { getWishlistProductIds } from "@/lib/actions/wishlist"
import { PurchasePanel } from "@/components/product/purchase-panel"
import { ReviewList } from "@/components/product/review-list"
import { ProductGrid } from "@/components/catalog/product-grid"
import { BrandThumbnail } from "@/components/product/brand-thumbnail"
import { FlagIcon } from "@/components/flag-icon"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { Reveal } from "@/components/motion/reveal"
import { ShareProductButton } from "@/components/product/share-product-button"
import { CompareButton } from "@/components/product/compare-button"
import { RecentlyViewedTracker } from "@/components/product/recently-viewed-tracker"
import { getRecentBrowsingSignal } from "@/lib/actions/recently-viewed"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = await getProductBySlug(slug)
  if (!data) return {}
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://redeemcove.com"
  const canonical = `${siteUrl}/products/${data.product.slug}`
  return {
    title: `${data.product.name} — RedeemCove`,
    description: data.product.shortDescription ?? undefined,
    alternates: { canonical },
    openGraph: {
      title: `${data.product.name} — RedeemCove`,
      description: data.product.shortDescription ?? undefined,
      url: canonical,
      type: "website",
      images: data.product.imageUrl ? [{ url: data.product.imageUrl, alt: data.product.name }] : undefined,
    },
    twitter: { card: "summary_large_image", title: data.product.name, description: data.product.shortDescription ?? undefined, images: data.product.imageUrl ? [data.product.imageUrl] : undefined },
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

  const { product, brand, category, country, variants, reviews } = data
  const browsingSignal = await getRecentBrowsingSignal()
  const related = await getRecommendedProducts(category.id, brand.id, product.id, 8, browsingSignal)
  const wishlistIds = await getWishlistProductIds()

  const avgRating = Number.parseFloat(product.rating)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://redeemcove.com"
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? product.shortDescription ?? undefined,
    image: product.imageUrl ? [product.imageUrl] : undefined,
    brand: { "@type": "Brand", name: brand.name },
    aggregateRating: product.reviewCount > 0 ? { "@type": "AggregateRating", ratingValue: avgRating, reviewCount: product.reviewCount } : undefined,
    offers: variants.map((variant) => ({ "@type": "Offer", priceCurrency: "USD", price: variant.priceUsd, availability: variant.stockCount > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock", url: `${siteUrl}/products/${product.slug}` })),
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
              <div className="group relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-border">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    priority
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                ) : (
                  <BrandThumbnail
                    logoUrl={brand.logoUrl}
                    brandColor={brand.brandColor ?? null}
                    brandName={brand.name}
                    logoClassName="shadow-xl"
                  />
                )}
                {product.isDeal && (
                  <Badge className="absolute left-3 top-3 border-none bg-accent font-semibold text-accent-foreground">
                    Deal
                  </Badge>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(avgRating)
                          ? "fill-primary text-primary"
                          : "fill-none text-border"
                      }`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <span className="font-display font-semibold">{product.rating}</span>
                <span className="text-muted-foreground">({product.reviewCount.toLocaleString()} reviews)</span>
                <span className="text-border" aria-hidden>|</span>
                <span className="text-muted-foreground">{product.salesCount.toLocaleString()} sold</span>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5">
                  <Zap className="size-4 shrink-0 text-accent" />
                  <span className="text-xs font-medium text-muted-foreground">Instant delivery</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5">
                  <ShieldCheck className="size-4 shrink-0 text-accent" />
                  <span className="text-xs font-medium text-muted-foreground">Verified code</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5">
                  <TruckIcon className="size-4 shrink-0 text-accent" />
                  <span className="text-xs font-medium text-muted-foreground">Email delivery</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <div>
                <div className="mb-2 flex items-center gap-2">
                  <Link
                    href={`/brands/${brand.slug}`}
                    className="text-xs font-semibold uppercase tracking-wide text-primary hover:underline"
                  >
                    {brand.name}
                  </Link>
                  {country && (
                    <>
                      <span className="text-border" aria-hidden="true">|</span>
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <FlagIcon code={country.code} />
                        {country.name}
                      </span>
                    </>
                  )}
                </div>
                <h1 className="font-display text-2xl font-bold text-balance md:text-3xl">{product.name}</h1>
                {product.shortDescription && (
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{product.shortDescription}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-2"><ShareProductButton name={product.name} /><CompareButton productId={product.id} /></div>
              </div>
              <PurchasePanel
                productId={product.id}
                initialWishlisted={wishlistIds.includes(product.id)}
                variants={variants.map((v) => ({
                  id: v.id,
                  denominationLabel: v.denominationLabel,
                  faceValueUsd: v.faceValueUsd,
                  priceUsd: v.priceUsd,
                  discountPercent: v.discountPercent,
                  stockCount: v.stockCount,
                }))}
              />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <Tabs defaultValue="details" className="mt-12">
              <TabsList variant="line" className="border-b border-border">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="redeem">How to redeem</TabsTrigger>
                <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
              </TabsList>
              <TabsContent value="details" className="py-6">
                <div className="max-w-2xl text-sm leading-relaxed text-muted-foreground">
                  <p>{product.description ?? product.shortDescription}</p>
                </div>
              </TabsContent>
              <TabsContent value="redeem" className="py-6">
                <div className="max-w-2xl text-sm leading-relaxed whitespace-pre-line text-muted-foreground">
                  {product.howItWorks ?? "Redemption instructions will be included with your order confirmation."}
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

import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { ChevronRight, FileText, ShieldCheck, Star } from "@/lib/storefront-icons"
import { getProductBySlug, getRecommendedProducts } from "@/lib/queries/catalog"
import { getWishlistProductIds } from "@/lib/actions/wishlist"
import { getReviewEligibility } from "@/lib/actions/reviews"
import { stripLiteMarkdown } from "@/lib/html-to-text"
import { PurchasePanel } from "@/components/product/purchase-panel"
import { ProductGallery } from "@/components/product/product-gallery"
import { ProductSections } from "@/components/product/product-sections"
import { parseSections, type ProductSection } from "@/components/product/product-sections.shared"
import { ReviewList } from "@/components/product/review-list"
import { ReviewForm } from "@/components/product/review-form"
import { ProductGrid } from "@/components/catalog/product-grid"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"
import { Reveal } from "@/components/motion/reveal"
import { ShareProductButton } from "@/components/product/share-product-button"
import { CompareButton } from "@/components/product/compare-button"
import { RecentlyViewedTracker } from "@/components/product/recently-viewed-tracker"
import { formatDate, getSourceTypeLabel } from "@/lib/format"

function resolveProductImageUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? `/api/external-image?url=${encodeURIComponent(url)}` : url
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const data = await getProductBySlug(slug)
  if (!data) return {}
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://distrosource.com"
  const canonical = `${siteUrl}/products/${data.product.slug}`
  const description = data.product.seoDescription ?? data.product.tagline ?? undefined
  const image = data.product.coverImageUrl ?? data.product.thumbnailUrl
  const resolvedImage = image ? resolveProductImageUrl(image) : undefined
  return {
    title: data.product.seoTitle ?? `${data.product.name} — DistroSource`,
    description,
    alternates: { canonical },
    openGraph: {
      title: data.product.name,
      description,
      url: canonical,
      type: "website",
      images: resolvedImage ? [{ url: resolvedImage, alt: data.product.name }] : undefined,
    },
    twitter: { card: "summary_large_image", title: data.product.name, description, images: resolvedImage ? [resolvedImage] : undefined },
  }
}

const APPROVED_RIGHTS = ["original", "licensed_for_distribution", "supplier_verified"]

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const data = await getProductBySlug(slug)
  if (!data) notFound()

  const { product, category, images, licenses, reviews, versions, avgRating, reviewCount } = data
  const [related, wishlistIds, reviewEligibility] = await Promise.all([
    getRecommendedProducts(category.id, product.id, 8),
    getWishlistProductIds(),
    getReviewEligibility(product.id),
  ])

  const rawGallery = Array.from(
    new Set([product.coverImageUrl, ...images.map((image) => image.url), product.thumbnailUrl].filter((url): url is string => Boolean(url))),
  )
  const gallery = rawGallery.map(resolveProductImageUrl)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://distrosource.com"
  const isOriginal = product.sourceType === "distrosource_original" && product.rightsStatus === "original"
  const rating = avgRating ?? 0

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: stripLiteMarkdown(product.description),
    image: gallery.length ? gallery : undefined,
    aggregateRating: reviewCount > 0 ? { "@type": "AggregateRating", ratingValue: rating, reviewCount } : undefined,
    offers: licenses.map((license) => ({
      "@type": "Offer",
      priceCurrency: "USD",
      price: license.price,
      availability: "https://schema.org/InStock",
      url: `${siteUrl}/products/${product.slug}`,
    })),
  }

  const sections: ProductSection[] = parseSections(product.description)
  const fileDetails = [
    product.fileFormats.length ? ["File formats", product.fileFormats.join(", ")] : null,
    product.softwareCompatibility.length ? ["Compatible with", product.softwareCompatibility.join(", ")] : null,
    product.fileSizeMb ? ["File size", `${product.fileSizeMb} MB`] : null,
    ["Version", `v${product.currentVersion}`],
    ["Last updated", formatDate(product.updatedAt)],
  ].filter((row): row is [string, string] => Boolean(row))

  sections.push({
    id: "file-details",
    title: "File details",
    body: (
      <div className="max-w-4xl">
        <dl className="grid overflow-hidden rounded-[26px] border border-border bg-border sm:grid-cols-2">
          {fileDetails.map(([label, value]) => (
            <div key={label} className="bg-card px-5 py-5 sm:px-6">
              <dt className="font-mono text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground">{label}</dt>
              <dd className="mt-2 text-sm font-semibold text-foreground">{value}</dd>
            </div>
          ))}
          {product.includedFiles.length > 0 && (
            <div className="bg-card px-5 py-5 sm:col-span-2 sm:px-6">
              <dt className="font-mono text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground">What&apos;s included</dt>
              <dd className="mt-3">
                <ul className="grid gap-2 sm:grid-cols-2">
                  {product.includedFiles.map((file) => (
                    <li key={file} className="flex items-start gap-2 text-sm text-foreground">
                      <FileText size={14} className="mt-0.5 shrink-0 text-primary" />
                      {file}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>
        {product.documentation && <p className="mt-5 text-sm leading-7 text-muted-foreground">{product.documentation}</p>}
      </div>
    ),
  })

  if (versions.length > 0) {
    sections.push({
      id: "changelog",
      title: `Changelog (${versions.length})`,
      body: (
        <ul className="max-w-4xl divide-y divide-border border-y border-border">
          {versions.map((version) => (
            <li key={version.id} className="grid gap-2 py-5 sm:grid-cols-[120px_1fr] sm:gap-5">
              <div>
                <span className="font-display text-lg font-black">v{version.version}</span>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">{formatDate(version.releasedAt)}</p>
              </div>
              {version.changelog && <p className="text-sm leading-7 text-muted-foreground">{version.changelog}</p>}
            </li>
          ))}
        </ul>
      ),
    })
  }

  if (reviewCount > 0 || reviewEligibility.canReview) {
    sections.push({
      id: "reviews",
      title: `Reviews${reviewCount ? ` (${reviewCount})` : ""}`,
      body: (
        <div className="flex max-w-4xl flex-col gap-8">
          <ReviewForm productId={product.id} eligibility={reviewEligibility} />
          <ReviewList reviews={reviews} />
        </div>
      ),
    })
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <RecentlyViewedTracker productId={product.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />

      <main className="flex-1">
        <section className="border-b border-border">
          <div className="mx-auto max-w-[1540px] px-4 pb-12 pt-5 sm:px-6 sm:pb-16 lg:px-8 lg:pb-20">
            <nav className="mb-7 flex min-w-0 items-center gap-1.5 overflow-hidden text-[11px] text-muted-foreground" aria-label="Breadcrumb">
              <Link href="/" className="shrink-0 hover:text-foreground">Home</Link>
              <ChevronRight size={11} />
              <Link href={`/categories/${category.slug}`} className="shrink-0 hover:text-foreground">{category.name}</Link>
              <ChevronRight size={11} />
              <span className="truncate text-foreground">{product.name}</span>
            </nav>

            <Reveal className="grid items-start gap-8 lg:grid-cols-[minmax(0,1.38fr)_minmax(360px,0.62fr)] lg:gap-12 xl:gap-16">
              <div className="min-w-0">
                <ProductGallery images={gallery} alt={product.name} />
              </div>

              <aside className="lg:sticky lg:top-24">
                <div className="mb-6">
                  <div className="flex flex-wrap items-center gap-2 font-mono text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground">
                    <Link href={`/categories/${category.slug}`} className="text-primary hover:underline">{category.name}</Link>
                    <span>/</span>
                    <span>{getSourceTypeLabel(product.sourceType)}</span>
                    {isOriginal && <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-success"><ShieldCheck size={11} /> Original</span>}
                  </div>

                  <h1 className="mt-4 font-display text-[clamp(2.6rem,5.2vw,5.7rem)] font-black leading-[0.88] tracking-[-0.07em] text-foreground lg:text-[clamp(3rem,4.2vw,5rem)]">
                    {product.name}
                  </h1>
                  {product.tagline && <p className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">{product.tagline}</p>}

                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    {reviewCount > 0 && (
                      <a href="#section-reviews" className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs hover:bg-secondary">
                        <span className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, index) => (
                            <Star key={index} size={12} className={index < Math.round(rating) ? "fill-primary text-primary" : "text-border"} />
                          ))}
                        </span>
                        <strong>{rating.toFixed(1)}</strong>
                        <span className="text-muted-foreground">{reviewCount}</span>
                      </a>
                    )}
                    <ShareProductButton name={product.name} />
                    <CompareButton productId={product.id} />
                  </div>
                </div>

                <PurchasePanel
                  productId={product.id}
                  licenses={licenses}
                  initialWishlisted={wishlistIds.includes(product.id)}
                  isPreviewOnly={product.assetStatus !== "ready" || !APPROVED_RIGHTS.includes(product.rightsStatus)}
                  meta={{
                    formats: product.fileFormats,
                    software: product.softwareCompatibility,
                    version: product.currentVersion,
                    updatedAt: formatDate(product.updatedAt),
                    hasDocumentation: Boolean(product.documentation),
                  }}
                />
              </aside>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto max-w-[1320px] px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
          <ProductSections sections={sections} />
        </section>

        {related.length > 0 && (
          <Reveal className="border-t border-border bg-secondary/25 py-16 sm:py-20 lg:py-24">
            <div className="mx-auto max-w-[1540px] px-4 sm:px-6 lg:px-8">
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-mono text-[10px] font-black uppercase tracking-[0.16em] text-primary">Keep exploring</p>
                  <h2 className="mt-3 font-display text-[clamp(2.2rem,4vw,4.4rem)] font-black leading-[0.94] tracking-[-0.055em]">More in {category.name}.</h2>
                </div>
                <Link href={`/categories/${category.slug}`} className="text-sm font-semibold hover:underline">View department</Link>
              </div>
              <ProductGrid items={related} />
            </div>
          </Reveal>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}

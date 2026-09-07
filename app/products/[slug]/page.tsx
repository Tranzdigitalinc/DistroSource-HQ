import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { ChevronRight, FileText, ShieldCheck, Star } from "@/lib/storefront-icons"
import { PageHeader, SectionLink } from "@/components/page-header"
import { getProductBySlug, getRecommendedProducts } from "@/lib/queries/catalog"
import { getWishlistProductIds } from "@/lib/actions/wishlist"
import { getReviewEligibility } from "@/lib/actions/reviews"
import { stripLiteMarkdown } from "@/lib/html-to-text"
import { PurchasePanel } from "@/components/product/purchase-panel"
import { ProductGallery } from "@/components/product/product-gallery"
import { ProductSections } from "@/components/product/product-sections"
// parseSections is pure and must come from the server-safe module: the page
// is a Server Component and cannot invoke a function exported by a
// "use client" file.
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
    getRecommendedProducts(category.id, product.id, 4),
    getWishlistProductIds(),
    getReviewEligibility(product.id),
  ])

  const rawGallery = Array.from(
    new Set([product.coverImageUrl, ...images.map((i) => i.url), product.thumbnailUrl].filter((u): u is string => Boolean(u))),
  )
  const gallery = rawGallery.map(resolveProductImageUrl)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://distrosource.com"
  const isOriginal = product.sourceType === "distrosource_original" && product.rightsStatus === "original"

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

  // ---- Build the anchored section list ------------------------------------
  // Description sections come from the stored markdown; data-driven sections
  // (file details, updates, reviews) are appended so one nav covers all.
  const sections: ProductSection[] = parseSections(product.description)

  const fileDetails = [
    product.fileFormats.length ? ["File formats", product.fileFormats.join(", ")] : null,
    product.softwareCompatibility.length ? ["Compatible with", product.softwareCompatibility.join(", ")] : null,
    product.fileSizeMb ? ["File size", `${product.fileSizeMb} MB`] : null,
    ["Version", `v${product.currentVersion}`],
    ["Last updated", formatDate(product.updatedAt)],
  ].filter((r): r is [string, string] => Boolean(r))

  sections.push({
    id: "file-details",
    title: "File details",
    body: (
      <div className="max-w-3xl">
        <dl className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          {fileDetails.map(([k, v]) => (
            <div key={k} className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-baseline sm:gap-4">
              <dt className="w-36 shrink-0 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">{k}</dt>
              <dd className="text-sm text-foreground">{v}</dd>
            </div>
          ))}
          {product.includedFiles.length > 0 && (
            <div className="flex flex-col gap-1.5 px-4 py-3 sm:flex-row sm:gap-4">
              <dt className="w-36 shrink-0 font-mono text-[11px] font-semibold uppercase tracking-[0.04em] text-muted-foreground">What&apos;s included</dt>
              <dd className="text-sm text-foreground">
                <ul className="space-y-1">
                  {product.includedFiles.map((f) => (
                    <li key={f} className="flex items-baseline gap-2">
                      <FileText size={12} className="shrink-0 translate-y-0.5 text-muted-foreground" aria-hidden="true" />
                      {f}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </dl>
        {product.documentation && <p className="mt-4 text-sm leading-relaxed text-muted-foreground">{product.documentation}</p>}
      </div>
    ),
  })

  // Empty sections are not rendered: a "Changelog" with nothing in it or a
  // "Reviews" heading over zero reviews reads as a gap, not information.
  if (versions.length > 0) {
    sections.push({
      id: "changelog",
      title: `Changelog (${versions.length})`,
      body: (
        <ul className="max-w-3xl divide-y divide-border overflow-hidden rounded-xl border border-border">
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
      ),
    })
  }

  if (reviewCount > 0 || reviewEligibility.canReview) {
    sections.push({
      id: "reviews",
      title: `Reviews${reviewCount ? ` (${reviewCount})` : ""}`,
      body: (
        <div className="flex max-w-3xl flex-col gap-8">
          <ReviewForm productId={product.id} eligibility={reviewEligibility} />
          <ReviewList reviews={reviews} />
        </div>
      ),
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <RecentlyViewedTracker productId={product.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />

      <main className="flex-1">
        <div className="container-x py-6 sm:py-8">
          <nav className="mb-6 flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
            <ChevronRight size={12} aria-hidden="true" />
            <Link href={`/categories/${category.slug}`} className="transition-colors hover:text-foreground">{category.name}</Link>
            <ChevronRight size={12} aria-hidden="true" />
            <span className="truncate normal-case tracking-normal text-foreground">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12">
            {/* ---- Left: gallery ---- */}
            <div className="flex flex-col gap-4 lg:col-start-1 lg:row-start-1">
              <ProductGallery images={gallery} alt={product.name} />
            </div>

            {/* ---- Right: title + sticky purchase panel ---- */}
            <div className="flex flex-col gap-5 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-24">
              <div>
                <p className="eyebrow">
                  <Link href={`/categories/${category.slug}`} className="hover:text-foreground">{category.name}</Link>
                </p>
                <h1 className="text-title mt-3 text-3xl sm:text-4xl">{product.name}</h1>
                {product.tagline && <p className="mt-3 text-pretty text-base leading-relaxed text-muted-foreground">{product.tagline}</p>}

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    {isOriginal && <ShieldCheck size={13} className="text-success" aria-hidden="true" />}
                    By <span className="font-medium text-foreground">{getSourceTypeLabel(product.sourceType)}</span>
                  </span>
                  {reviewCount > 0 && (
                    <a href="#section-reviews" className="flex items-center gap-1.5 underline-offset-4 hover:underline">
                      <span className="flex items-center gap-0.5" aria-label={`${avgRating?.toFixed(1)} out of 5 stars`}>
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} size={13} className={i < Math.round(avgRating ?? 0) ? "fill-primary text-primary" : "text-border"} aria-hidden="true" />
                        ))}
                      </span>
                      <span className="font-semibold text-foreground">{avgRating?.toFixed(1)}</span>
                      <span>({reviewCount})</span>
                    </a>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <ShareProductButton name={product.name} />
                  <CompareButton productId={product.id} />
                </div>
              </div>

              <PurchasePanel
                productId={product.id}
                licenses={licenses}
                initialWishlisted={wishlistIds.includes(product.id)}
                isPreviewOnly={product.assetStatus !== "ready" || !APPROVED_RIGHTS.includes(product.rightsStatus)}
                compareAtPrice={product.compareAtPrice ? Number.parseFloat(product.compareAtPrice) : null}
                meta={{
                  formats: product.fileFormats,
                  software: product.softwareCompatibility,
                  version: product.currentVersion,
                  updatedAt: formatDate(product.updatedAt),
                  hasDocumentation: Boolean(product.documentation),
                }}
              />
            </div>

            {/* ---- Left, below gallery: anchored sections ---- */}
            <div className="lg:col-start-1 lg:row-start-2">
              <ProductSections sections={sections} />
            </div>
          </div>

          {related.length > 0 && (
            <Reveal className="mt-20 border-t border-border pt-12">
              <PageHeader size="section" eyebrow="You may also like" title={`More in ${category.name}`} action={<SectionLink href={`/categories/${category.slug}`}>View all</SectionLink>} className="mb-8" />
              <ProductGrid items={related} />
            </Reveal>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

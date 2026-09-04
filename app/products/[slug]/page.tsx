import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { ChevronRight, Download, FileText, RefreshCw, ShieldCheck, Star, ICON_SIZE } from "@/lib/storefront-icons"
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
        <dl className="divide-y divide-border rounded-lg border border-border">
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
        <ul className="max-w-3xl divide-y divide-border rounded-lg border border-border">
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
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 md:py-8">
          <nav className="mb-5 flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="transition-colors hover:text-foreground">Home</Link>
            <ChevronRight size={12} aria-hidden="true" />
            <Link href={`/categories/${category.slug}`} className="transition-colors hover:text-foreground">{category.name}</Link>
            <ChevronRight size={12} aria-hidden="true" />
            <span className="truncate font-medium text-foreground">{product.name}</span>
          </nav>

          <Reveal className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:gap-12">
            {/* ---- Left: gallery ---- */}
            <div className="flex flex-col gap-4 lg:col-start-1 lg:row-start-1">
              <ProductGallery images={gallery} alt={product.name} />
            </div>

            {/* ---- Right: title + sticky purchase panel ---- */}
            <div className="flex flex-col gap-5 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-24">
              <div>
                <Link href={`/categories/${category.slug}`} className="font-mono text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground hover:text-foreground hover:underline">
                  {category.name}
                </Link>
                <h1 className="mt-2 font-display text-2xl font-bold leading-tight tracking-tight text-balance md:text-3xl">{product.name}</h1>
                {product.tagline && <p className="mt-2 text-base leading-relaxed text-muted-foreground text-pretty">{product.tagline}</p>}
                <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  {isOriginal && <ShieldCheck size={13} className="text-success" aria-hidden="true" />}
                  <span>
                    By <span className="font-medium text-foreground">{getSourceTypeLabel(product.sourceType)}</span>
                  </span>
                </p>

                {reviewCount > 0 && (
                  <div className="mt-3 flex items-center gap-2 text-sm">
                    <span className="flex items-center gap-0.5" aria-label={`${avgRating?.toFixed(1)} out of 5 stars`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} size={14} className={i < Math.round(avgRating ?? 0) ? "fill-primary text-primary" : "text-border"} aria-hidden="true" />
                      ))}
                    </span>
                    <span className="font-semibold">{avgRating?.toFixed(1)}</span>
                    <a href="#section-reviews" className="text-muted-foreground underline-offset-4 hover:underline">
                      {reviewCount} review{reviewCount === 1 ? "" : "s"}
                    </a>
                  </div>
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
                isPreviewOnly={product.assetStatus !== "ready" || !APPROVED_RIGHTS.includes(product.rightsStatus)}
                meta={{
                  formats: product.fileFormats,
                  software: product.softwareCompatibility,
                  version: product.currentVersion,
                  updatedAt: formatDate(product.updatedAt),
                  hasDocumentation: Boolean(product.documentation),
                }}
              />

              <ul className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-border bg-border text-center">
                {[
                  { icon: Download, label: "Instant delivery" },
                  { icon: ShieldCheck, label: "Polar checkout" },
                  { icon: RefreshCw, label: "Re-download anytime" },
                ].map(({ icon: Icon, label }) => (
                  <li key={label} className="flex flex-col items-center gap-1.5 bg-card px-2 py-3">
                    <Icon size={ICON_SIZE.base} className="text-foreground" aria-hidden="true" />
                    <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* ---- Left, below gallery: anchored sections ---- */}
            <div className="lg:col-start-1 lg:row-start-2">
              <ProductSections sections={sections} />
            </div>
          </Reveal>

          {related.length > 0 && (
            <Reveal className="mt-16 border-t border-border pt-10">
              <div className="mb-2 flex items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-primary">You may also like</p>
                  <h2 className="mt-1 font-display text-xl font-bold tracking-tight">More in {category.name}</h2>
                </div>
                <Link href={`/categories/${category.slug}`} className="text-sm font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                  View all
                </Link>
              </div>
              <ProductGrid items={related} />
            </Reveal>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

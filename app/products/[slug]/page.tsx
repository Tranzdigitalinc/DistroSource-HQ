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
    openGraph: { title: data.product.name, description, url: canonical, type: "website", images: resolvedImage ? [{ url: resolvedImage, alt: data.product.name }] : undefined },
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
    getRecommendedProducts(category.id, product.id, 6),
    getWishlistProductIds(),
    getReviewEligibility(product.id),
  ])

  const rawGallery = Array.from(new Set([product.coverImageUrl, ...images.map((image) => image.url), product.thumbnailUrl].filter((url): url is string => Boolean(url))))
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
    offers: licenses.map((license) => ({ "@type": "Offer", priceCurrency: "USD", price: license.price, availability: "https://schema.org/InStock", url: `${siteUrl}/products/${product.slug}` })),
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
      <div className="max-w-4xl border-y border-border">
        <dl className="grid sm:grid-cols-2">
          {fileDetails.map(([key, value]) => (
            <div key={key} className="border-b border-border px-0 py-4 sm:border-r sm:px-5 sm:first:pl-0">
              <dt className="font-mono text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground">{key}</dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
        {product.includedFiles.length > 0 && (
          <div className="py-5">
            <p className="font-mono text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground">What’s included</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">{product.includedFiles.map((file) => <li key={file} className="flex items-start gap-2 text-sm text-foreground"><FileText size={13} className="mt-0.5 shrink-0 text-primary" />{file}</li>)}</ul>
          </div>
        )}
        {product.documentation && <p className="border-t border-border py-5 text-sm leading-7 text-muted-foreground">{product.documentation}</p>}
      </div>
    ),
  })

  if (versions.length > 0) {
    sections.push({ id: "changelog", title: `Changelog (${versions.length})`, body: <ul className="max-w-4xl border-y border-border">{versions.map((version) => <li key={version.id} className="grid gap-2 border-b border-border py-4 sm:grid-cols-[140px_1fr]"><div><span className="font-mono text-sm font-black">v{version.version}</span><span className="mt-1 block text-xs text-muted-foreground">{formatDate(version.releasedAt)}</span></div>{version.changelog && <p className="text-sm leading-6 text-muted-foreground">{version.changelog}</p>}</li>)}</ul> })
  }

  if (reviewCount > 0 || reviewEligibility.canReview) {
    sections.push({ id: "reviews", title: `Reviews${reviewCount ? ` (${reviewCount})` : ""}`, body: <div className="flex max-w-4xl flex-col gap-8"><ReviewForm productId={product.id} eligibility={reviewEligibility} /><ReviewList reviews={reviews} /></div> })
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <RecentlyViewedTracker productId={product.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />

      <main className="flex-1">
        <div className="mx-auto max-w-[1600px] px-4 pb-16 pt-6 sm:px-6 lg:px-8 lg:pb-24">
          <nav className="mb-6 flex items-center gap-1.5 overflow-hidden text-xs text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-foreground">Home</Link><ChevronRight size={11} />
            <Link href={`/categories/${category.slug}`} className="hover:text-foreground">{category.name}</Link><ChevronRight size={11} />
            <span className="truncate font-medium text-foreground">{product.name}</span>
          </nav>

          <section className="grid gap-8 lg:grid-cols-[minmax(0,1.55fr)_minmax(360px,0.7fr)] lg:gap-12 xl:gap-16">
            <div className="min-w-0">
              <ProductGallery images={gallery} alt={product.name} />
            </div>

            <aside className="lg:sticky lg:top-24 lg:self-start">
              <div className="mb-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Link href={`/categories/${category.slug}`} className="font-mono text-[9px] font-black uppercase tracking-[0.13em] text-primary">{category.name}</Link>
                  {isOriginal && <span className="inline-flex items-center gap-1 font-mono text-[9px] font-black uppercase tracking-[0.1em] text-success"><ShieldCheck size={11} /> Original</span>}
                </div>
                <h1 className="mt-3 font-display text-[clamp(2.8rem,5vw,5.5rem)] font-black leading-[0.88] tracking-[-0.07em] text-balance">{product.name}</h1>
                {product.tagline && <p className="mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">{product.tagline}</p>}

                <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                  <span>By <strong className="font-semibold text-foreground">{getSourceTypeLabel(product.sourceType)}</strong></span>
                  {reviewCount > 0 && avgRating != null && <span className="flex items-center gap-1"><Star size={12} className="fill-primary text-primary" /><strong className="text-foreground">{avgRating.toFixed(1)}</strong> ({reviewCount})</span>}
                </div>
                <div className="mt-5 flex flex-wrap gap-2"><ShareProductButton name={product.name} /><CompareButton productId={product.id} /></div>
              </div>

              <PurchasePanel
                productId={product.id}
                licenses={licenses}
                initialWishlisted={wishlistIds.includes(product.id)}
                isPreviewOnly={product.assetStatus !== "ready" || !APPROVED_RIGHTS.includes(product.rightsStatus)}
                meta={{ formats: product.fileFormats, software: product.softwareCompatibility, version: product.currentVersion, updatedAt: formatDate(product.updatedAt), hasDocumentation: Boolean(product.documentation) }}
              />
            </aside>
          </section>

          <section className="mt-16 grid gap-10 border-t border-border pt-10 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-16 lg:pt-14">
            <div>
              <p className="font-mono text-[9px] font-black uppercase tracking-[0.14em] text-primary">Product details</p>
              <h2 className="mt-3 font-display text-3xl font-black leading-[0.95] tracking-[-0.05em]">Everything you need to know.</h2>
            </div>
            <ProductSections sections={sections} />
          </section>

          {related.length > 0 && (
            <section className="mt-20 border-t border-border pt-10 sm:pt-14">
              <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="font-mono text-[9px] font-black uppercase tracking-[0.14em] text-primary">More to explore</p><h2 className="mt-2 font-display text-3xl font-black tracking-[-0.05em]">More in {category.name}</h2></div><Link href={`/categories/${category.slug}`} className="text-sm font-semibold">View category</Link></div>
              <ProductGrid items={related} />
            </section>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

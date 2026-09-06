import { notFound } from "next/navigation"
import Link from "next/link"
import type { Metadata } from "next"
import { ChevronRight, Download, FileText, RefreshCw, ShieldCheck, Star } from "@/lib/storefront-icons"
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
    getRecommendedProducts(category.id, product.id, 4),
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
      <div className="max-w-4xl">
        <dl className="grid overflow-hidden rounded-2xl border border-border/80 sm:grid-cols-2">
          {fileDetails.map(([key, value]) => (
            <div key={key} className="border-b border-border/70 px-5 py-4 odd:sm:border-r">
              <dt className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">{key}</dt>
              <dd className="mt-1 text-sm font-semibold text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
        {product.includedFiles.length > 0 && (
          <div className="mt-4 rounded-2xl border border-border/80 p-5">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">What&apos;s included</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {product.includedFiles.map((file) => <li key={file} className="flex items-start gap-2 text-sm text-foreground"><FileText size={13} className="mt-0.5 shrink-0 text-primary" />{file}</li>)}
            </ul>
          </div>
        )}
        {product.documentation && <p className="mt-4 text-sm leading-6 text-muted-foreground">{product.documentation}</p>}
      </div>
    ),
  })

  if (versions.length > 0) {
    sections.push({
      id: "changelog",
      title: `Updates (${versions.length})`,
      body: (
        <ol className="max-w-4xl overflow-hidden rounded-2xl border border-border/80">
          {versions.map((version) => (
            <li key={version.id} className="grid gap-3 border-b border-border/70 p-5 last:border-b-0 sm:grid-cols-[7rem_minmax(0,1fr)]">
              <div><p className="font-display text-lg font-black">v{version.version}</p><p className="mt-1 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">{formatDate(version.releasedAt)}</p></div>
              {version.changelog && <p className="text-sm leading-6 text-muted-foreground">{version.changelog}</p>}
            </li>
          ))}
        </ol>
      ),
    })
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
        <div className="mx-auto max-w-[94rem] px-4 py-5 sm:px-6 lg:px-8">
          <nav className="flex min-w-0 items-center gap-1.5 overflow-hidden text-xs text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="shrink-0 hover:text-foreground">Home</Link><ChevronRight size={11} />
            <Link href={`/categories/${category.slug}`} className="shrink-0 hover:text-foreground">{category.name}</Link><ChevronRight size={11} />
            <span className="truncate font-medium text-foreground">{product.name}</span>
          </nav>
        </div>

        <section className="border-y border-border/70 bg-secondary/18">
          <div className="mx-auto grid max-w-[94rem] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[minmax(0,1.22fr)_minmax(24rem,0.78fr)] lg:gap-12 lg:px-8 lg:py-12 xl:gap-16">
            <Reveal className="min-w-0"><ProductGallery images={gallery} alt={product.name} /></Reveal>

            <Reveal className="flex min-w-0 flex-col lg:sticky lg:top-24 lg:self-start">
              <Link href={`/categories/${category.slug}`} className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-primary hover:underline">{category.name}</Link>
              <h1 className="mt-3 font-display text-4xl font-black leading-[0.96] tracking-[-0.05em] text-foreground text-balance sm:text-5xl">{product.name}</h1>
              {product.tagline && <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">{product.tagline}</p>}

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">{isOriginal && <ShieldCheck size={14} className="text-success" />}By <strong className="font-semibold text-foreground">{getSourceTypeLabel(product.sourceType)}</strong></span>
                {reviewCount > 0 && <a href="#section-reviews" className="flex items-center gap-1.5 hover:text-foreground"><Star size={13} className="fill-primary text-primary" /><strong className="text-foreground">{avgRating?.toFixed(1)}</strong><span>({reviewCount})</span></a>}
              </div>

              <div className="mt-5 flex flex-wrap gap-2"><ShareProductButton name={product.name} /><CompareButton productId={product.id} /></div>
              <div className="mt-7"><PurchasePanel productId={product.id} licenses={licenses} initialWishlisted={wishlistIds.includes(product.id)} isPreviewOnly={product.assetStatus !== "ready" || !APPROVED_RIGHTS.includes(product.rightsStatus)} meta={{ formats: product.fileFormats, software: product.softwareCompatibility, version: product.currentVersion, updatedAt: formatDate(product.updatedAt), hasDocumentation: Boolean(product.documentation) }} /></div>

              <ul className="mt-3 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-border/80 bg-border/70 text-center">
                {[{ icon: Download, label: "Instant access" }, { icon: ShieldCheck, label: "Secure checkout" }, { icon: RefreshCw, label: "Re-download" }].map(({ icon: Icon, label }) => (
                  <li key={label} className="flex min-h-20 flex-col items-center justify-center gap-1.5 bg-background px-2 py-3"><Icon size={15} className="text-foreground" /><span className="text-[10px] font-semibold text-muted-foreground">{label}</span></li>
                ))}
              </ul>
            </Reveal>
          </div>
        </section>

        <section className="mx-auto max-w-[94rem] px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-14">
            <aside className="hidden lg:block"><div className="sticky top-28 border-t-2 border-primary pt-4"><p className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Product file</p><p className="mt-2 font-display text-xl font-black tracking-tight text-foreground">Details before decoration.</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Everything you need to understand the product, licence and updates lives below.</p></div></aside>
            <ProductSections sections={sections} />
          </div>
        </section>

        {related.length > 0 && (
          <section className="border-t border-border/70 bg-secondary/18">
            <div className="mx-auto max-w-[94rem] px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
              <div className="mb-7 flex items-end justify-between gap-4"><div><p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-primary">Keep browsing</p><h2 className="mt-2 font-display text-3xl font-black tracking-[-0.04em] text-foreground">More in {category.name}</h2></div><Link href={`/categories/${category.slug}`} className="text-sm font-bold text-muted-foreground hover:text-foreground">View all →</Link></div>
              <ProductGrid items={related} />
            </div>
          </section>
        )}
      </main>
      <SiteFooter />
    </div>
  )
}

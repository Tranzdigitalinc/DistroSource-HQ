import { notFound } from "next/navigation"
import Link from "next/link"
import { RedesignHeader } from "@/components/redesign/redesign-header"
import { RedesignFooter } from "@/components/redesign/redesign-footer"
import { RedesignProductCard } from "@/components/redesign/redesign-product-card"
import { PurchasePanel } from "@/components/product/purchase-panel"
import { ProductGallery } from "@/components/product/product-gallery"
import { ProductSections } from "@/components/product/product-sections"
import { parseSections, type ProductSection } from "@/components/product/product-sections.shared"
import { ReviewList } from "@/components/product/review-list"
import { ReviewForm } from "@/components/product/review-form"
import { ShareProductButton } from "@/components/product/share-product-button"
import { CompareButton } from "@/components/product/compare-button"
import { RecentlyViewedTracker } from "@/components/product/recently-viewed-tracker"
import { getWishlistProductIds } from "@/lib/actions/wishlist"
import { getReviewEligibility } from "@/lib/actions/reviews"
import { getCategoryTree, getProductBySlug, getRecommendedProducts } from "@/lib/queries/catalog"
import { formatDate, getSourceTypeLabel } from "@/lib/format"
import { ChevronRight, Download, FileText, RefreshCw, ShieldCheck, Star } from "@/lib/storefront-icons"

const APPROVED_RIGHTS = ["original", "licensed_for_distribution", "supplier_verified"]

function resolveProductImageUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? `/api/external-image?url=${encodeURIComponent(url)}` : url
}

export const metadata = {
  title: "Product preview — DistroSource redesign",
  robots: { index: false, follow: false },
}

export default async function RedesignProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const [data, departments] = await Promise.all([getProductBySlug(slug), getCategoryTree()])
  if (!data) notFound()

  const { product, category, images, licenses, reviews, versions, avgRating, reviewCount } = data
  const [related, wishlistIds, reviewEligibility] = await Promise.all([
    getRecommendedProducts(category.id, product.id, 5),
    getWishlistProductIds(),
    getReviewEligibility(product.id),
  ])

  const rawGallery = Array.from(
    new Set([product.coverImageUrl, ...images.map((image) => image.url), product.thumbnailUrl].filter((url): url is string => Boolean(url))),
  )
  const gallery = rawGallery.map(resolveProductImageUrl)
  const isOriginal = product.sourceType === "distrosource_original" && product.rightsStatus === "original"

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
        <dl className="grid border border-border sm:grid-cols-2">
          {fileDetails.map(([key, value]) => (
            <div key={key} className="border-b border-border px-5 py-4 odd:sm:border-r">
              <dt className="font-mono text-[9px] font-bold uppercase tracking-[0.09em] text-muted-foreground">{key}</dt>
              <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
            </div>
          ))}
        </dl>
        {product.includedFiles.length > 0 && (
          <div className="mt-5 border border-border p-5">
            <p className="font-mono text-[9px] font-bold uppercase tracking-[0.09em] text-muted-foreground">What&apos;s included</p>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {product.includedFiles.map((file) => (
                <li key={file} className="flex items-start gap-2 text-sm text-foreground">
                  <FileText size={14} className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                  {file}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    ),
  })

  if (versions.length > 0) {
    sections.push({
      id: "changelog",
      title: `Updates (${versions.length})`,
      body: (
        <ol className="max-w-4xl border border-border">
          {versions.map((version, index) => (
            <li key={version.id} className="grid gap-3 border-b border-border p-5 last:border-b-0 sm:grid-cols-[7rem_minmax(0,1fr)]">
              <div>
                <p className="font-display text-lg font-black">v{version.version}</p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.08em] text-muted-foreground">{formatDate(version.releasedAt)}</p>
              </div>
              <div>
                <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-primary">Update {String(index + 1).padStart(2, "0")}</p>
                {version.changelog && <p className="mt-1 text-sm leading-6 text-muted-foreground">{version.changelog}</p>}
              </div>
            </li>
          ))}
        </ol>
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
      <RedesignHeader departments={departments} />
      <RecentlyViewedTracker productId={product.id} />
      <main className="flex-1">
        <div className="mx-auto max-w-[1500px] px-6 py-6 sm:px-8 lg:px-10 lg:py-8">
          <nav className="flex min-w-0 items-center gap-1.5 overflow-hidden font-mono text-[9px] font-semibold uppercase tracking-[0.06em] text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/redesign-preview" className="shrink-0 hover:text-foreground">Home</Link>
            <ChevronRight size={11} aria-hidden="true" />
            <Link href="/redesign-preview/products" className="shrink-0 hover:text-foreground">Products</Link>
            <ChevronRight size={11} aria-hidden="true" />
            <Link href={`/redesign-preview/products?category=${encodeURIComponent(category.slug)}`} className="shrink-0 hover:text-foreground">{category.name}</Link>
            <ChevronRight size={11} aria-hidden="true" />
            <span className="truncate text-foreground">{product.name}</span>
          </nav>
        </div>

        <section className="border-y border-border bg-secondary/15">
          <div className="mx-auto grid max-w-[1500px] gap-0 px-6 sm:px-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(25rem,0.85fr)] lg:px-10">
            <div className="border-border py-8 lg:border-r lg:py-12 lg:pr-10">
              <ProductGallery images={gallery} alt={product.name} />
            </div>

            <aside className="py-8 lg:sticky lg:top-[8.5rem] lg:self-start lg:py-12 lg:pl-10">
              <Link
                href={`/redesign-preview/products?category=${encodeURIComponent(category.slug)}`}
                className="font-mono text-[10px] font-bold uppercase tracking-[0.11em] text-primary hover:underline"
              >
                {category.name}
              </Link>
              <h1 className="mt-3 max-w-2xl font-display text-4xl font-black leading-[0.98] tracking-[-0.045em] text-foreground sm:text-5xl">
                {product.name}
              </h1>
              {product.tagline && <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">{product.tagline}</p>}

              <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  {isOriginal && <ShieldCheck size={14} className="text-success" aria-hidden="true" />}
                  By <strong className="font-semibold text-foreground">{getSourceTypeLabel(product.sourceType)}</strong>
                </span>
                {reviewCount > 0 && (
                  <a href="#section-reviews" className="flex items-center gap-1.5 hover:text-foreground">
                    <Star size={13} className="fill-primary text-primary" aria-hidden="true" />
                    <strong className="text-foreground">{(avgRating ?? 0).toFixed(1)}</strong>
                    <span>({reviewCount})</span>
                  </a>
                )}
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <ShareProductButton name={product.name} />
                <CompareButton productId={product.id} />
              </div>

              <div className="mt-7">
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
              </div>

              <ul className="mt-4 grid grid-cols-3 gap-px border border-border bg-border text-center">
                {[
                  { icon: Download, label: "Instant access" },
                  { icon: ShieldCheck, label: "Secure checkout" },
                  { icon: RefreshCw, label: "Re-download" },
                ].map(({ icon: Icon, label }) => (
                  <li key={label} className="flex min-h-24 flex-col items-center justify-center gap-2 bg-background px-2 py-3">
                    <Icon size={18} className="text-primary" aria-hidden="true" />
                    <span className="text-[10px] font-semibold text-muted-foreground">{label}</span>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </section>

        <section className="mx-auto max-w-[1500px] px-6 py-14 sm:px-8 lg:px-10 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)]">
            <div className="hidden lg:block">
              <div className="sticky top-36 border-t-2 border-primary pt-4">
                <p className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">Product file</p>
                <p className="mt-2 font-display text-lg font-black tracking-tight text-foreground">Details, updates & proof.</p>
                <p className="mt-2 text-xs leading-5 text-muted-foreground">The purchasing panel stays focused. The evidence and documentation live here.</p>
              </div>
            </div>
            <ProductSections sections={sections} />
          </div>
        </section>

        {related.length > 0 && (
          <section className="border-t border-border bg-secondary/25">
            <div className="mx-auto max-w-[1500px] px-6 py-16 sm:px-8 lg:px-10 lg:py-20">
              <div className="mb-8 flex flex-col gap-4 border-b border-border pb-6 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-primary">Keep browsing</p>
                  <h2 className="mt-2 font-display text-3xl font-black tracking-[-0.035em] text-foreground">More from {category.name}.</h2>
                </div>
                <Link href={`/redesign-preview/products?category=${encodeURIComponent(category.slug)}`} className="text-sm font-bold text-foreground hover:text-primary">
                  View the whole shelf →
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {related.map((item) => (
                  <RedesignProductCard key={item.product.id} item={item} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
      <RedesignFooter />
    </div>
  )
}

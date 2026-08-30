import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { Star, ChevronRight } from "lucide-react"
import { getProductBySlug, getRelatedProducts } from "@/lib/queries/catalog"
import { getWishlistProductIds } from "@/lib/actions/wishlist"
import { PurchasePanel } from "@/components/product/purchase-panel"
import { ReviewList } from "@/components/product/review-list"
import { ProductGrid } from "@/components/catalog/product-grid"
import { BrandThumbnail } from "@/components/product/brand-thumbnail"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { SiteHeader } from "@/components/header/site-header"
import { SiteFooter } from "@/components/footer/site-footer"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const data = await getProductBySlug(slug)
  if (!data) return {}
  return {
    title: `${data.product.name} — RedeemCove`,
    description: data.product.shortDescription ?? undefined,
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
  const related = await getRelatedProducts(category.id, product.id, 8)
  const wishlistIds = await getWishlistProductIds()

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-6">
          <nav className="mb-6 flex items-center gap-1.5 text-xs text-muted-foreground" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-foreground">
              Home
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <Link href={`/categories/${category.slug}`} className="hover:text-foreground">
              {category.name}
            </Link>
            <ChevronRight className="h-3 w-3" aria-hidden="true" />
            <span className="text-foreground">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="flex flex-col gap-4">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl || "/placeholder.svg"}
                    alt={product.name}
                    fill
                    priority
                    className="object-cover"
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
                  <Badge className="absolute left-3 top-3 bg-accent text-accent-foreground">Deal</Badge>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(Number.parseFloat(product.rating))
                          ? "fill-accent text-accent"
                          : "fill-none text-border"
                      }`}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <span className="font-semibold">{product.rating}</span>
                <span className="text-muted-foreground">({product.reviewCount.toLocaleString()} reviews)</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{product.salesCount.toLocaleString()} sold</span>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  {brand.name}
                  {country && (
                    <>
                      <span aria-hidden="true">·</span>
                      <span>
                        {country.flagEmoji} {country.name}
                      </span>
                    </>
                  )}
                </p>
                <h1 className="font-display text-2xl font-bold text-balance md:text-3xl">{product.name}</h1>
                {product.shortDescription && (
                  <p className="mt-1.5 text-sm text-muted-foreground">{product.shortDescription}</p>
                )}
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
          </div>

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

          {related.length > 0 && (
            <div className="mt-12">
              <h2 className="mb-4 font-display text-xl font-bold">You might also like</h2>
              <ProductGrid items={related} />
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

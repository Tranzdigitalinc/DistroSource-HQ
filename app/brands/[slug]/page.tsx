import { notFound } from "next/navigation"
import { CatalogPage } from "@/components/catalog/catalog-page"
import { getBrandBySlug, getProducts } from "@/lib/queries/catalog"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const brand = await getBrandBySlug(slug)
  if (!brand) return {}
  return {
    title: `${brand.name} Gift Cards & Digital Codes | RedeemCove`,
    description: `Shop ${brand.name} gift cards and digital codes with instant delivery from RedeemCove.`,
    alternates: { canonical: `/brands/${brand.slug}` },
    openGraph: { title: `${brand.name} Gift Cards | RedeemCove`, description: `Shop ${brand.name} gift cards with instant delivery.`, type: "website", images: brand.logoUrl ? [{ url: brand.logoUrl, alt: `${brand.name} logo` }] : undefined },
  }
}

export default async function BrandDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | undefined>>
}) {
  const { slug } = await params
  const sp = await searchParams
  const brand = await getBrandBySlug(slug)
  if (!brand) notFound()

  const products = await getProducts({
    brandSlug: slug,
    categorySlug: sp.category,
    countryCode: sp.country,
    search: sp.q,
    sort: (sp.sort as any) ?? "popular",
  })

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "/" },
          { "@type": "ListItem", position: 2, name: "Brands", item: "/brands" },
          { "@type": "ListItem", position: 3, name: brand.name },
        ],
      }) }} />
      <CatalogPage
        title={brand.name}
        subtitle={brand.description ?? `Shop gift cards and codes from ${brand.name}`}
        logoUrl={brand.logoUrl}
        products={products}
      />
    </>
  )
}

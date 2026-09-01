import Link from "next/link"
import { notFound } from "next/navigation"
import { CatalogPage } from "@/components/catalog/catalog-page"
import { FlagIcon } from "@/components/flag-icon"
import { getCategoryBySlug, getCountryByCode, getCountries, getProducts } from "@/lib/queries/catalog"
import { getCategoryIcon } from "@/lib/category-icons"

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; countryCode: string }>
}) {
  const { slug, countryCode } = await params
  const [category, country] = await Promise.all([getCategoryBySlug(slug), getCountryByCode(countryCode.toUpperCase())])
  if (!category || !country) return {}
  const title = `${category.name} Gift Cards in ${country.name} | RedeemCove`
  const description = `Buy ${category.name.toLowerCase()} gift cards and digital codes for ${country.name}, priced in ${country.currencyCode} with instant delivery.`
  return {
    title,
    description,
    alternates: { canonical: `/categories/${slug}/${countryCode.toLowerCase()}` },
  }
}

export default async function CategoryCountryPage({
  params,
}: {
  params: Promise<{ slug: string; countryCode: string }>
}) {
  const { slug, countryCode } = await params
  const [category, country, allCountries] = await Promise.all([
    getCategoryBySlug(slug),
    getCountryByCode(countryCode.toUpperCase()),
    getCountries(),
  ])
  if (!category || !country) notFound()

  const products = await getProducts({ categorySlug: slug, countryCode: country.code, sort: "popular" })

  const otherPopularCountries = allCountries.filter((c) => c.isPopular && c.code !== country.code).slice(0, 6)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: "/" },
              { "@type": "ListItem", position: 2, name: "Categories", item: "/categories" },
              { "@type": "ListItem", position: 3, name: category.name, item: `/categories/${category.slug}` },
              { "@type": "ListItem", position: 4, name: country.name },
            ],
          }),
        }}
      />
      <CatalogPage
        title={
          <span className="flex items-center gap-2">
            {category.name} in {country.name}
            <FlagIcon code={country.code} className="h-4 w-6" />
          </span>
        }
        subtitle={`${category.name} gift cards and digital codes for ${country.name}, priced in ${country.currencyCode}.`}
        products={products}
        banner={
          <div className="relative flex w-full flex-col gap-4 overflow-hidden border-b border-primary/20 bg-[radial-gradient(circle_at_85%_-20%,hsl(var(--primary)/0.35),transparent_60%),radial-gradient(circle_at_10%_120%,hsl(var(--accent)/0.2),transparent_55%)] px-6 py-6 sm:px-10 sm:py-8">
            <div className="flex items-center gap-5">
              <div className="flex size-16 items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 text-primary shadow-[0_0_30px_hsl(var(--primary)/0.3)]">
                {(() => {
                  const Icon = getCategoryIcon(category.name)
                  return <Icon aria-hidden="true" />
                })()}
              </div>
              <div className="flex flex-col gap-1">
                <h1 className="flex items-center gap-2 font-display text-2xl font-bold text-foreground sm:text-3xl">
                  {category.name} in {country.name}
                  <FlagIcon code={country.code} className="h-5 w-7" />
                </h1>
                <p className="max-w-xl text-sm text-muted-foreground">
                  Instant-delivery {category.name.toLowerCase()} gift cards, priced in {country.currencyCode} for
                  shoppers in {country.name}.
                </p>
              </div>
            </div>
            {otherPopularCountries.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Also available in:</span>
                {otherPopularCountries.map((c) => (
                  <Link
                    key={c.code}
                    href={`/categories/${category.slug}/${c.code.toLowerCase()}`}
                    className="flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium transition-colors hover:border-primary/40"
                  >
                    <FlagIcon code={c.code} className="h-3 w-4" />
                    {c.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        }
      />
    </>
  )
}

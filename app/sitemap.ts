import type { MetadataRoute } from "next"
import { getBrands, getCategories, getCountries, getProducts } from "@/lib/queries/catalog"

const baseUrl = "https://redeemcove.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, brands, categories, countries] = await Promise.all([
    getProducts({ limit: 5000 }),
    getBrands(),
    getCategories(),
    getCountries(),
  ])
  const popularCountries = countries.filter((c) => c.isPopular)
  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    ...products.map(({ product }) => ({ url: `${baseUrl}/products/${product.slug}`, lastModified: product.createdAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...brands.map((brand) => ({ url: `${baseUrl}/brands/${brand.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...categories.map((category) => ({ url: `${baseUrl}/categories/${category.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...categories.flatMap((category) =>
      popularCountries.map((country) => ({
        url: `${baseUrl}/categories/${category.slug}/${country.code.toLowerCase()}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
    ),
  ]
}

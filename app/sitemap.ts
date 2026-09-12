import type { MetadataRoute } from "next"
import { getCategories, getProducts } from "@/lib/queries/catalog"
import { getGamingProducts } from "@/lib/gaming/queries"
import { GAMING_SUBSCRIPTION_PLANS } from "@/lib/gaming/subscriptions/catalog"

const baseUrl = "https://distrosource.com"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Code-backed Gaming routes can build without production database access.
  // Database-backed catalog routes are added whenever DATABASE_URL is present.
  const [products, categories] = process.env.DATABASE_URL
    ? await Promise.all([getProducts({ limit: 5000 }), getCategories()])
    : [[], []]
  const gaming = getGamingProducts()

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/products`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/deals`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    ...products.map(({ product }) => ({
      url: `${baseUrl}/products/${product.slug}`,
      lastModified: product.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    // DistroSource Gaming
    { url: `${baseUrl}/gaming`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${baseUrl}/gaming/products`, lastModified: new Date(), changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${baseUrl}/gaming/fivem`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/gaming/minecraft`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/gaming/subscriptions`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 },
    ...GAMING_SUBSCRIPTION_PLANS.map((plan) => ({
      url: `${baseUrl}/gaming/subscriptions/${plan.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...gaming.map((product) => ({
      url: `${baseUrl}/gaming/product/${product.slug}`,
      lastModified: new Date(product.lastUpdated),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...categories.map((category) => ({
      url: `${baseUrl}/categories/${category.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ]
}

import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: ["/", "/products", "/brands/", "/categories/"], disallow: ["/admin", "/account", "/checkout", "/api/"] }],
    sitemap: "https://redeemcove.com/sitemap.xml",
  }
}

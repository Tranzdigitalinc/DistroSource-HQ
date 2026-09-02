import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: ["/", "/products", "/categories/"], disallow: ["/admin", "/account", "/checkout", "/api/"] }],
    sitemap: "https://distrosource.com/sitemap.xml",
  }
}

import { getBrands, getCategories } from "@/lib/queries/catalog"
import { SiteHeaderClient } from "@/components/header/site-header-client"

export async function SiteHeader() {
  let categories: Awaited<ReturnType<typeof getCategories>> = []
  let brands: Awaited<ReturnType<typeof getBrands>> = []
  try {
    ;[categories, brands] = await Promise.all([getCategories(), getBrands()])
  } catch {
    // DB unavailable at build time — nav renders without categories/brands
  }

  return <SiteHeaderClient categories={categories} brands={brands} />
}

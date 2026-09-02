import { getCategories } from "@/lib/queries/catalog"
import { SiteHeaderClient } from "@/components/header/site-header-client"

export async function SiteHeader() {
  let categories: Awaited<ReturnType<typeof getCategories>> = []
  try {
    categories = await getCategories()
  } catch {
    // DB unavailable at build time — nav renders without categories
  }

  return <SiteHeaderClient categories={categories} />
}

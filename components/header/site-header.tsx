import { getCategoryTree } from "@/lib/queries/catalog"
import { SiteHeaderClient } from "@/components/header/site-header-client"

export async function SiteHeader() {
  let departments: Awaited<ReturnType<typeof getCategoryTree>> = []
  try {
    // Navigation only lists shelves that hold a visible product. A department
    // whose every subcategory is empty (e.g. Bundles while all bundles are
    // drafts) would otherwise link straight to a "0 products" page.
    departments = (await getCategoryTree())
      .map((d) => ({ ...d, subcategories: d.subcategories.filter((s) => s.productCount > 0) }))
      .filter((d) => d.subcategories.length > 0)
  } catch {
    // DB unavailable at build time — nav renders without categories
  }

  return <SiteHeaderClient departments={departments} />
}

import { getCategoryTree } from "@/lib/queries/catalog"
import { V5SiteHeaderClient } from "@/components/v5/site-header-client"

export async function SiteHeader() {
  let departments: Awaited<ReturnType<typeof getCategoryTree>> = []
  try {
    departments = (await getCategoryTree())
      .map((department) => ({ ...department, subcategories: department.subcategories.filter((subcategory) => subcategory.productCount > 0) }))
      .filter((department) => department.subcategories.length > 0)
  } catch {
    // Navigation remains usable even when catalog data is unavailable at build time.
  }

  return <V5SiteHeaderClient departments={departments} />
}

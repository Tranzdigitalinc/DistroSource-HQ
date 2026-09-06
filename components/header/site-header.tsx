import { getCategoryTree } from "@/lib/queries/catalog"
import { V4StorefrontHeader } from "@/components/v4/storefront-header"

export async function SiteHeader() {
  let departments: Awaited<ReturnType<typeof getCategoryTree>> = []
  try {
    departments = (await getCategoryTree())
      .map((department) => ({
        ...department,
        subcategories: department.subcategories.filter((subcategory) => subcategory.productCount > 0),
      }))
      .filter((department) => department.productCount > 0)
  } catch {
    // The shell still renders if catalog data is unavailable at build time.
  }

  return <V4StorefrontHeader departments={departments} />
}

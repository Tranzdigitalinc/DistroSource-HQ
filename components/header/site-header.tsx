import { getCategoryTree } from "@/lib/queries/catalog"
import { SiteHeaderClient } from "@/components/header/site-header-client"

export async function SiteHeader() {
  let departments: Awaited<ReturnType<typeof getCategoryTree>> = []
  try {
    departments = await getCategoryTree()
  } catch {
    // DB unavailable at build time — nav renders without categories
  }

  return <SiteHeaderClient departments={departments} />
}

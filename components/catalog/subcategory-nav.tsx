import Link from "next/link"
import { pillClass } from "@/components/catalog/pill"

interface SubcategoryLink {
  slug: string
  name: string
  /** Publicly visible products. Empty siblings are hidden unless active. */
  productCount?: number
}

interface Props {
  department: SubcategoryLink
  subcategories: SubcategoryLink[]
  activeSlug: string
}

// Real navigation to sibling pages within the current department — every
// pill is a link to its own /categories/[slug] route, unlike CategoryPillBar
// (used on /products and /deals) which filters in place via ?category=.
export function SubcategoryNav({ department, subcategories, activeSlug }: Props) {
  const visible = subcategories.filter((s) => s.slug === activeSlug || (s.productCount ?? 1) > 0)

  return (
    <nav aria-label={`Browse ${department.name}`} className="no-scrollbar -mx-5 overflow-x-auto px-5 sm:-mx-8 sm:px-8">
      <div className="flex gap-2 pb-1">
        <Link href={`/categories/${department.slug}`} className={pillClass(activeSlug === department.slug)} aria-current={activeSlug === department.slug ? "page" : undefined}>
          All {department.name}
        </Link>
        {visible.map((subcategory) => (
          <Link key={subcategory.slug} href={`/categories/${subcategory.slug}`} className={pillClass(activeSlug === subcategory.slug)} aria-current={activeSlug === subcategory.slug ? "page" : undefined}>
            {subcategory.name}
          </Link>
        ))}
      </div>
    </nav>
  )
}

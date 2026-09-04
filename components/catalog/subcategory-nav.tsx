import Link from "next/link"
import { cn } from "@/lib/utils"

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
// Visually identical to CategoryPillBar so the two read as one system.
const pill = (active: boolean) =>
  cn(
    "shrink-0 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    active ? "border-foreground bg-foreground text-background" : "border-border bg-card text-muted-foreground hover:border-border-strong hover:text-foreground",
  )

export function SubcategoryNav({ department, subcategories, activeSlug }: Props) {
  const visible = subcategories.filter((s) => s.slug === activeSlug || (s.productCount ?? 1) > 0)

  return (
    <nav
      aria-label={`Browse ${department.name}`}
      className="-mx-4 mb-6 overflow-x-auto px-4 sm:-mx-6 sm:px-6 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      <div className="flex gap-2 pb-1">
        <Link
          href={`/categories/${department.slug}`}
          className={pill(activeSlug === department.slug)}
          aria-current={activeSlug === department.slug ? "page" : undefined}
        >
          All {department.name}
        </Link>
        {visible.map((subcategory) => (
          <Link
            key={subcategory.slug}
            href={`/categories/${subcategory.slug}`}
            className={pill(activeSlug === subcategory.slug)}
            aria-current={activeSlug === subcategory.slug ? "page" : undefined}
          >
            {subcategory.name}
          </Link>
        ))}
      </div>
    </nav>
  )
}

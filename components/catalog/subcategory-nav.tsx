import Link from "next/link"
import { cn } from "@/lib/utils"

interface SubcategoryLink {
  slug: string
  name: string
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
  return (
    <div className="-mx-6 mb-8 flex gap-2 overflow-x-auto border-y border-border px-6 py-3 sm:-mx-8 sm:px-8">
      <Link
        href={`/categories/${department.slug}`}
        className={cn(
          "shrink-0 whitespace-nowrap rounded-[3px] border px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.04em] transition-colors",
          activeSlug === department.slug
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border text-foreground/80 hover:border-primary/40",
        )}
      >
        All {department.name}
      </Link>
      {subcategories.map((subcategory) => (
        <Link
          key={subcategory.slug}
          href={`/categories/${subcategory.slug}`}
          className={cn(
            "shrink-0 whitespace-nowrap rounded-[3px] border px-4 py-2 font-mono text-xs font-semibold uppercase tracking-[0.04em] transition-colors",
            activeSlug === subcategory.slug
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border text-foreground/80 hover:border-primary/40",
          )}
        >
          {subcategory.name}
        </Link>
      ))}
    </div>
  )
}

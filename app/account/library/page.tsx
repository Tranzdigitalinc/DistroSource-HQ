import Link from "next/link"
import { ArrowRight, Library, ICON_SIZE } from "@/lib/storefront-icons"
import { getUserLibrary } from "@/lib/actions/account"
import { getCategoryNamesByIds } from "@/lib/queries/catalog"
import { LibraryGrid, type LibraryItem } from "@/components/account/library-grid"
import { Button } from "@/components/ui/button"
import { Reveal } from "@/components/motion/reveal"

export const metadata = {
  title: "My Library — DistroSource",
}

export default async function AccountLibraryPage() {
  const library = await getUserLibrary()

  if (library.length === 0) {
    return (
      <Reveal className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-lg border border-border bg-card px-6 py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-secondary text-muted-foreground">
          <Library size={ICON_SIZE.feature} aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-display text-lg font-bold">Your library is empty</h2>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">Products you buy appear here, ready to download whenever you need them.</p>
        </div>
        <Button render={<Link href="/products" />} nativeButton={false} className="font-semibold">
          Browse products
          <ArrowRight size={ICON_SIZE.base} aria-hidden="true" />
        </Button>
      </Reveal>
    )
  }

  const categoryNames = await getCategoryNamesByIds(library.map((r) => r.product.categoryId))

  const items: LibraryItem[] = library.map((row) => ({
    entitlementId: row.entitlement.id,
    purchasedAt: new Date(row.entitlement.createdAt).toISOString(),
    product: {
      id: row.product.id,
      slug: row.product.slug,
      name: row.product.name,
      imageUrl: row.product.thumbnailUrl ?? row.product.coverImageUrl ?? null,
      categoryName: categoryNames.get(row.product.categoryId) ?? null,
      version: row.product.currentVersion,
      fileFormats: row.product.fileFormats,
      hasDocumentation: Boolean(row.product.documentation),
    },
    licenseType: row.license.licenseType,
    files: row.files.map((f) => ({ id: f.id, name: f.fileName })),
  }))

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-xl font-bold tracking-tight">My Library</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {items.length} {items.length === 1 ? "product" : "products"} you own. Re-download any time.
        </p>
      </div>
      <LibraryGrid items={items} />
    </div>
  )
}

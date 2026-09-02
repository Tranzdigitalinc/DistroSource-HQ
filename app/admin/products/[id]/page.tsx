import { redirect, notFound } from "next/navigation"
import { headers } from "next/headers"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { isAdminEmail } from "@/lib/admin-emails"
import { getAdminProductById } from "@/lib/actions/admin-products"
import { ProductForm } from "@/components/admin/product-form"
import { ProductImagesPanel } from "@/components/admin/product-images-panel"
import { ProductFilesPanel } from "@/components/admin/product-files-panel"
import { ProductLicensesPanel } from "@/components/admin/product-licenses-panel"
import { ProductVersionsPanel } from "@/components/admin/product-versions-panel"
import { DeleteProductButton } from "@/components/admin/delete-product-button"
import { BundleContentsPanel } from "@/components/admin/bundle-contents-panel"
import { Button } from "@/components/ui/button"

export const metadata = {
  title: "Edit product | DistroSource Admin",
}

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) redirect("/sign-in?next=/admin/products")
  if (!isAdminEmail(session.user.email)) redirect("/")

  const { id } = await params
  const parsedId = Number.parseInt(id, 10)
  if (!Number.isFinite(parsedId)) notFound()

  const data = await getAdminProductById(parsedId)
  if (!data) notFound()

  const { product, category, images, licenses, files, versions, bundleContents, allCategories, allProducts } = data

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Catalog · {category.name}</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">{product.name}</h1>
          <Link href={`/products/${product.slug}`} target="_blank" className="mt-1 inline-block text-xs text-muted-foreground underline-offset-2 hover:underline">
            View live page &rarr;
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" render={<Link href="/admin/products" />} nativeButton={false}>
            Back to products
          </Button>
          <DeleteProductButton productId={product.id} productName={product.name} redirectTo="/admin/products" />
        </div>
      </header>

      <ProductForm
        categories={allCategories}
        product={{
          id: product.id,
          slug: product.slug,
          name: product.name,
          tagline: product.tagline,
          description: product.description,
          categoryId: product.categoryId,
          status: product.status,
          basePrice: product.basePrice,
          compareAtPrice: product.compareAtPrice,
          thumbnailUrl: product.thumbnailUrl,
          coverImageUrl: product.coverImageUrl,
          fileFormats: product.fileFormats,
          fileSizeMb: product.fileSizeMb,
          softwareCompatibility: product.softwareCompatibility,
          currentVersion: product.currentVersion,
          includedFiles: product.includedFiles,
          documentation: product.documentation,
          tags: product.tags,
          isFeatured: product.isFeatured,
          isNewRelease: product.isNewRelease,
          isFree: product.isFree,
          isBundle: product.isBundle,
          seoTitle: product.seoTitle,
          seoDescription: product.seoDescription,
        }}
      />

      <ProductImagesPanel productId={product.id} images={images} />
      <ProductFilesPanel productId={product.id} files={files} />
      <ProductLicensesPanel productId={product.id} licenses={licenses} />
      <ProductVersionsPanel productId={product.id} versions={versions} />
      {product.isBundle ? (
        <BundleContentsPanel productId={product.id} allProducts={allProducts} selectedIds={bundleContents.map((b) => b.includedProductId)} />
      ) : null}
    </main>
  )
}

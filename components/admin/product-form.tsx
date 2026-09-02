"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createProduct, updateProduct, type ProductFormInput } from "@/lib/actions/admin-products"

type Category = { id: number; slug: string; name: string }

type ExistingProduct = {
  id: number
  slug: string
  name: string
  tagline: string | null
  description: string
  categoryId: number
  status: string
  basePrice: string
  compareAtPrice: string | null
  thumbnailUrl: string | null
  coverImageUrl: string | null
  fileFormats: string[]
  fileSizeMb: string | null
  softwareCompatibility: string[]
  currentVersion: string
  includedFiles: string[]
  documentation: string | null
  tags: string[]
  isFeatured: boolean
  isNewRelease: boolean
  isFree: boolean
  isBundle: boolean
  seoTitle: string | null
  seoDescription: string | null
}

export function ProductForm({ categories, product }: { categories: Category[]; product?: ExistingProduct }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState(product?.name ?? "")
  const [slug, setSlug] = useState(product?.slug ?? "")
  const [tagline, setTagline] = useState(product?.tagline ?? "")
  const [description, setDescription] = useState(product?.description ?? "")
  const [categoryId, setCategoryId] = useState(product?.categoryId ? String(product.categoryId) : categories[0]?.id ? String(categories[0].id) : "")
  const [status, setStatus] = useState<"draft" | "published">((product?.status as "draft" | "published") ?? "draft")
  const [basePrice, setBasePrice] = useState(product?.basePrice ?? "")
  const [compareAtPrice, setCompareAtPrice] = useState(product?.compareAtPrice ?? "")
  const [thumbnailUrl, setThumbnailUrl] = useState(product?.thumbnailUrl ?? "")
  const [coverImageUrl, setCoverImageUrl] = useState(product?.coverImageUrl ?? "")
  const [fileFormats, setFileFormats] = useState(product?.fileFormats.join(", ") ?? "")
  const [fileSizeMb, setFileSizeMb] = useState(product?.fileSizeMb ?? "")
  const [softwareCompatibility, setSoftwareCompatibility] = useState(product?.softwareCompatibility.join(", ") ?? "")
  const [currentVersion, setCurrentVersion] = useState(product?.currentVersion ?? "1.0.0")
  const [includedFiles, setIncludedFiles] = useState(product?.includedFiles.join(", ") ?? "")
  const [documentation, setDocumentation] = useState(product?.documentation ?? "")
  const [tags, setTags] = useState(product?.tags.join(", ") ?? "")
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false)
  const [isNewRelease, setIsNewRelease] = useState(product?.isNewRelease ?? false)
  const [isFree, setIsFree] = useState(product?.isFree ?? false)
  const [isBundle, setIsBundle] = useState(product?.isBundle ?? false)
  const [seoTitle, setSeoTitle] = useState(product?.seoTitle ?? "")
  const [seoDescription, setSeoDescription] = useState(product?.seoDescription ?? "")

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      toast.error("Product name is required.")
      return
    }
    if (!description.trim()) {
      toast.error("Description is required.")
      return
    }
    if (!categoryId) {
      toast.error("Choose a category.")
      return
    }

    const input: ProductFormInput = {
      name,
      slug,
      tagline,
      description,
      categoryId: Number.parseInt(categoryId, 10),
      status,
      basePrice,
      compareAtPrice,
      thumbnailUrl,
      coverImageUrl,
      fileFormats,
      fileSizeMb,
      softwareCompatibility,
      currentVersion,
      includedFiles,
      documentation,
      tags,
      isFeatured,
      isNewRelease,
      isFree,
      isBundle,
      seoTitle,
      seoDescription,
    }

    startTransition(async () => {
      try {
        if (product) {
          await updateProduct(product.id, input)
          toast.success("Product saved")
        } else {
          const id = await createProduct(input)
          toast.success("Product created as a draft — add files and images before publishing.")
          router.push(`/admin/products/${id}`)
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not save this product.")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Basics</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="name">Product name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={name ? undefined : "auto-generated from name"} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="category">Category</Label>
            <Select value={categoryId} onValueChange={(value) => setCategoryId(value ?? "")}>
              <SelectTrigger id="category" className="w-full">
                <SelectValue placeholder="Choose a category">
                  {(value: string | null) => categories.find((c) => String(c.id) === value)?.name ?? "Choose a category"}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={String(c.id)}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="tagline">Tagline</Label>
            <Input id="tagline" value={tagline} onChange={(e) => setTagline(e.target.value)} placeholder="One-line summary shown in cards" />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as "draft" | "published")}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
              </SelectContent>
            </Select>
            {status === "published" && !product ? (
              <p className="text-xs text-muted-foreground">New products save as a draft first — publish after adding files and images.</p>
            ) : null}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="basePrice">Base price (USD)</Label>
            <Input id="basePrice" type="number" min="0" step="0.01" value={basePrice} onChange={(e) => setBasePrice(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="compareAtPrice">Compare-at price (USD)</Label>
            <Input id="compareAtPrice" type="number" min="0" step="0.01" value={compareAtPrice} onChange={(e) => setCompareAtPrice(e.target.value)} placeholder="Optional — shows a strikethrough deal price" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Images</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
            <Input id="thumbnailUrl" value={thumbnailUrl} onChange={(e) => setThumbnailUrl(e.target.value)} placeholder="Shown in product grids" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="coverImageUrl">Cover image URL</Label>
            <Input id="coverImageUrl" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)} placeholder="Shown at the top of the product page" />
          </div>
          {product ? (
            <p className="text-xs text-muted-foreground sm:col-span-2">
              Manage the full preview gallery in the Images panel below after saving.
            </p>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>File details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="fileFormats">File formats</Label>
            <Input id="fileFormats" value={fileFormats} onChange={(e) => setFileFormats(e.target.value)} placeholder="e.g. FIGMA, SKETCH, PNG" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="fileSizeMb">File size (MB)</Label>
            <Input id="fileSizeMb" type="number" min="0" step="0.1" value={fileSizeMb} onChange={(e) => setFileSizeMb(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="softwareCompatibility">Software compatibility</Label>
            <Input id="softwareCompatibility" value={softwareCompatibility} onChange={(e) => setSoftwareCompatibility(e.target.value)} placeholder="e.g. Figma, Adobe XD" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="currentVersion">Current version</Label>
            <Input id="currentVersion" value={currentVersion} onChange={(e) => setCurrentVersion(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="includedFiles">Included files</Label>
            <Input id="includedFiles" value={includedFiles} onChange={(e) => setIncludedFiles(e.target.value)} placeholder="e.g. Source files, Documentation, License" />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="documentation">Documentation notes</Label>
            <Textarea id="documentation" value={documentation} onChange={(e) => setDocumentation(e.target.value)} rows={3} />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="tags">Tags</Label>
            <Input id="tags" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="Comma-separated" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Merchandising</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-2">
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={isFeatured} onCheckedChange={(v) => setIsFeatured(v === true)} />
            Featured
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={isNewRelease} onCheckedChange={(v) => setIsNewRelease(v === true)} />
            New release
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={isFree} onCheckedChange={(v) => setIsFree(v === true)} />
            Free product
          </label>
          <label className="flex items-center gap-2 text-sm">
            <Checkbox checked={isBundle} onCheckedChange={(v) => setIsBundle(v === true)} />
            Bundle (contains other products)
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>SEO</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="seoTitle">SEO title</Label>
            <Input id="seoTitle" value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="seoDescription">SEO description</Label>
            <Input id="seoDescription" value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-end gap-3">
        <Button type="submit" disabled={isPending}>
          {isPending ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : null}
          {product ? "Save changes" : "Create draft product"}
        </Button>
      </div>
    </form>
  )
}

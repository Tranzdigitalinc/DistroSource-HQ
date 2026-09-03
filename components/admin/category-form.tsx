"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "@/lib/admin-icons"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createCategory, updateCategory, type CategoryFormInput } from "@/lib/actions/admin-categories"

type ExistingCategory = {
  id: number
  slug: string
  name: string
  description: string | null
  icon: string | null
  heroImageUrl: string | null
  sortOrder: number
  seoTitle: string | null
  seoDescription: string | null
  parentId?: number | null
}

type Department = { id: number; name: string }

export function CategoryForm({ category, departments = [] }: { category?: ExistingCategory; departments?: Department[] }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const [name, setName] = useState(category?.name ?? "")
  const [slug, setSlug] = useState(category?.slug ?? "")
  const [description, setDescription] = useState(category?.description ?? "")
  const [icon, setIcon] = useState(category?.icon ?? "")
  const [heroImageUrl, setHeroImageUrl] = useState(category?.heroImageUrl ?? "")
  const [sortOrder, setSortOrder] = useState(category ? String(category.sortOrder) : "0")
  const [seoTitle, setSeoTitle] = useState(category?.seoTitle ?? "")
  const [seoDescription, setSeoDescription] = useState(category?.seoDescription ?? "")
  const [parentId, setParentId] = useState(category?.parentId != null ? String(category.parentId) : "")

  // A department that already has subcategories under it can't itself be
  // reassigned under another department (see resolveParentId server-side).
  const availableDepartments = departments.filter((d) => d.id !== category?.id)

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!name.trim()) {
      toast.error("Category name is required.")
      return
    }

    const input: CategoryFormInput = { name, slug, description, icon, heroImageUrl, sortOrder, seoTitle, seoDescription, parentId }

    startTransition(async () => {
      try {
        if (category) {
          await updateCategory(category.id, input)
          toast.success("Category saved")
        } else {
          await createCategory(input)
          toast.success("Category created")
          router.push("/admin/categories")
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not save this category.")
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder={name ? undefined : "auto-generated from name"} />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="icon">Icon name</Label>
            <Input id="icon" value={icon} onChange={(e) => setIcon(e.target.value)} placeholder="lucide icon name, e.g. Palette" />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="sortOrder">Sort order</Label>
            <Input id="sortOrder" type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="parentId">Parent department</Label>
            <Select value={parentId} onValueChange={(value) => setParentId(value ?? "")}>
              <SelectTrigger id="parentId" className="w-full">
                <SelectValue placeholder="None — this is a top-level department">
                  {(value: string | null) =>
                    value ? availableDepartments.find((d) => String(d.id) === value)?.name ?? "None — this is a top-level department" : "None — this is a top-level department"
                  }
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None — this is a top-level department</SelectItem>
                {availableDepartments.map((d) => (
                  <SelectItem key={d.id} value={String(d.id)}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Leave unset for a broad department (e.g. &quot;Web &amp; Development&quot;). Choose a department to make this a subcategory
              underneath it. Products can only be assigned to subcategories.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:col-span-2">
            <Label htmlFor="heroImageUrl">Hero image URL</Label>
            <Input id="heroImageUrl" value={heroImageUrl} onChange={(e) => setHeroImageUrl(e.target.value)} placeholder="Shown at the top of the category page" />
          </div>
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
          {category ? "Save changes" : "Create category"}
        </Button>
      </div>
    </form>
  )
}

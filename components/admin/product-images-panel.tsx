"use client"

import { useRef, useState, useTransition } from "react"
import Image from "next/image"
import { Loader2, Trash2, Upload } from "@/lib/admin-icons"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { addProductImage, deleteProductImage } from "@/lib/actions/admin-products"

type ProductImage = { id: number; url: string; alt: string | null }

export function ProductImagesPanel({ productId, images }: { productId: number; images: ProductImage[] }) {
  const [isPending, startTransition] = useTransition()
  const [isUploading, setIsUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    if (!file) return
    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", file)
      const res = await fetch("/api/admin/upload", { method: "POST", body: formData })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? "Upload failed")

      startTransition(async () => {
        await addProductImage(productId, data.url, file.name)
        toast.success("Image added")
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload this image.")
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      try {
        await deleteProductImage(id, productId)
        toast.success("Image removed")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not remove this image.")
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preview images</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {images.length === 0 ? (
          <p className="text-sm text-muted-foreground">No preview images yet. At least one is required to publish.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {images.map((image) => (
              <div key={image.id} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
                <Image src={image.url || "/placeholder.svg"} alt={image.alt ?? ""} fill className="object-cover" />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon-sm"
                  className="absolute right-1.5 top-1.5 opacity-0 transition-opacity group-hover:opacity-100"
                  disabled={isPending}
                  onClick={() => handleDelete(image.id)}
                  aria-label="Remove image"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
        <div>
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
          <Button type="button" variant="outline" size="sm" disabled={isUploading} onClick={() => inputRef.current?.click()}>
            {isUploading ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <Upload className="size-3.5" aria-hidden="true" />}
            Upload image
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

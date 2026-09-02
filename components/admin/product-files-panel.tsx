"use client"

import { useRef, useState, useTransition } from "react"
import { File as FileIcon, Loader2, Trash2, Upload } from "@/lib/admin-icons"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { addProductFile, deleteProductFile } from "@/lib/actions/admin-products"

type ProductFile = { id: number; fileName: string; fileSizeBytes: number | null; licenseType: string | null }

function formatBytes(bytes: number | null) {
  if (!bytes) return ""
  const mb = bytes / (1024 * 1024)
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`
}

export function ProductFilesPanel({ productId, files }: { productId: number; files: ProductFile[] }) {
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
        await addProductFile(productId, {
          fileName: data.fileName,
          blobPathname: data.pathname,
          fileSizeBytes: data.fileSizeBytes,
          fileType: data.fileType,
          licenseType: null,
        })
        toast.success("File added")
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not upload this file.")
    } finally {
      setIsUploading(false)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      try {
        await deleteProductFile(id, productId)
        toast.success("File removed")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not remove this file.")
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Downloadable files</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {files.length === 0 ? (
          <p className="text-sm text-muted-foreground">No files yet. At least one is required to publish.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {files.map((file) => (
              <li key={file.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileIcon className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                  <span className="truncate text-sm font-medium">{file.fileName}</span>
                  {file.fileSizeBytes ? <span className="shrink-0 text-xs text-muted-foreground">{formatBytes(file.fileSizeBytes)}</span> : null}
                </div>
                <Button type="button" variant="destructive" size="icon-sm" disabled={isPending} onClick={() => handleDelete(file.id)} aria-label="Remove file">
                  <Trash2 className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <div>
          <input ref={inputRef} type="file" className="hidden" onChange={handleFileChange} />
          <Button type="button" variant="outline" size="sm" disabled={isUploading} onClick={() => inputRef.current?.click()}>
            {isUploading ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <Upload className="size-3.5" aria-hidden="true" />}
            Upload file
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

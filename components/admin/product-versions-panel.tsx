"use client"

import { useState, useTransition } from "react"
import { Loader2, Plus, Trash2 } from "@/lib/admin-icons"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { addProductVersion, deleteProductVersion } from "@/lib/actions/admin-products"

type Version = { id: number; version: string; changelog: string | null; releasedAt: Date }

export function ProductVersionsPanel({ productId, versions }: { productId: number; versions: Version[] }) {
  const [isPending, startTransition] = useTransition()
  const [version, setVersion] = useState("")
  const [changelog, setChangelog] = useState("")

  function handleAdd() {
    if (!version.trim()) {
      toast.error("A version number is required.")
      return
    }
    startTransition(async () => {
      try {
        await addProductVersion(productId, { version: version.trim(), changelog })
        setVersion("")
        setChangelog("")
        toast.success("Version published — this is now the current version.")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not add this version.")
      }
    })
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      try {
        await deleteProductVersion(id, productId)
        toast.success("Version entry removed")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not remove this version.")
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Version history</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {versions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No version history yet.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {versions.map((v) => (
              <li key={v.id} className="flex items-start justify-between gap-3 rounded-lg border border-border px-3 py-2">
                <div>
                  <p className="text-sm font-medium">
                    v{v.version} <span className="text-xs text-muted-foreground">— {v.releasedAt.toLocaleDateString()}</span>
                  </p>
                  {v.changelog ? <p className="mt-0.5 text-xs text-muted-foreground">{v.changelog}</p> : null}
                </div>
                <Button type="button" variant="destructive" size="icon-sm" disabled={isPending} onClick={() => handleDelete(v.id)} aria-label="Remove version entry">
                  <Trash2 className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <div className="grid gap-3 sm:grid-cols-[1fr_2fr_auto] sm:items-end">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="version-number" className="text-xs">Version</Label>
            <Input id="version-number" value={version} onChange={(e) => setVersion(e.target.value)} placeholder="e.g. 1.1.0" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="version-changelog" className="text-xs">Changelog</Label>
            <Textarea id="version-changelog" value={changelog} onChange={(e) => setChangelog(e.target.value)} rows={1} placeholder="What changed" />
          </div>
          <Button type="button" size="sm" disabled={isPending} onClick={handleAdd}>
            {isPending ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <Plus className="size-3.5" aria-hidden="true" />}
            Publish
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

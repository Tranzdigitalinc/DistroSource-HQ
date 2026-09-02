"use client"

import { useState, useTransition } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { setBundleContents } from "@/lib/actions/admin-products"

export function BundleContentsPanel({
  productId,
  allProducts,
  selectedIds,
}: {
  productId: number
  allProducts: { id: number; name: string }[]
  selectedIds: number[]
}) {
  const [selected, setSelected] = useState<Set<number>>(new Set(selectedIds))
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<string | null>(null)

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function handleSave() {
    setMessage(null)
    startTransition(async () => {
      try {
        await setBundleContents(productId, Array.from(selected))
        setMessage("Bundle contents saved.")
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Failed to save bundle contents.")
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bundle contents</CardTitle>
        <CardDescription>Choose which products are included when a customer buys this bundle.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="grid gap-2 sm:grid-cols-2">
          {allProducts.map((p) => (
            <Label key={p.id} className="flex items-center gap-2 rounded-lg border border-border p-3 text-sm font-normal">
              <Checkbox checked={selected.has(p.id)} onCheckedChange={() => toggle(p.id)} />
              {p.name}
            </Label>
          ))}
          {allProducts.length === 0 ? <p className="text-sm text-muted-foreground">No other products available to include.</p> : null}
        </div>
        <div className="flex items-center gap-3">
          <Button type="button" onClick={handleSave} disabled={isPending}>
            {isPending ? "Saving..." : "Save bundle contents"}
          </Button>
          {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
        </div>
      </CardContent>
    </Card>
  )
}

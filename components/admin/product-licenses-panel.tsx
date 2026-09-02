"use client"

import { useState, useTransition } from "react"
import { Loader2, Plus, Trash2 } from "@/lib/admin-icons"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { addProductLicense, deleteProductLicense } from "@/lib/actions/admin-products"

type License = { id: number; licenseType: string; price: string; description: string | null }

export function ProductLicensesPanel({ productId, licenses }: { productId: number; licenses: License[] }) {
  const [isPending, startTransition] = useTransition()
  const [licenseType, setLicenseType] = useState("")
  const [price, setPrice] = useState("")
  const [description, setDescription] = useState("")

  function handleAdd() {
    if (!licenseType.trim() || !price.trim()) {
      toast.error("License name and price are required.")
      return
    }
    startTransition(async () => {
      try {
        await addProductLicense(productId, { licenseType: licenseType.trim(), price, description })
        setLicenseType("")
        setPrice("")
        setDescription("")
        toast.success("License added")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not add this license.")
      }
    })
  }

  function handleDelete(id: number) {
    startTransition(async () => {
      try {
        await deleteProductLicense(id, productId)
        toast.success("License removed")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not remove this license.")
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>License tiers</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {licenses.length === 0 ? (
          <p className="text-sm text-muted-foreground">No license tiers yet — the base price will be used at checkout.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {licenses.map((license) => (
              <li key={license.id} className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2">
                <div>
                  <p className="text-sm font-medium capitalize">{license.licenseType.replace(/_/g, " ")}</p>
                  <p className="text-xs text-muted-foreground">
                    ${license.price}
                    {license.description ? ` — ${license.description}` : ""}
                  </p>
                </div>
                <Button type="button" variant="destructive" size="icon-sm" disabled={isPending} onClick={() => handleDelete(license.id)} aria-label="Remove license">
                  <Trash2 className="size-3.5" />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_2fr_auto] sm:items-end">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="license-type" className="text-xs">License name</Label>
            <Input id="license-type" value={licenseType} onChange={(e) => setLicenseType(e.target.value)} placeholder="e.g. Personal, Team" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="license-price" className="text-xs">Price (USD)</Label>
            <Input id="license-price" type="number" min="0" step="0.01" value={price} onChange={(e) => setPrice(e.target.value)} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="license-description" className="text-xs">Description</Label>
            <Input id="license-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional" />
          </div>
          <Button type="button" size="sm" disabled={isPending} onClick={handleAdd}>
            {isPending ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <Plus className="size-3.5" aria-hidden="true" />}
            Add
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Plus } from "@/lib/admin-icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { createCollectionDraft } from "@/lib/actions/admin-collections"

export function CreateCollectionDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleCreate() {
    setIsSubmitting(true)
    try {
      const id = await createCollectionDraft(name)
      toast.success("Bundle created", { description: "Add items and licenses to publish it." })
      setOpen(false)
      setName("")
      router.push(`/admin/products/${id}`)
    } catch (error) {
      toast.error("Could not create bundle", { description: error instanceof Error ? error.message : undefined })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" size="sm" className="gap-2" />}>
        <Plus className="h-4 w-4" />
        New bundle
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new bundle</DialogTitle>
          <DialogDescription>
            Bundles are products that package multiple items together. You&apos;ll add items, pricing, and images on
            the next screen.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="bundle-name">Bundle name</Label>
          <Input
            id="bundle-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Complete Frontend Starter Pack"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isSubmitting || !name.trim()}>
            {isSubmitting ? "Creating…" : "Create bundle"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

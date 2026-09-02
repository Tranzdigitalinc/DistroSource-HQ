"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { deleteProduct } from "@/lib/actions/admin-products"

export function DeleteProductButton({ productId, productName, redirectTo }: { productId: number; productName: string; redirectTo?: string }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    startTransition(async () => {
      try {
        await deleteProduct(productId)
        toast.success(`${productName} deleted`)
        setOpen(false)
        if (redirectTo) router.push(redirectTo)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not delete this product.")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant="destructive" size="sm" />}>Delete</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {productName}?</DialogTitle>
          <DialogDescription>
            This permanently removes the product, its images, files, licenses, and version history. Existing orders and
            entitlements referencing it are unaffected. This cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <Button type="button" variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : null}
            Delete product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

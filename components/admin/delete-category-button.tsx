"use client"

import { useState, useTransition } from "react"
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
import { deleteCategory } from "@/lib/actions/admin-categories"

export function DeleteCategoryButton({ categoryId, categoryName, productCount }: { categoryId: number; categoryName: string; productCount: number }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    startTransition(async () => {
      try {
        await deleteCategory(categoryId)
        toast.success(`${categoryName} deleted`)
        setOpen(false)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not delete this category.")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant="ghost" size="sm" />}>Delete</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {categoryName}?</DialogTitle>
          <DialogDescription>
            {productCount > 0
              ? `This category has ${productCount} product${productCount === 1 ? "" : "s"} assigned to it. Move or delete them before deleting this category.`
              : "This permanently removes the category. This cannot be undone."}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <Button type="button" variant="destructive" onClick={handleConfirm} disabled={isPending || productCount > 0}>
            {isPending ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : null}
            Delete category
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

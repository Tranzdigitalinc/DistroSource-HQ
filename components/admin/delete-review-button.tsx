"use client"

import { useState, useTransition } from "react"
import { Loader2, Trash2 } from "@/lib/admin-icons"
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
import { deleteReview } from "@/lib/actions/admin-reviews"

export function DeleteReviewButton({ reviewId }: { reviewId: number }) {
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    startTransition(async () => {
      try {
        await deleteReview(reviewId)
        toast.success("Review removed")
        setOpen(false)
      } catch {
        toast.error("Could not remove this review.")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" />}>
        <Trash2 className="h-4 w-4" />
        <span className="sr-only">Remove review</span>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove this review?</DialogTitle>
          <DialogDescription>This permanently deletes the review from the product page. This cannot be undone.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <Button type="button" variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : null}
            Remove review
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

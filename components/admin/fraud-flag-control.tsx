"use client"

import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
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
import { flagOrderForFraud, clearFraudFlag } from "@/lib/actions/order-management"

export function FraudFlagControl({ orderId, isFlagged }: { orderId: number; isFlagged: boolean }) {
  const [note, setNote] = useState("")
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleFlag() {
    startTransition(async () => {
      try {
        await flagOrderForFraud(orderId, note)
        toast.success("Order flagged for fraud review")
        setOpen(false)
        setNote("")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not flag this order.")
      }
    })
  }

  function handleClear() {
    startTransition(async () => {
      try {
        await clearFraudFlag(orderId)
        toast.success("Fraud flag cleared")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not clear this flag.")
      }
    })
  }

  if (isFlagged) {
    return (
      <Button type="button" variant="outline" size="sm" onClick={handleClear} disabled={isPending}>
        {isPending ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : null}
        Clear fraud flag
      </Button>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant="outline" size="sm" />}>
        Flag as fraud
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Flag order for fraud review</DialogTitle>
          <DialogDescription>Add an optional note explaining why this order looks suspicious. It will appear in the fraud queue.</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="fraud-note">Note (optional)</Label>
          <Textarea id="fraud-note" value={note} onChange={(event) => setNote(event.target.value)} placeholder="e.g. Unusually large order, new account" />
        </div>
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <Button type="button" onClick={handleFlag} disabled={isPending}>
            {isPending ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : null}
            Flag order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

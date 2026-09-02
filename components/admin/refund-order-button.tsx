"use client"

import { useState, useTransition } from "react"
import { Loader2 } from "@/lib/admin-icons"
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
import { refundOrder } from "@/lib/actions/order-management"

export function RefundOrderButton({ orderId, orderNumber, totalUsd }: { orderId: number; orderNumber: string; totalUsd: string }) {
  const [reason, setReason] = useState("")
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleConfirm() {
    startTransition(async () => {
      try {
        await refundOrder(orderId, reason)
        toast.success("Order refunded", { description: `Order ${orderNumber} marked as refunded and download access revoked.` })
        setOpen(false)
        setReason("")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not refund this order.")
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button type="button" variant="destructive" size="sm" />}>
        Refund order
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Refund order {orderNumber}</DialogTitle>
          <DialogDescription>
            This marks the ${totalUsd} order as refunded, revokes the customer&apos;s download access to every item in the order, and emails a refund confirmation. No payment is actually processed — this app has no live payment gateway.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <Label htmlFor="refund-reason">Reason (optional)</Label>
          <Textarea id="refund-reason" value={reason} onChange={(event) => setReason(event.target.value)} placeholder="e.g. Customer requested cancellation" />
        </div>
        <DialogFooter>
          <DialogClose render={<Button type="button" variant="outline" />}>Cancel</DialogClose>
          <Button type="button" variant="destructive" onClick={handleConfirm} disabled={isPending}>
            {isPending ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : null}
            Confirm refund
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

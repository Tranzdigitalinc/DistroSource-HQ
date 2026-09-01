"use client"

import { useTransition } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { replaceOrderItem } from "@/lib/actions/order-management"

export function ReplaceItemButton({ orderItemId }: { orderItemId: number }) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      try {
        await replaceOrderItem(orderItemId)
        toast.success("Replacement code issued", { description: "The old code was voided and the customer was emailed a new one." })
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not issue a replacement code.")
      }
    })
  }

  return (
    <Button type="button" size="sm" variant="outline" onClick={handleClick} disabled={isPending}>
      {isPending ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <RefreshCw className="size-3.5" aria-hidden="true" />}
      Replace code
    </Button>
  )
}

"use client"

import { useState, useTransition } from "react"
import { Loader2, PackagePlus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { restockVariant } from "@/lib/actions/inventory"

export function RestockButton({ variantId }: { variantId: number }) {
  const [amount, setAmount] = useState("100")
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    const parsed = Number.parseInt(amount, 10)
    if (!Number.isFinite(parsed) || parsed <= 0) {
      toast.error("Enter a positive restock amount.")
      return
    }
    startTransition(async () => {
      try {
        const result = await restockVariant(variantId, parsed)
        toast.success("Variant restocked", { description: `New stock count: ${result.newStockCount}` })
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not restock this variant.")
      }
    })
  }

  return (
    <div className="flex items-center gap-2">
      <Input
        type="number"
        min={1}
        value={amount}
        onChange={(event) => setAmount(event.target.value)}
        className="h-9 w-20"
        aria-label="Restock amount"
      />
      <Button type="button" size="sm" variant="outline" onClick={handleClick} disabled={isPending}>
        {isPending ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <PackagePlus className="size-3.5" aria-hidden="true" />}
        Restock
      </Button>
    </div>
  )
}

"use client"

import { useTransition } from "react"
import { Loader2 } from "@/lib/admin-icons"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { toggleAffiliateCode } from "@/lib/actions/affiliates"

export function ToggleAffiliateButton({ id, isActive }: { id: number; isActive: boolean }) {
  const [isPending, startTransition] = useTransition()

  function handleToggle() {
    startTransition(async () => {
      try {
        await toggleAffiliateCode(id, !isActive)
        toast.success(isActive ? "Affiliate code deactivated" : "Affiliate code activated")
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not update this code.")
      }
    })
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleToggle} disabled={isPending}>
      {isPending ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : null}
      {isActive ? "Deactivate" : "Activate"}
    </Button>
  )
}

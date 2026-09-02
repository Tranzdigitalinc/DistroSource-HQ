"use client"

import { useTransition } from "react"
import { RotateCw, Loader2 } from "@/lib/admin-icons"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { retryOperationEvent } from "@/lib/actions/operations"

export function RetryEventButton({ eventId }: { eventId: number }) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      try {
        const result = await retryOperationEvent(eventId)
        if (result.success) {
          toast.success("Retry succeeded", { description: "The event has been resolved." })
        } else {
          toast.error("Retry failed", { description: result.failureReason || "The operation could not be completed." })
        }
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not retry this event.")
      }
    })
  }

  return (
    <Button type="button" size="sm" variant="outline" onClick={handleClick} disabled={isPending}>
      {isPending ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <RotateCw className="size-3.5" aria-hidden="true" />}
      Retry
    </Button>
  )
}

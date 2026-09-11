"use client"

import { useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { cancelMyMembership } from "@/lib/actions/subscriptions"

/**
 * Cancel control for an active membership. Cancels at period end (server
 * default) so the member keeps their benefits until the cycle they've paid
 * for runs out; the webhook flips the status when it actually lapses.
 */
export function CancelMembershipButton({ periodEndLabel }: { periodEndLabel: string | null }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelMyMembership()
      if ("error" in result) {
        toast.error(result.error)
        return
      }
      toast.success("Your membership will end at the close of this billing period.")
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button variant="outline" className="rounded-full bg-transparent font-semibold">
            Cancel membership
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel your membership?</AlertDialogTitle>
          <AlertDialogDescription>
            You&apos;ll keep every membership benefit{periodEndLabel ? ` until ${periodEndLabel}` : " until the end of your current billing period"}.
            After that, your discount and credits stop and you won&apos;t be charged again. You can resubscribe anytime.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="ghost">Keep membership</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleCancel} disabled={isPending} aria-busy={isPending}>
            {isPending ? "Cancelling…" : "Cancel at period end"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

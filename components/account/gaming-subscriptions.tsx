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
import { cancelMyGamingSubscription } from "@/lib/actions/gaming-subscriptions"

/**
 * Cancel control for one active Gaming subscription. Cancels at period end,
 * so the subscriber keeps what they paid for; the webhook records the lapse.
 */
export function CancelGamingSubscriptionButton({
  reference,
  title,
  periodEndLabel,
}: {
  reference: string
  title: string
  periodEndLabel: string | null
}) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleCancel() {
    startTransition(async () => {
      const result = await cancelMyGamingSubscription(reference)
      if ("error" in result) {
        toast.error(result.error)
        return
      }
      toast.success(`${title} will end at the close of this billing period.`)
      setOpen(false)
      router.refresh()
    })
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger
        render={
          <Button variant="outline" size="sm" className="rounded-full bg-transparent font-semibold">
            Cancel
          </Button>
        }
      />
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel {title}?</AlertDialogTitle>
          <AlertDialogDescription>
            You&apos;ll keep access{periodEndLabel ? ` until ${periodEndLabel}` : " until the end of your current billing period"}, and you
            won&apos;t be charged again. You can subscribe again anytime.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="ghost">Keep subscription</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleCancel} disabled={isPending} aria-busy={isPending}>
            {isPending ? "Cancelling…" : "Cancel at period end"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

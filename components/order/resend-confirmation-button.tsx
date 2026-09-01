"use client"

import { useTransition } from "react"
import { Mail, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { resendOrderConfirmationEmail } from "@/lib/actions/account"

export function ResendConfirmationButton({ orderNumber }: { orderNumber: string }) {
  const [isPending, startTransition] = useTransition()

  function handleClick() {
    startTransition(async () => {
      try {
        await resendOrderConfirmationEmail(orderNumber)
        toast.success("Confirmation email sent", { description: "Check your inbox for your order details and codes." })
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not resend the confirmation email.")
      }
    })
  }

  return (
    <Button type="button" variant="outline" size="sm" onClick={handleClick} disabled={isPending}>
      {isPending ? <Loader2 className="size-3.5 animate-spin" aria-hidden="true" /> : <Mail className="size-3.5" aria-hidden="true" />}
      Resend confirmation email
    </Button>
  )
}

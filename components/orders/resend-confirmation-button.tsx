"use client"

import { useTransition } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { resendOrderConfirmation } from "@/lib/actions/orders"

export function ResendConfirmationButton({ orderNumber }: { orderNumber: string }) {
  const [pending, startTransition] = useTransition()
  return <Button variant="outline" size="sm" disabled={pending} onClick={() => startTransition(async () => { try { await resendOrderConfirmation(orderNumber); toast.success("Confirmation email sent") } catch (error) { toast.error(error instanceof Error ? error.message : "Could not resend email") } })}>{pending ? "Sending…" : "Resend confirmation"}</Button>
}

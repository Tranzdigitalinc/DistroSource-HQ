"use client"

import { useState } from "react"
import { MailWarning, X } from "lucide-react"
import { authClient, useSession } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

/**
 * Persistent (not permanently dismissible) nudge shown to any signed-in user
 * whose email isn't verified yet. Verification is never enforced at sign-in
 * or checkout (see lib/auth.ts) — this banner is the only place we ask for
 * it. Dismissing hides it for the current page load only; it reappears on
 * the next navigation/reload until the user actually verifies.
 */
export function VerifyEmailBanner() {
  const { data: session, isPending } = useSession()
  const [dismissed, setDismissed] = useState(false)
  const [sending, setSending] = useState(false)

  if (isPending || !session?.user || session.user.emailVerified || dismissed) return null

  async function handleResend() {
    setSending(true)
    const { error } = await authClient.sendVerificationEmail({
      email: session!.user.email,
      callbackURL: "/",
    })
    setSending(false)
    if (error) {
      toast.error("Couldn't send the verification email. Please try again shortly.")
      return
    }
    toast.success("Verification email sent — check your inbox.")
  }

  return (
    <div className="flex items-center justify-center gap-3 bg-accent px-4 py-2.5 text-sm text-accent-foreground">
      <MailWarning className="hidden size-4 shrink-0 sm:block" aria-hidden="true" />
      <p className="text-balance text-center leading-snug">
        Please verify <span className="font-medium">{session.user.email}</span> to secure your account.
      </p>
      <Button
        type="button"
        variant="link"
        size="sm"
        className="h-auto min-h-11 shrink-0 whitespace-nowrap p-0 text-accent-foreground underline sm:min-h-0"
        onClick={handleResend}
        disabled={sending}
      >
        {sending ? "Sending…" : "Resend email"}
      </Button>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss verification reminder"
        className="flex size-11 shrink-0 items-center justify-center text-accent-foreground/70 hover:text-accent-foreground sm:size-6"
      >
        <X className="size-4" aria-hidden="true" />
      </button>
    </div>
  )
}

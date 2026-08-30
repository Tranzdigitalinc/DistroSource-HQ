"use client"

import { useState } from "react"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ExternalLink } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [resetUrl, setResetUrl] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await authClient.forgetPassword({ email, redirectTo: "/reset-password" })

    const res = await fetch(`/api/dev/reset-link?email=${encodeURIComponent(email)}`)
    const data = await res.json()
    setResetUrl(data.url ?? null)
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter the email on your account and we'll generate a reset link."
    >
      {!submitted ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Email address</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
            />
          </div>
          <Button type="submit" disabled={loading} className="h-11 font-semibold">
            {loading && <Loader2 className="size-4 animate-spin" />}
            Send reset link
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/sign-in" className="font-medium text-primary hover:underline">
              Back to sign in
            </Link>
          </p>
        </form>
      ) : (
        <div className="flex flex-col gap-4">
          <Alert>
            <AlertDescription>
              RedeemCove doesn&apos;t send real emails in this demo. Since no email provider is connected, your
              reset link is shown below instead of being emailed.
            </AlertDescription>
          </Alert>
          {resetUrl ? (
            <Link
              href={resetUrl}
              className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-3 text-sm font-medium text-primary hover:underline"
            >
              <ExternalLink className="size-4 shrink-0" />
              <span className="truncate">{resetUrl}</span>
            </Link>
          ) : (
            <p className="text-sm text-muted-foreground">
              If an account exists for that email, a reset link has been generated. If nothing appears, double
              check the address and try again.
            </p>
          )}
        </div>
      )}
    </AuthShell>
  )
}

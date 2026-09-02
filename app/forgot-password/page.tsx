"use client"

import { useState } from "react"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, MailCheck } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await authClient.requestPasswordReset({ email, redirectTo: "/reset-password" })
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter the email on your account and we'll send you a reset link."
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
              autoComplete="email"
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
            <MailCheck className="size-4" />
            <AlertDescription>
              If an account exists for <span className="font-medium text-foreground">{email}</span>, we&apos;ve
              sent a password reset link to that address. The link expires in 15 minutes.
            </AlertDescription>
          </Alert>
          <p className="text-sm text-muted-foreground">
            Didn&apos;t get an email? Check your spam folder, or{" "}
            <Link href="/contact" className="font-medium text-primary hover:underline">
              contact support
            </Link>{" "}
            for help.
          </p>
          <p className="text-center text-sm text-muted-foreground">
            <Link href="/sign-in" className="font-medium text-primary hover:underline">
              Back to sign in
            </Link>
          </p>
        </div>
      )}
    </AuthShell>
  )
}

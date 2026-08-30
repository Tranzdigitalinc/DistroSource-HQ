"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { AuthShell } from "@/components/auth/auth-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2 } from "lucide-react"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!token) {
      setError("This reset link is invalid or has expired.")
      return
    }
    setLoading(true)
    const result = await authClient.resetPassword({ newPassword: password, token })
    setLoading(false)

    if (result.error) {
      setError("This reset link is invalid or has expired. Please request a new one.")
      return
    }

    setSuccess(true)
    setTimeout(() => router.push("/sign-in"), 1500)
  }

  return (
    <AuthShell title="Set a new password" subtitle="Choose a new password for your RedeemCove account.">
      {success ? (
        <Alert>
          <AlertDescription>Password updated. Redirecting you to sign in...</AlertDescription>
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="••••••••"
            />
          </div>
          <Button type="submit" disabled={loading} className="h-11 font-semibold">
            {loading && <Loader2 className="size-4 animate-spin" />}
            Update password
          </Button>
        </form>
      )}
    </AuthShell>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  )
}

"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { authClient } from "@/lib/auth-client"
import { mergeGuestActivityIntoAccount } from "@/lib/actions/recently-viewed"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Loader2, MailCheck } from "@/lib/storefront-icons"

export function AuthForm({ mode, redirectTo: providedRedirectTo }: { mode: "sign-in" | "sign-up"; redirectTo?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = providedRedirectTo || searchParams.get("redirect") || searchParams.get("next") || "/account"
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [verificationSent, setVerificationSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!email.trim() || !email.includes("@")) {
      setError("Enter a valid email address.")
      return
    }
    if (password.length < 8) {
      setError("Your password must be at least 8 characters.")
      return
    }
    if (mode === "sign-up" && name.trim().length < 2) {
      setError("Enter your full name to continue.")
      return
    }
    setLoading(true)

    const result =
      mode === "sign-up"
        ? await authClient.signUp.email({ email, password, name })
        : await authClient.signIn.email({ email, password })

    setLoading(false)

    if (result.error) {
      const isUnverified = result.error.code === "EMAIL_NOT_VERIFIED"
      setError(
        mode === "sign-up"
          ? "Could not create your account. Please check your details and try again."
          : isUnverified
            ? "Please verify your email before signing in."
            : "Invalid email or password.",
      )
      if (isUnverified) setVerificationSent(false)
      return
    }

    if (mode === "sign-up") {
      setVerificationSent(true)
      return
    }

    await mergeGuestActivityIntoAccount()
    // Route Handlers (e.g. /api/cart/recover) issue their own redirect once
    // hit — a full navigation is required so the browser actually requests
    // them, rather than the client router trying to soft-navigate to them.
    if (redirectTo.startsWith("/api/")) {
      window.location.href = redirectTo
      return
    }
    router.push(redirectTo)
    router.refresh()
  }

  async function resendVerification() {
    setResending(true)
    const result = await authClient.sendVerificationEmail({
      email,
      callbackURL: redirectTo,
    })
    setResending(false)
    if (result.error) {
      setError("We could not resend the verification email. Please try again shortly.")
      return
    }
    setVerificationSent(true)
  }

  if (verificationSent && mode === "sign-up") {
    return (
      <div className="flex flex-col gap-5 text-center">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
          <MailCheck className="size-7" aria-hidden="true" />
        </div>
        <div className="flex flex-col gap-2">
          <h2 className="text-lg font-semibold">Check your inbox</h2>
          <p className="text-sm leading-relaxed text-muted-foreground">We sent a verification link to <strong className="text-foreground">{email}</strong>. Verify it to activate your DistroSource account.</p>
        </div>
        <Button type="button" variant="outline" onClick={resendVerification} disabled={resending} className="h-11 font-semibold">
          {resending && <Loader2 className="size-4 animate-spin" />}
          {resending ? "Sending..." : "Resend verification email"}
        </Button>
        <Link href="/sign-in" className="text-sm font-medium text-primary hover:underline">Back to sign in</Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {mode === "sign-up" && (
        <div className="flex flex-col gap-2">
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            autoComplete="name"
            placeholder="Jordan Rivera"
          />
        </div>
      )}

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

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          {mode === "sign-in" && (
            <Link href="/forgot-password" className="text-xs font-medium text-primary hover:underline">
              Forgot password?
            </Link>
          )}
        </div>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
            placeholder="••••••••"
            className="pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword((visible) => !visible)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {showPassword ? <EyeOff className="size-4" aria-hidden="true" /> : <Eye className="size-4" aria-hidden="true" />}
          </button>
        </div>
      </div>

      <Button type="submit" disabled={loading} className="mt-1 h-11 font-semibold">
        {loading && <Loader2 className="size-4 animate-spin" />}
        {mode === "sign-up" ? "Create account" : "Sign in"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {mode === "sign-up" ? (
          <>
            Already have an account?{" "}
            <Link href="/sign-in" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </>
        ) : (
          <>
            New to DistroSource?{" "}
            <Link href="/sign-up" className="font-medium text-primary hover:underline">
              Create an account
            </Link>
          </>
        )}
      </p>
    </form>
  )
}

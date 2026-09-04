"use client"

import { useId, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { toast } from "sonner"
import { authClient } from "@/lib/auth-client"
import { mergeGuestActivityIntoAccount } from "@/lib/actions/recently-viewed"
import { mergeGuestCartIntoAccount } from "@/lib/actions/cart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, Eye, EyeOff, Loader2, ICON_SIZE } from "@/lib/storefront-icons"
import { cn } from "@/lib/utils"

const MIN_PASSWORD = 8
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type Field = "name" | "email" | "password" | "confirm" | "agreed"

/** 0–3: length, mixed case or digits, symbols/length 12+. Guidance only — the server enforces the minimum. */
function strength(pw: string) {
  let s = 0
  if (pw.length >= MIN_PASSWORD) s++
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++
  else if (/\d/.test(pw) && /[a-zA-Z]/.test(pw)) s++
  if (pw.length >= 12 || /[^A-Za-z0-9]/.test(pw)) s++
  return Math.min(3, s)
}
const STRENGTH_LABEL = ["Too short", "Weak", "Good", "Strong"]

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="flex items-center gap-1.5 text-xs text-destructive" role="alert">
      <AlertCircle size={12} aria-hidden="true" />
      {message}
    </p>
  )
}

export function AuthForm({ mode, redirectTo: providedRedirectTo }: { mode: "sign-in" | "sign-up"; redirectTo?: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = providedRedirectTo || searchParams.get("redirect") || searchParams.get("next") || "/account"
  const uid = useId()
  const isSignUp = mode === "sign-up"

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [remember, setRemember] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const errors: Partial<Record<Field, string>> = {}
  if (isSignUp && name.trim().length < 2) errors.name = "Enter your full name."
  if (!EMAIL.test(email.trim())) errors.email = "Enter a valid email address."
  if (password.length < MIN_PASSWORD) errors.password = `Use at least ${MIN_PASSWORD} characters.`
  if (isSignUp && confirm !== password) errors.confirm = "Passwords don't match."
  if (isSignUp && !agreed) errors.agreed = "Please accept the Terms and Privacy Policy."
  const show = (f: Field) => (touched[f] ? errors[f] : undefined)
  const touch = (f: Field) => setTouched((t) => ({ ...t, [f]: true }))

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setFormError(null)
    setTouched({ name: true, email: true, password: true, confirm: true, agreed: true })
    if (Object.keys(errors).length > 0) return
    setLoading(true)

    const result = isSignUp
      ? await authClient.signUp.email({ email: email.trim(), password, name: name.trim() })
      : await authClient.signIn.email({ email: email.trim(), password, rememberMe: remember })

    if (result.error) {
      setLoading(false)
      const code = result.error.code
      setFormError(
        isSignUp
          ? code === "USER_ALREADY_EXISTS"
            ? "An account with this email already exists. Try signing in instead."
            : "We couldn't create your account. Check your details and try again."
          : code === "EMAIL_NOT_VERIFIED"
            ? "Please verify your email before signing in. Check your inbox for the link."
            : "That email and password don't match our records.",
      )
      return
    }

    // Auto-login on signup: the server already created a session for this
    // account (autoSignIn + requireEmailVerification: false), so a brand-new
    // user continues straight into the app instead of hitting a "confirm
    // your email" wall. The site-wide VerifyEmailBanner keeps nudging them
    // to verify without blocking anything.
    if (isSignUp) {
      toast.success("Account created", { description: `We sent a verification link to ${email.trim()}.` })
    }

    // A guest who added to cart, then signed in, keeps that cart.
    await Promise.all([mergeGuestCartIntoAccount(), mergeGuestActivityIntoAccount()])
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

  const pwStrength = strength(password)

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      {formError && (
        <p className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive" role="alert">
          <AlertCircle size={ICON_SIZE.sm} className="mt-0.5 shrink-0" aria-hidden="true" />
          {formError}
        </p>
      )}

      {isSignUp && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${uid}-name`}>Full name</Label>
          <Input
            id={`${uid}-name`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => touch("name")}
            autoComplete="name"
            aria-invalid={!!show("name")}
            aria-describedby={show("name") ? `${uid}-name-err` : undefined}
            inputSize="lg"
          />
          <FieldError id={`${uid}-name-err`} message={show("name")} />
        </div>
      )}

      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`${uid}-email`}>Email</Label>
        <Input
          id={`${uid}-email`}
          type="email"
          inputMode="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onBlur={() => touch("email")}
          autoComplete="email"
          aria-invalid={!!show("email")}
          aria-describedby={show("email") ? `${uid}-email-err` : undefined}
          inputSize="lg"
        />
        <FieldError id={`${uid}-email-err`} message={show("email")} />
      </div>

      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <Label htmlFor={`${uid}-password`}>Password</Label>
          {!isSignUp && (
            <Link href="/forgot-password" className="text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              Forgot password?
            </Link>
          )}
        </div>
        <div className="relative">
          <Input
            id={`${uid}-password`}
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => touch("password")}
            autoComplete={isSignUp ? "new-password" : "current-password"}
            aria-invalid={!!show("password")}
            aria-describedby={isSignUp ? `${uid}-pw-help` : show("password") ? `${uid}-pw-err` : undefined}
            inputSize="lg"
            className="pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {showPassword ? <EyeOff size={ICON_SIZE.sm} aria-hidden="true" /> : <Eye size={ICON_SIZE.sm} aria-hidden="true" />}
          </button>
        </div>
        {isSignUp ? (
          <div id={`${uid}-pw-help`} className="flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    password.length === 0 ? "bg-border" : i < pwStrength ? (pwStrength >= 3 ? "bg-success" : pwStrength === 2 ? "bg-accent" : "bg-destructive") : "bg-border",
                  )}
                />
              ))}
            </div>
            <p className={cn("text-xs", show("password") ? "text-destructive" : "text-muted-foreground")}>
              {password.length === 0
                ? `At least ${MIN_PASSWORD} characters. Mixing letters, numbers and symbols makes it stronger.`
                : `${STRENGTH_LABEL[pwStrength]}${pwStrength < 1 ? ` — at least ${MIN_PASSWORD} characters` : ""}`}
            </p>
          </div>
        ) : (
          <FieldError id={`${uid}-pw-err`} message={show("password")} />
        )}
      </div>

      {isSignUp && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`${uid}-confirm`}>Confirm password</Label>
          <Input
            id={`${uid}-confirm`}
            type={showPassword ? "text" : "password"}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            onBlur={() => touch("confirm")}
            autoComplete="new-password"
            aria-invalid={!!show("confirm")}
            aria-describedby={show("confirm") ? `${uid}-confirm-err` : undefined}
            inputSize="lg"
          />
          <FieldError id={`${uid}-confirm-err`} message={show("confirm")} />
        </div>
      )}

      {isSignUp ? (
        <div className="flex flex-col gap-1.5">
          <label className="flex items-start gap-2.5 text-sm leading-relaxed text-muted-foreground">
            <Checkbox
              checked={agreed}
              onCheckedChange={(v) => {
                setAgreed(Boolean(v))
                touch("agreed")
              }}
              className="mt-0.5"
              aria-invalid={!!show("agreed")}
              aria-describedby={show("agreed") ? `${uid}-agreed-err` : undefined}
            />
            <span>
              I agree to the{" "}
              <Link href="/legal/terms" className="font-medium text-foreground underline-offset-4 hover:underline">Terms of Service</Link>{" "}
              and{" "}
              <Link href="/legal/privacy" className="font-medium text-foreground underline-offset-4 hover:underline">Privacy Policy</Link>.
            </span>
          </label>
          <FieldError id={`${uid}-agreed-err`} message={show("agreed")} />
        </div>
      ) : (
        <label className="flex items-center gap-2.5 text-sm text-muted-foreground">
          <Checkbox checked={remember} onCheckedChange={(v) => setRemember(Boolean(v))} />
          Keep me signed in on this device
        </label>
      )}

      {/* Fixed height + inline spinner: the button never changes size while loading. */}
      <Button type="submit" size="lg" disabled={loading} aria-busy={loading} className="mt-1 font-semibold">
        <span className="relative flex items-center justify-center">
          <span className={cn("flex items-center gap-2 transition-opacity", loading && "opacity-0")}>
            {isSignUp ? "Create account" : "Sign in"}
          </span>
          {loading && (
            <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
              <Loader2 size={ICON_SIZE.base} className="animate-spin" />
            </span>
          )}
        </span>
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {isSignUp ? (
          <>
            Already registered?{" "}
            <Link href="/sign-in" className="font-semibold text-foreground underline-offset-4 hover:underline">Sign in</Link>
          </>
        ) : (
          <>
            New to DistroSource?{" "}
            <Link href="/sign-up" className="font-semibold text-foreground underline-offset-4 hover:underline">Create an account</Link>
          </>
        )}
      </p>
    </form>
  )
}

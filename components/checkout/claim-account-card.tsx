"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { authClient } from "@/lib/auth-client"
import { claimGuestPurchasesAfterSignUp } from "@/lib/actions/claim-order"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { CheckCircle, Eye, EyeOff, Library, Loader2, Lock, ICON_SIZE } from "@/lib/storefront-icons"
import { cn } from "@/lib/utils"

const MIN_PASSWORD = 8

/**
 * Shown on the checkout success page for guests only — checkout itself never
 * asks for a password, so this is the first (and only) chance to turn a
 * guest purchase into a real account. The email is fixed to the order's own
 * billing email; only a password is collected, which keeps this to a single
 * field instead of repeating the full sign-up form.
 */
export function ClaimAccountCard({ email, name }: { email: string; name: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [existingAccount, setExistingAccount] = useState(false)
  const [loading, setLoading] = useState(false)
  const [claimed, setClaimed] = useState(false)

  const nextUrl = `${pathname}?${searchParams.toString()}`

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setExistingAccount(false)

    if (password.length < MIN_PASSWORD) {
      setError(`Use at least ${MIN_PASSWORD} characters.`)
      return
    }
    if (password !== confirm) {
      setError("Passwords don't match.")
      return
    }

    setLoading(true)
    // The account is created client-side (not via a Server Action) because
    // Better Auth's session cookie is only reliably set through its own
    // fetch from the browser. autoSignIn is enabled server-side, so this
    // also signs the browser in immediately.
    const result = await authClient.signUp.email({ email, password, name: name || email })
    if (result.error) {
      setLoading(false)
      if (result.error.code === "USER_ALREADY_EXISTS") {
        setExistingAccount(true)
        return
      }
      setError(result.error.message ?? "Could not create your account. Please try again.")
      return
    }

    await claimGuestPurchasesAfterSignUp()
    setLoading(false)
    setClaimed(true)
    // router.refresh() re-renders this page as a signed-in visitor, which
    // stops rendering this card entirely (isGuest flips false) — delayed so
    // the "Account created" confirmation below is actually seen first,
    // instead of being swapped out the instant it appears.
    setTimeout(() => router.refresh(), 2500)
  }

  if (claimed) {
    return (
      <div className="mt-6 flex items-start gap-3 rounded-lg border border-success/30 bg-success/10 px-5 py-4">
        <CheckCircle size={ICON_SIZE.feature} className="mt-0.5 shrink-0 text-success" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-foreground">Account created</p>
          <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
            This order is now saved to your account under {email}. It&apos;s in My Library whenever you need it.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-6 rounded-lg border border-border bg-card">
      <div className="flex items-start gap-3 border-b border-border px-5 py-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-secondary text-foreground">
          <Library size={ICON_SIZE.base} aria-hidden="true" />
        </span>
        <div>
          <h2 className="font-display text-base font-bold text-foreground">Save this order to an account</h2>
          <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
            Create a password for {email} to see this purchase in My Library, get download access on any device, and
            receive product updates.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-4" noValidate>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}

        {existingAccount ? (
          <p className="text-sm leading-relaxed text-muted-foreground">
            An account already exists for {email}.{" "}
            <Link
              href={`/sign-in?next=${encodeURIComponent(nextUrl)}`}
              className="font-semibold text-foreground underline-offset-4 hover:underline"
            >
              Sign in
            </Link>{" "}
            and this order will be added to it automatically.
          </p>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="claim-password">Password</Label>
                <div className="relative">
                  <Input
                    id="claim-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="new-password"
                    className="h-11 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {showPassword ? <EyeOff size={ICON_SIZE.sm} aria-hidden="true" /> : <Eye size={ICON_SIZE.sm} aria-hidden="true" />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">At least {MIN_PASSWORD} characters.</p>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="claim-confirm">Confirm password</Label>
                <Input
                  id="claim-confirm"
                  type={showPassword ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  className="h-11"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} aria-busy={loading} className="h-11 self-start font-semibold sm:px-6">
              <span className="relative flex items-center justify-center gap-2">
                <span className={cn("flex items-center gap-2 transition-opacity", loading && "opacity-0")}>
                  <Lock size={ICON_SIZE.sm} aria-hidden="true" />
                  Create account
                </span>
                {loading && (
                  <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                    <Loader2 size={ICON_SIZE.base} className="animate-spin" />
                  </span>
                )}
              </span>
            </Button>
          </>
        )}
      </form>
    </div>
  )
}

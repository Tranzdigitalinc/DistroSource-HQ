"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PolarInlineCheckout } from "@/components/checkout/polar-inline-checkout"
import { CheckoutLineItem, type CheckoutItem } from "@/components/checkout/checkout-line-item"
import { OrderSummary } from "@/components/checkout/order-summary"
import { saveAbandonedCart } from "@/lib/actions/recovery"
import { createPolarCheckout } from "@/lib/actions/checkout"
import { mergeGuestCartIntoAccount } from "@/lib/actions/cart"
import { mergeGuestActivityIntoAccount } from "@/lib/actions/recently-viewed"
import { authClient } from "@/lib/auth-client"
import { Download, Eye, EyeOff, Lock, ICON_SIZE } from "@/lib/storefront-icons"
import { cn } from "@/lib/utils"

interface CheckoutFormProps {
  defaultEmail: string
  defaultName: string
  subtotal: number
  discountPercent: number
  isGuest: boolean
  orderItems: CheckoutItem[]
}

const FORM_ID = "checkout-form"
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Section({
  step,
  title,
  description,
  aside,
  children,
}: {
  step?: number
  title: string
  description?: string
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="flex flex-col gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="flex items-start gap-3">
          {step !== undefined && (
            <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground font-mono text-[11px] font-bold text-background" aria-hidden="true">
              {step}
            </span>
          )}
          <div>
            <h2 className="font-display text-base font-bold text-foreground">{title}</h2>
            {description && <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{description}</p>}
          </div>
        </div>
        {aside}
      </div>
      <div className="px-5 py-4">{children}</div>
    </section>
  )
}

export function CheckoutForm({ defaultEmail, defaultName, subtotal, discountPercent, isGuest, orderItems }: CheckoutFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const couponCode = searchParams.get("coupon") ?? undefined
  const [email, setEmail] = useState(defaultEmail)
  const [name, setName] = useState(defaultName)
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [fieldError, setFieldError] = useState<{ name?: string; email?: string; password?: string; confirm?: string }>({})
  const [isPending, startTransition] = useTransition()
  const [isPreparingAccount, setIsPreparingAccount] = useState(false)
  const [polarCheckoutUrl, setPolarCheckoutUrl] = useState<string | null>(null)

  const discount = Math.round(subtotal * (discountPercent / 100) * 100) / 100
  const total = Math.max(0, subtotal - discount)
  const itemCount = orderItems.reduce((n, i) => n + i.quantity, 0)
  const isBusy = isPending || isPreparingAccount

  /**
   * Validates contact fields and, for guests, creates the account before any
   * money moves. Returns false (with field errors shown) instead of throwing.
   */
  async function prepareAccountForPayment(): Promise<boolean> {
    const errors: typeof fieldError = {}
    if (!name.trim()) errors.name = "Enter the name for this order."
    if (!EMAIL.test(email.trim())) errors.email = "Enter a valid email address."
    if (isGuest) {
      if (password.length < 8) errors.password = "Use at least 8 characters."
      if (password !== confirmPassword) errors.confirm = "Passwords don't match."
    }
    setFieldError(errors)
    if (Object.keys(errors).length) return false

    if (isGuest) {
      setIsPreparingAccount(true)
      try {
        const account = await authClient.signUp.email({ email: email.trim(), password, name: name.trim() })
        if (account.error) {
          throw new Error(
            account.error.code === "USER_ALREADY_EXISTS"
              ? "An account with this email already exists. Sign in to continue."
              : (account.error.message ?? "Could not create your account."),
          )
        }
        await Promise.all([mergeGuestCartIntoAccount(), mergeGuestActivityIntoAccount()])
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not create your account.")
        return false
      } finally {
        setIsPreparingAccount(false)
      }
    }
    return true
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      const ready = await prepareAccountForPayment()
      if (!ready) return
      try {
        const checkout = await createPolarCheckout({ billingEmail: email.trim(), billingName: name.trim(), couponCode })
        setPolarCheckoutUrl(checkout.url)
      } catch (error) {
        await saveAbandonedCart({ email, subtotalUsd: subtotal, items: orderItems })
        toast.error(error instanceof Error ? error.message : "Could not start secure checkout.")
      }
    })
  }

  const inputClass = "h-11"

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-8">
      <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        {polarCheckoutUrl ? (
          <>
            <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm">
              <p className="min-w-0 truncate">
                <span className="text-muted-foreground">Paying as </span>
                <span className="font-medium text-foreground">{email.trim()}</span>
              </p>
              <button
                type="button"
                onClick={() => setPolarCheckoutUrl(null)}
                className="shrink-0 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Edit details
              </button>
            </div>
            <PolarInlineCheckout
              checkoutUrl={polarCheckoutUrl}
              onSuccess={(successUrl) => {
                const url = new URL(successUrl)
                router.push(`${url.pathname}${url.search}`)
              }}
            />
          </>
        ) : (
          <>
            <Section
              step={1}
              title="Customer"
              description="Your receipt and download access are tied to this email."
              aside={
                isGuest ? (
                  <Link href={`/sign-in?next=${encodeURIComponent("/checkout")}`} className="shrink-0 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                    Have an account? Sign in
                  </Link>
                ) : undefined
              }
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="checkout-name">Full name</Label>
                  <Input id="checkout-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-invalid={!!fieldError.name} className={inputClass} />
                  {fieldError.name && <p className="text-xs text-destructive" role="alert">{fieldError.name}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="checkout-email">Email</Label>
                  <Input id="checkout-email" type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" aria-invalid={!!fieldError.email} className={inputClass} readOnly={!isGuest && !!defaultEmail} />
                  {fieldError.email && <p className="text-xs text-destructive" role="alert">{fieldError.email}</p>}
                </div>
              </div>

              {isGuest && (
                <div className="mt-5 border-t border-border pt-4">
                  <p className="text-sm font-semibold text-foreground">Create a password</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                    Your purchases live in My Library, so an account is created with this order.
                  </p>
                  <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="checkout-password">Password</Label>
                      <div className="relative">
                        <Input id="checkout-password" type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" aria-invalid={!!fieldError.password} className={cn(inputClass, "pr-11")} />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          aria-label={showPassword ? "Hide password" : "Show password"}
                          className="absolute right-1.5 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          {showPassword ? <EyeOff size={ICON_SIZE.sm} aria-hidden="true" /> : <Eye size={ICON_SIZE.sm} aria-hidden="true" />}
                        </button>
                      </div>
                      <p className={cn("text-xs", fieldError.password ? "text-destructive" : "text-muted-foreground")} role={fieldError.password ? "alert" : undefined}>
                        {fieldError.password ?? "At least 8 characters."}
                      </p>
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor="checkout-confirm-password">Confirm password</Label>
                      <Input id="checkout-confirm-password" type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} autoComplete="new-password" aria-invalid={!!fieldError.confirm} className={inputClass} />
                      {fieldError.confirm && <p className="text-xs text-destructive" role="alert">{fieldError.confirm}</p>}
                    </div>
                  </div>
                </div>
              )}
            </Section>
          </>
        )}

        {/* The order review stays visible next to the Polar frame so the buyer can always see what they are paying for. */}
        <Section
          step={polarCheckoutUrl ? undefined : 2}
          title="Your products"
          aside={
            !polarCheckoutUrl ? (
              <Link href="/cart" className="shrink-0 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                Edit cart
              </Link>
            ) : undefined
          }
        >
          <ul className="divide-y divide-border">
            {orderItems.map((item) => (
              <CheckoutLineItem key={`${item.productId}-${item.licenseId}`} item={item} />
            ))}
          </ul>
        </Section>

        <div className="flex items-start gap-3 rounded-lg border border-border bg-secondary/30 px-5 py-4">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-card text-foreground">
            <Download size={ICON_SIZE.sm} aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-foreground">Digital delivery</p>
            <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
              Products are added to My Library after confirmed payment. A receipt is emailed to {email.trim() || "your address"}.
            </p>
          </div>
        </div>
      </form>

      <div className="lg:sticky lg:top-24">
        <OrderSummary
          subtotal={subtotal}
          discount={discount}
          discountPercent={discountPercent}
          total={total}
          itemCount={itemCount}
          isSubmitting={isBusy}
          hideAction={Boolean(polarCheckoutUrl)}
          formId={FORM_ID}
        />
      </div>

      {!polarCheckoutUrl && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 shadow-[var(--shadow-e3)] backdrop-blur supports-[backdrop-filter]:bg-background/90 lg:hidden">
          <div className="mx-auto flex max-w-lg items-center gap-4">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground">Total</p>
              <p className="font-display text-lg font-bold tabular-nums leading-tight">${total.toFixed(2)}</p>
            </div>
            <Button type="submit" form={FORM_ID} size="lg" disabled={isBusy} aria-busy={isBusy} className="h-12 flex-1 font-semibold">
              <Lock size={ICON_SIZE.sm} aria-hidden="true" />
              {isBusy ? "Preparing…" : "Continue to secure payment"}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

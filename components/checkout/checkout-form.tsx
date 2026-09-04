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
import { Download, Lock, ICON_SIZE } from "@/lib/storefront-icons"
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

type WizardStep = 1 | 2 | 3

const WIZARD_STEPS: { id: WizardStep; label: string }[] = [
  { id: 1, label: "Account" },
  { id: 2, label: "Review" },
  { id: 3, label: "Payment" },
]

/**
 * Step indicator for the 3-step checkout wizard (Account → Review →
 * Payment). Purely presentational — `activeStep` drives which step is
 * highlighted as current vs. already completed.
 */
function StepIndicator({ activeStep }: { activeStep: WizardStep }) {
  return (
    <ol aria-label="Checkout steps" className="flex items-center gap-1.5 sm:gap-2">
      {WIZARD_STEPS.map((step, index) => {
        const isComplete = step.id < activeStep
        const isCurrent = step.id === activeStep
        return (
          <li key={step.id} className="flex items-center gap-1.5 sm:gap-2">
            {index > 0 && <span aria-hidden="true" className="h-px w-4 shrink-0 bg-border sm:w-6" />}
            <span
              aria-current={isCurrent ? "step" : undefined}
              className="flex items-center gap-1.5"
            >
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold transition-colors",
                  isCurrent && "bg-foreground text-background",
                  isComplete && "bg-secondary text-foreground",
                  !isCurrent && !isComplete && "bg-secondary/50 text-muted-foreground",
                )}
              >
                {step.id}
              </span>
              <span
                className={cn(
                  "hidden font-mono text-[11px] font-semibold uppercase tracking-[0.08em] sm:inline",
                  isCurrent ? "text-foreground" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </span>
          </li>
        )
      })}
    </ol>
  )
}

function Section({
  title,
  description,
  aside,
  children,
}: {
  title: string
  description?: string
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="rounded-lg border border-border bg-card">
      <div className="flex flex-col gap-2 border-b border-border px-5 py-4 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <h2 className="font-display text-base font-bold text-foreground">{title}</h2>
          {description && <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{description}</p>}
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
  const [fieldError, setFieldError] = useState<{ name?: string; email?: string }>({})
  const [isPending, startTransition] = useTransition()
  const [polarCheckoutUrl, setPolarCheckoutUrl] = useState<string | null>(null)
  // Signed-in shoppers already have an account, so they start on Review
  // (step 2). Guests confirm the name/email their order and receipt go to
  // first (step 1) — no account or password is required to pay. Guests get
  // a chance to turn this into a real account afterward, on the success page.
  const [step, setStep] = useState<WizardStep>(isGuest ? 1 : 2)

  const discount = Math.round(subtotal * (discountPercent / 100) * 100) / 100
  const total = Math.max(0, subtotal - discount)
  const itemCount = orderItems.reduce((n, i) => n + i.quantity, 0)
  const isBusy = isPending
  // The account step is only ever shown to a guest; once contact details are
  // confirmed (or the shopper was already signed in) it collapses into a
  // summary row on the Review step instead of disappearing entirely.
  const accountConfirmed = step > 1

  /** Validates the contact fields. Returns false (with field errors shown) instead of throwing. */
  function validateAccountStep(): boolean {
    const errors: typeof fieldError = {}
    if (!name.trim()) errors.name = "Enter the name for this order."
    if (!EMAIL.test(email.trim())) errors.email = "Enter a valid email address."
    setFieldError(errors)
    return Object.keys(errors).length === 0
  }

  /** Step 1 (Account) → Step 2 (Review). No account is created here. */
  function handleContinueFromAccount(e: React.FormEvent) {
    e.preventDefault()
    if (!validateAccountStep()) return
    setStep(2)
  }

  /** Step 2 (Review) → Step 3 (Payment). Creates the Polar checkout session. */
  function handleContinueFromReview(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      try {
        const checkout = await createPolarCheckout({ billingEmail: email.trim(), billingName: name.trim(), couponCode })
        if ("error" in checkout) {
          // The cart was never touched when this happens — createPolarCheckout
          // only clears it after Polar accepts the checkout — so it's safe to
          // just let the buyer retry.
          await saveAbandonedCart({ email, subtotalUsd: subtotal, items: orderItems })
          toast.error(checkout.error)
          return
        }
        setPolarCheckoutUrl(checkout.url)
        setStep(3)
      } catch (error) {
        await saveAbandonedCart({ email, subtotalUsd: subtotal, items: orderItems })
        toast.error(error instanceof Error ? error.message : "Could not start secure checkout.")
      }
    })
  }

  const inputClass = "h-11"

  // Step 1 submits its own form to create/confirm the account; step 2 submits
  // its own form to create the Polar checkout session. Only one is ever
  // mounted at a time, so both can safely reuse FORM_ID for the mobile sticky
  // CTA and the OrderSummary's submit button to target.
  const activeStepSubmit = step === 1 ? handleContinueFromAccount : handleContinueFromReview
  const ctaLabel = step === 1 ? "Continue to review" : "Continue to secure payment"

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-8">
      <div className="flex flex-col gap-5">
        {!polarCheckoutUrl && (
          <div className="rounded-lg border border-border bg-card px-5 py-3">
            <StepIndicator activeStep={step} />
          </div>
        )}

        <form id={FORM_ID} onSubmit={activeStepSubmit} className="flex flex-col gap-5" noValidate>
          {polarCheckoutUrl ? (
            <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm">
              <p className="min-w-0 truncate">
                <span className="text-muted-foreground">Paying as </span>
                <span className="font-medium text-foreground">{email.trim()}</span>
              </p>
              <button
                type="button"
                onClick={() => {
                  setPolarCheckoutUrl(null)
                  setStep(1)
                }}
                className="shrink-0 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Edit details
              </button>
            </div>
          ) : step === 1 ? (
            <Section
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
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                  No account or password needed to check out — you can save this order to an account afterward.
                </p>
              )}
            </Section>
          ) : (
            <>
              {/* Step 1 is done (account exists / already signed in). Collapse it into a summary row instead of hiding it outright. */}
              {accountConfirmed && (
                <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-5 py-3">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-[0.06em] text-muted-foreground">Account</p>
                    <p className="truncate text-sm text-foreground">
                      <span className="font-medium">{name.trim() || "—"}</span>
                      <span className="text-muted-foreground"> · {email.trim()}</span>
                    </p>
                  </div>
                  {isGuest && (
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="shrink-0 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                    >
                      Edit
                    </button>
                  )}
                </div>
              )}

              <Section
                title="Your products"
                aside={
                  <Link href="/cart" className="shrink-0 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                    Edit cart
                  </Link>
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
                    A receipt is emailed to {email.trim() || "your address"}. Once payment is confirmed, you can create a
                    password to save this order to My Library — or download straight from the confirmation page.
                  </p>
                </div>
              </div>
            </>
          )}
        </form>

        {/* The order review stays visible behind the Polar overlay so the buyer can always see what they are paying for. The overlay itself renders directly into document.body — this component has no visual output of its own. */}
        {polarCheckoutUrl && (
          <>
            <Section title="Your products">
              <ul className="divide-y divide-border">
                {orderItems.map((item) => (
                  <CheckoutLineItem key={`${item.productId}-${item.licenseId}`} item={item} />
                ))}
              </ul>
            </Section>
            <PolarInlineCheckout
              checkoutUrl={polarCheckoutUrl}
              onSuccess={(successUrl) => {
                const url = new URL(successUrl)
                router.push(`${url.pathname}${url.search}`)
              }}
              onClose={(reason) => {
                setPolarCheckoutUrl(null)
                setStep(2)
                if (reason === "failed") {
                  toast.error(
                    "We couldn't open secure payment. This can happen if this site isn't yet allow-listed in Polar's embedding settings — please try again in a moment.",
                  )
                }
              }}
            />
          </>
        )}
      </div>

      <div className="lg:sticky lg:top-24">
        <OrderSummary
          subtotal={subtotal}
          discount={discount}
          discountPercent={discountPercent}
          total={total}
          itemCount={itemCount}
          isSubmitting={isBusy}
          hideAction={Boolean(polarCheckoutUrl)}
          submitLabel={ctaLabel}
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
              {isBusy ? "Preparing…" : ctaLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

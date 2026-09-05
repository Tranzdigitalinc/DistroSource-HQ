"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PolarInlineCheckout } from "@/components/checkout/polar-inline-checkout"
import { TampayWaiting } from "@/components/checkout/tampay-waiting"
import { WhopWaiting } from "@/components/checkout/whop-waiting"
import { CheckoutLineItem, type CheckoutItem } from "@/components/checkout/checkout-line-item"
import { OrderSummary } from "@/components/checkout/order-summary"
import { RadioCardGroup } from "@/components/checkout/radio-card-group"
import { PriceDisplay } from "@/components/price-display"
import { saveAbandonedCart } from "@/lib/actions/recovery"
import { createPolarCheckout, createTampayCheckout, createWhopCheckout } from "@/lib/actions/checkout"
import { Download, Lock, CreditCard, Wallet, Zap, ICON_SIZE } from "@/lib/storefront-icons"
import { cn } from "@/lib/utils"

type PaymentProvider = "polar" | "tampay" | "whop"
type TampaySubMethod = "togo" | "lahza" | "stripe"

// The action itself (lib/actions/checkout.ts) has the matching server-side
// guard, so this only controls whether the picker is shown.
const TAMPAY_ENABLED = true
// Whop is live — the picker below only renders when more than one provider
// is enabled, which now includes Whop by default.
const WHOP_ENABLED = true

const TAMPAY_METHODS: { id: TampaySubMethod; label: string; description: string }[] = [
  { id: "togo", label: "Togo", description: "Cards, Apple Pay & Google Pay" },
  { id: "lahza", label: "Lahza", description: "Cards only, lower fee" },
  { id: "stripe", label: "Stripe", description: "Cards via Stripe" },
]

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
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>("polar")
  const [tampaySubMethod, setTampaySubMethod] = useState<TampaySubMethod>("togo")
  const [tampayPhone, setTampayPhone] = useState("")
  const [tampayCity, setTampayCity] = useState("")
  const [tampayFieldError, setTampayFieldError] = useState<{ phone?: string; city?: string }>({})
  // Set once TamPay has accepted the payment link; drives the "waiting for
  // payment" screen. `tampayPaymentUrl` lets that screen reopen the tab if
  // the buyer closed it without paying.
  const [tampayOrder, setTampayOrder] = useState<{ orderNumber: string; url: string } | null>(null)
  // Set once Whop has accepted the checkout configuration; drives the
  // "payment in progress" screen. Unlike tampayOrder, this never polls —
  // Whop's redirect + webhook combo confirms payment on its own.
  const [whopOrder, setWhopOrder] = useState<{ orderNumber: string; url: string } | null>(null)
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

    if (TAMPAY_ENABLED && paymentProvider === "tampay") {
      const errors: typeof tampayFieldError = {}
      if (tampaySubMethod === "togo") {
        if (!tampayPhone.trim()) errors.phone = "Phone is required for Togo."
        if (!tampayCity.trim()) errors.city = "City is required for Togo."
      }
      setTampayFieldError(errors)
      if (Object.keys(errors).length > 0) return

      startTransition(async () => {
        try {
          const checkout = await createTampayCheckout({
            billingEmail: email.trim(),
            billingName: name.trim(),
            couponCode,
            paymentMethod: tampaySubMethod,
            ...(tampaySubMethod === "togo" ? { phone: tampayPhone.trim(), city: tampayCity.trim() } : {}),
          })
          if ("error" in checkout) {
            // TamPay only accepts the link (and clears the cart) after it's
            // created, so it's safe to just let the buyer retry.
            await saveAbandonedCart({ email, subtotalUsd: subtotal, items: orderItems })
            toast.error(checkout.error)
            return
          }
          // TamPay has no return URL, so the buyer pays in a separate tab
          // while this tab shows the waiting/poll screen below.
          window.open(checkout.url, "_blank", "noopener,noreferrer")
          setTampayOrder({ orderNumber: checkout.orderNumber, url: checkout.url })
          setStep(3)
        } catch (error) {
          await saveAbandonedCart({ email, subtotalUsd: subtotal, items: orderItems })
          toast.error(error instanceof Error ? error.message : "Could not start TamPay checkout.")
        }
      })
      return
    }

    if (WHOP_ENABLED && paymentProvider === "whop") {
      startTransition(async () => {
        try {
          const checkout = await createWhopCheckout({ billingEmail: email.trim(), billingName: name.trim(), couponCode })
          if ("error" in checkout) {
            // Whop only accepts the checkout (and clears the cart) after
            // it's created, so it's safe to just let the buyer retry.
            await saveAbandonedCart({ email, subtotalUsd: subtotal, items: orderItems })
            toast.error(checkout.error)
            return
          }
          // Whop has a real return URL, but opening it in a new tab keeps
          // the review + waiting-screen UX identical to TamPay, and means
          // an abandoned tab never leaves the buyer stuck on a blank page.
          window.open(checkout.url, "_blank", "noopener,noreferrer")
          setWhopOrder({ orderNumber: checkout.orderNumber, url: checkout.url })
          setStep(3)
        } catch (error) {
          await saveAbandonedCart({ email, subtotalUsd: subtotal, items: orderItems })
          toast.error(error instanceof Error ? error.message : "Could not start Whop checkout.")
        }
      })
      return
    }

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

  /** Resets the in-progress payment attempt (any provider) back to Review. */
  function handleCancelPayment() {
    setPolarCheckoutUrl(null)
    setTampayOrder(null)
    setWhopOrder(null)
    setStep(2)
  }

  // True once any provider has actually accepted a checkout attempt —
  // drives the shared "payment in progress" chrome (hides the step
  // indicator/CTA, shows the "Paying as" bar) regardless of which one.
  const paymentInProgress = Boolean(polarCheckoutUrl) || Boolean(tampayOrder) || Boolean(whopOrder)

  // Step 1 submits its own form to create/confirm the account; step 2 submits
  // its own form to create the Polar checkout session. Only one is ever
  // mounted at a time, so both can safely reuse FORM_ID for the mobile sticky
  // CTA and the OrderSummary's submit button to target.
  const activeStepSubmit = step === 1 ? handleContinueFromAccount : handleContinueFromReview
  // Name the destination: a buyer who picked Whop or TamPay is not going to
  // a Polar payment sheet, and a generic label hides that.
  const payLabel =
    paymentProvider === "whop" ? "Continue to Whop" : paymentProvider === "tampay" ? "Continue to TamPay" : "Continue to secure payment"
  const ctaLabel = step === 1 ? "Continue to review" : payLabel

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-8">
      <div className="flex flex-col gap-5">
        {!paymentInProgress && (
          <div className="rounded-lg border border-border bg-card px-5 py-3">
            <StepIndicator activeStep={step} />
          </div>
        )}

        <form id={FORM_ID} onSubmit={activeStepSubmit} className="flex flex-col gap-5" noValidate>
          {paymentInProgress ? (
            <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm">
              <p className="min-w-0 truncate">
                <span className="text-muted-foreground">Paying as </span>
                <span className="font-medium text-foreground">{email.trim()}</span>
              </p>
              <button
                type="button"
                onClick={() => {
                  handleCancelPayment()
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
                  <Input id="checkout-name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" aria-invalid={!!fieldError.name} inputSize="lg" />
                  {fieldError.name && <p className="text-xs text-destructive" role="alert">{fieldError.name}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="checkout-email">Email</Label>
                  <Input id="checkout-email" type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" aria-invalid={!!fieldError.email} inputSize="lg" readOnly={!isGuest && !!defaultEmail} />
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

              {(TAMPAY_ENABLED || WHOP_ENABLED) && (
              <Section title="Payment method">
                <RadioCardGroup
                  label="Payment method"
                  value={paymentProvider}
                  onChange={setPaymentProvider}
                  columns={WHOP_ENABLED && TAMPAY_ENABLED ? 3 : 2}
                  options={[
                    { id: "polar" as const, label: "Card", description: "Apple Pay, Google Pay & cards via Polar", icon: CreditCard },
                    ...(WHOP_ENABLED ? [{ id: "whop" as const, label: "Whop", description: "Pay with Whop’s hosted checkout", icon: Zap }] : []),
                    ...(TAMPAY_ENABLED ? [{ id: "tampay" as const, label: "TamPay", description: "Regional cards & wallets", icon: Wallet }] : []),
                  ]}
                />
                {paymentProvider === "tampay" && (
                  <div className="mt-4 flex flex-col gap-4 border-t border-border pt-4">
                    <RadioCardGroup
                      label="TamPay method"
                      value={tampaySubMethod}
                      onChange={setTampaySubMethod}
                      columns={3}
                      options={TAMPAY_METHODS.map((m) => ({ id: m.id, label: m.label, description: m.description }))}
                    />

                    {tampaySubMethod === "togo" && (
                      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor="tampay-phone">Phone (international format)</Label>
                          <Input
                            id="tampay-phone"
                            type="tel"
                            value={tampayPhone}
                            onChange={(e) => setTampayPhone(e.target.value)}
                            aria-invalid={!!tampayFieldError.phone}
                            inputSize="lg"
                          />
                          {tampayFieldError.phone && <p className="text-xs text-destructive" role="alert">{tampayFieldError.phone}</p>}
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <Label htmlFor="tampay-city">City</Label>
                          <Input
                            id="tampay-city"
                            value={tampayCity}
                            onChange={(e) => setTampayCity(e.target.value)}
                            aria-invalid={!!tampayFieldError.city}
                            inputSize="lg"
                          />
                          {tampayFieldError.city && <p className="text-xs text-destructive" role="alert">{tampayFieldError.city}</p>}
                        </div>
                      </div>
                    )}

                    <p className="text-xs leading-relaxed text-muted-foreground">
                      TamPay adds a small processing fee on top of the total shown here — it’s calculated and disclosed on TamPay’s payment page before you pay.
                    </p>
                  </div>
                )}
              </Section>
              )}

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

        {/* The order review stays visible behind the Polar overlay / TamPay waiting screen so the buyer can always see what they are paying for. The Polar overlay renders directly into document.body — this component has no visual output of its own. */}
        {paymentInProgress && (
          <>
            <Section title="Your products">
              <ul className="divide-y divide-border">
                {orderItems.map((item) => (
                  <CheckoutLineItem key={`${item.productId}-${item.licenseId}`} item={item} />
                ))}
              </ul>
            </Section>
            {polarCheckoutUrl && (
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
            )}
            {TAMPAY_ENABLED && tampayOrder && (
              <TampayWaiting
                orderNumber={tampayOrder.orderNumber}
                paymentUrl={tampayOrder.url}
                onPaid={(orderNumber) => router.push(`/checkout/success?order=${encodeURIComponent(orderNumber)}`)}
                onCancel={handleCancelPayment}
              />
            )}
            {WHOP_ENABLED && whopOrder && (
              <WhopWaiting orderNumber={whopOrder.orderNumber} paymentUrl={whopOrder.url} onCancel={handleCancelPayment} />
            )}
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
          hideAction={paymentInProgress}
          submitLabel={ctaLabel}
          formId={FORM_ID}
        />
      </div>

      {!paymentInProgress && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 shadow-[var(--shadow-e3)] backdrop-blur supports-[backdrop-filter]:bg-background/90 lg:hidden">
          <div className="mx-auto flex max-w-lg items-center gap-4">
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-[0.06em] text-muted-foreground">Total</p>
              <p className="font-display text-lg font-bold tabular-nums leading-tight"><PriceDisplay usdAmount={total} /></p>
            </div>
            <Button type="submit" form={FORM_ID} size="xl" disabled={isBusy} aria-busy={isBusy} className="flex-1 font-semibold">
              <Lock size={ICON_SIZE.sm} aria-hidden="true" />
              {isBusy ? "Preparing…" : ctaLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

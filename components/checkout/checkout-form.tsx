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
import { formatUsd } from "@/lib/format"
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

/**
 * Common misspellings of the domains most receipts go to. A digital order is
 * delivered entirely by email, so a typo here means the customer pays and
 * then never receives the download — worth one inline nudge before payment.
 */
const DOMAIN_TYPOS: Record<string, string> = {
  "gmial.com": "gmail.com",
  "gmai.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "gnail.com": "gmail.com",
  "hotmial.com": "hotmail.com",
  "hotmail.co": "hotmail.com",
  "outlok.com": "outlook.com",
  "outloo.com": "outlook.com",
  "yahooo.com": "yahoo.com",
  "yaho.com": "yahoo.com",
  "icloud.co": "icloud.com",
}

function suggestEmail(value: string): string | null {
  const at = value.lastIndexOf("@")
  if (at < 0) return null
  const domain = value.slice(at + 1).toLowerCase()
  const fixed = DOMAIN_TYPOS[domain]
  return fixed ? `${value.slice(0, at + 1)}${fixed}` : null
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
  // payment" screen. The url lets that screen reopen the tab if the buyer
  // closed it without paying.
  const [tampayOrder, setTampayOrder] = useState<{ orderNumber: string; url: string } | null>(null)
  // Set once Whop has accepted the checkout configuration. Unlike
  // tampayOrder this never polls — Whop's redirect + webhook confirm payment.
  const [whopOrder, setWhopOrder] = useState<{ orderNumber: string; url: string } | null>(null)

  const discount = Math.round(subtotal * (discountPercent / 100) * 100) / 100
  const total = Math.max(0, subtotal - discount)
  const itemCount = orderItems.reduce((n, i) => n + i.quantity, 0)
  const isBusy = isPending
  const emailSuggestion = suggestEmail(email.trim())

  // True once any provider has accepted a checkout attempt — swaps the form
  // for the payment surface (Polar overlay, or a waiting screen).
  const paymentInProgress = Boolean(polarCheckoutUrl) || Boolean(tampayOrder) || Boolean(whopOrder)

  /**
   * Everything the buyer must supply lives on one screen, so this is the only
   * validation pass. Returns false with inline errors rather than throwing.
   */
  function validate(): boolean {
    const errors: typeof fieldError = {}
    if (!name.trim()) errors.name = "Enter the name for this order."
    if (!EMAIL.test(email.trim())) errors.email = "Enter a valid email address."
    setFieldError(errors)

    const tampayErrors: typeof tampayFieldError = {}
    if (TAMPAY_ENABLED && paymentProvider === "tampay" && tampaySubMethod === "togo") {
      if (!tampayPhone.trim()) tampayErrors.phone = "Phone is required for Togo."
      if (!tampayCity.trim()) tampayErrors.city = "City is required for Togo."
    }
    setTampayFieldError(tampayErrors)

    return Object.keys(errors).length === 0 && Object.keys(tampayErrors).length === 0
  }

  async function failed(message: string) {
    await saveAbandonedCart({ email, subtotalUsd: subtotal, items: orderItems })
    toast.error(message)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    // TamPay and Whop are paid in a second tab. That tab has to be opened
    // synchronously inside this click: opening it after the server action
    // resolves loses the user-activation that popup blockers require, so the
    // buyer would be left with nothing happening. The blank tab is pointed at
    // the payment URL once it arrives, and closed if the call fails.
    const redirectProvider =
      (TAMPAY_ENABLED && paymentProvider === "tampay") || (WHOP_ENABLED && paymentProvider === "whop")
    const paymentTab = redirectProvider ? window.open("", "_blank", "noopener,noreferrer") : null

    startTransition(async () => {
      try {
        if (TAMPAY_ENABLED && paymentProvider === "tampay") {
          const checkout = await createTampayCheckout({
            billingEmail: email.trim(),
            billingName: name.trim(),
            couponCode,
            paymentMethod: tampaySubMethod,
            ...(tampaySubMethod === "togo" ? { phone: tampayPhone.trim(), city: tampayCity.trim() } : {}),
          })
          if ("error" in checkout) {
            paymentTab?.close()
            // TamPay only clears the cart once it accepts the link, so a
            // failure here is safe to retry.
            await failed(checkout.error)
            return
          }
          if (paymentTab) paymentTab.location.href = checkout.url
          else window.open(checkout.url, "_blank", "noopener,noreferrer")
          setTampayOrder({ orderNumber: checkout.orderNumber, url: checkout.url })
          return
        }

        if (WHOP_ENABLED && paymentProvider === "whop") {
          const checkout = await createWhopCheckout({ billingEmail: email.trim(), billingName: name.trim(), couponCode })
          if ("error" in checkout) {
            paymentTab?.close()
            await failed(checkout.error)
            return
          }
          if (paymentTab) paymentTab.location.href = checkout.url
          else window.open(checkout.url, "_blank", "noopener,noreferrer")
          setWhopOrder({ orderNumber: checkout.orderNumber, url: checkout.url })
          return
        }

        const checkout = await createPolarCheckout({ billingEmail: email.trim(), billingName: name.trim(), couponCode })
        if ("error" in checkout) {
          // createPolarCheckout only clears the cart after Polar accepts the
          // checkout, so the buyer can simply try again.
          await failed(checkout.error)
          return
        }
        setPolarCheckoutUrl(checkout.url)
      } catch (error) {
        paymentTab?.close()
        await failed(error instanceof Error ? error.message : "Could not start checkout.")
      }
    })
  }

  /** Returns to the form from an in-progress payment attempt (any provider). */
  function handleCancelPayment() {
    setPolarCheckoutUrl(null)
    setTampayOrder(null)
    setWhopOrder(null)
  }

  // Polar pays in an overlay on this page, so the amount is a promise we can
  // keep. TamPay adds its own processing fee on its page, so naming an exact
  // amount on the button there would be wrong — it names the destination.
  const ctaLabel =
    paymentProvider === "whop"
      ? "Continue to Whop"
      : paymentProvider === "tampay"
        ? "Continue to TamPay"
        : `Pay ${formatUsd(total)}`

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-8">
      <div className="flex flex-col gap-5">
        {paymentInProgress ? (
          <>
            <div className="flex items-center justify-between rounded-lg border border-border bg-secondary/40 px-4 py-3 text-sm">
              <p className="min-w-0 truncate">
                <span className="text-muted-foreground">Paying as </span>
                <span className="font-medium text-foreground">{email.trim()}</span>
              </p>
              <button
                type="button"
                onClick={handleCancelPayment}
                className="shrink-0 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
              >
                Edit details
              </button>
            </div>

            {/* The order stays visible behind the payment surface so the buyer can always see what they are paying for. */}
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
        ) : (
          /* One screen: contact, order, payment method. Nothing here needs to
             be gated behind a step — a digital order has no address, no
             shipping and no delivery choice, so a wizard only added clicks
             between the buyer and the pay button. */
          <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <Section
              title="Contact"
              description="Your receipt and download link go to this email."
              aside={
                isGuest ? (
                  <Link
                    href={`/sign-in?next=${encodeURIComponent("/checkout")}`}
                    className="shrink-0 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                  >
                    Have an account? Sign in
                  </Link>
                ) : undefined
              }
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="checkout-name">Full name</Label>
                  <Input
                    id="checkout-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoComplete="name"
                    aria-invalid={!!fieldError.name}
                    inputSize="lg"
                  />
                  {fieldError.name && <p className="text-xs text-destructive" role="alert">{fieldError.name}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="checkout-email">Email</Label>
                  <Input
                    id="checkout-email"
                    type="email"
                    inputMode="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    aria-invalid={!!fieldError.email}
                    inputSize="lg"
                    readOnly={!isGuest && !!defaultEmail}
                  />
                  {fieldError.email ? (
                    <p className="text-xs text-destructive" role="alert">{fieldError.email}</p>
                  ) : emailSuggestion ? (
                    <p className="text-xs text-muted-foreground">
                      Did you mean{" "}
                      <button
                        type="button"
                        onClick={() => setEmail(emailSuggestion)}
                        className="font-medium text-foreground underline underline-offset-4"
                      >
                        {emailSuggestion}
                      </button>
                      ?
                    </p>
                  ) : null}
                </div>
              </div>

              {isGuest && (
                <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
                  No account or password needed to check out — you can save this order to an account afterward.
                </p>
              )}
            </Section>

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
                            autoComplete="tel"
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
                            autoComplete="address-level2"
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
                      TamPay adds a small processing fee on top of the total shown here — it&rsquo;s calculated and disclosed on TamPay&rsquo;s payment page before you pay.
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
          </form>
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
              <p className="font-display text-lg font-bold tabular-nums leading-tight">
                <PriceDisplay usdAmount={total} />
              </p>
            </div>
            <Button type="submit" form={FORM_ID} size="xl" disabled={isBusy} aria-busy={isBusy} className={cn("flex-1 font-semibold")}>
              <Lock size={ICON_SIZE.sm} aria-hidden="true" />
              {isBusy ? "Preparing…" : ctaLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

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
import { CheckoutLineItem, type CheckoutItem } from "@/components/checkout/checkout-line-item"
import { OrderSummary } from "@/components/checkout/order-summary"
import { PriceDisplay } from "@/components/price-display"
import { saveAbandonedCart } from "@/lib/actions/recovery"
import { createPolarCheckout, createTampayCheckout } from "@/lib/actions/checkout"
import { formatUsd } from "@/lib/format"
import { CreditCard, Download, Lock, Wallet } from "@/lib/storefront-icons"
import { cn } from "@/lib/utils"

type PaymentProvider = "polar" | "tampay"
type TampaySubMethod = "togo" | "lahza" | "stripe"

const TAMPAY_ENABLED = true
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
  const fixed = DOMAIN_TYPOS[value.slice(at + 1).toLowerCase()]
  return fixed ? `${value.slice(0, at + 1)}${fixed}` : null
}

function CheckoutSection({
  eyebrow,
  title,
  description,
  aside,
  children,
}: {
  eyebrow: string
  title: string
  description?: string
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-[0_18px_60px_-46px_color-mix(in_oklch,var(--foreground)_22%,transparent)]">
      <div className="flex flex-col gap-2 border-b border-border/70 px-5 py-5 sm:flex-row sm:items-start sm:justify-between sm:gap-5 sm:px-6">
        <div>
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.12em] text-primary">{eyebrow}</p>
          <h2 className="mt-1 font-display text-xl font-black tracking-[-0.025em] text-foreground">{title}</h2>
          {description && <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>}
        </div>
        {aside}
      </div>
      <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
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
  const [tampayOrder, setTampayOrder] = useState<{ orderNumber: string; url: string } | null>(null)

  const discount = Math.round(subtotal * (discountPercent / 100) * 100) / 100
  const total = Math.max(0, subtotal - discount)
  const itemCount = orderItems.reduce((count, item) => count + item.quantity, 0)
  const emailSuggestion = suggestEmail(email.trim())
  const paymentInProgress = Boolean(polarCheckoutUrl) || Boolean(tampayOrder)

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

  async function saveFailure(message: string) {
    await saveAbandonedCart({ email, subtotalUsd: subtotal, items: orderItems })
    toast.error(message)
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!validate()) return

    // TamPay is a second-tab payment flow. Open synchronously so browser popup
    // protection does not discard the tab while the server action is running.
    const paymentTab = paymentProvider === "tampay" ? window.open("", "_blank", "noopener,noreferrer") : null

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
            await saveFailure(checkout.error)
            return
          }
          if (paymentTab) paymentTab.location.href = checkout.url
          else window.open(checkout.url, "_blank", "noopener,noreferrer")
          setTampayOrder({ orderNumber: checkout.orderNumber, url: checkout.url })
          return
        }

        const checkout = await createPolarCheckout({
          billingEmail: email.trim(),
          billingName: name.trim(),
          couponCode,
        })
        if ("error" in checkout) {
          await saveFailure(checkout.error)
          return
        }
        setPolarCheckoutUrl(checkout.url)
      } catch (error) {
        paymentTab?.close()
        await saveFailure(error instanceof Error ? error.message : "Could not start checkout.")
      }
    })
  }

  function handleCancelPayment() {
    setPolarCheckoutUrl(null)
    setTampayOrder(null)
  }

  const ctaLabel = paymentProvider === "tampay" ? "Continue to TamPay" : `Pay ${formatUsd(total)}`

  return (
    <div className="grid grid-cols-1 items-start gap-7 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-10 xl:grid-cols-[minmax(0,1fr)_26rem]">
      <div className="min-w-0">
        {paymentInProgress ? (
          <div className="flex flex-col gap-5">
            <div className="flex items-center justify-between gap-4 rounded-2xl border border-border/80 bg-secondary/35 px-4 py-3 text-sm">
              <p className="min-w-0 truncate"><span className="text-muted-foreground">Paying as </span><span className="font-semibold text-foreground">{email.trim()}</span></p>
              <button type="button" onClick={handleCancelPayment} className="shrink-0 text-xs font-semibold text-muted-foreground hover:text-foreground">Edit details</button>
            </div>

            <CheckoutSection eyebrow="Order" title="Your products">
              <ul className="divide-y divide-border/70">
                {orderItems.map((item) => <CheckoutLineItem key={`${item.productId}-${item.licenseId}`} item={item} />)}
              </ul>
            </CheckoutSection>

            {polarCheckoutUrl && (
              <PolarInlineCheckout
                checkoutUrl={polarCheckoutUrl}
                onSuccess={(successUrl) => {
                  const url = new URL(successUrl)
                  router.push(`${url.pathname}${url.search}`)
                }}
                onClose={(reason) => {
                  setPolarCheckoutUrl(null)
                  if (reason === "failed") toast.error("We couldn't open secure payment. Please try again in a moment.")
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
          </div>
        ) : (
          <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
            <CheckoutSection
              eyebrow="01 · Contact"
              title="Where should we send your order?"
              description="Your receipt and download access are tied to this email."
              aside={isGuest ? <Link href={`/sign-in?next=${encodeURIComponent("/checkout")}`} className="text-xs font-semibold text-muted-foreground hover:text-foreground">Already have an account? Sign in</Link> : undefined}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="checkout-name">Full name</Label>
                  <Input id="checkout-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" aria-invalid={!!fieldError.name} className="h-11 rounded-xl" />
                  {fieldError.name && <p className="text-xs text-destructive" role="alert">{fieldError.name}</p>}
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="checkout-email">Email</Label>
                  <Input id="checkout-email" type="email" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" aria-invalid={!!fieldError.email} className="h-11 rounded-xl" readOnly={!isGuest && !!defaultEmail} />
                  {fieldError.email ? (
                    <p className="text-xs text-destructive" role="alert">{fieldError.email}</p>
                  ) : emailSuggestion ? (
                    <p className="text-xs text-muted-foreground">Did you mean <button type="button" onClick={() => setEmail(emailSuggestion)} className="font-semibold text-foreground underline underline-offset-4">{emailSuggestion}</button>?</p>
                  ) : null}
                </div>
              </div>
              {isGuest && <p className="mt-4 text-xs leading-5 text-muted-foreground">No password is required to pay. You can save the completed order to an account afterward.</p>}
            </CheckoutSection>

            <CheckoutSection
              eyebrow="02 · Review"
              title="Your products"
              aside={<Link href="/cart" className="text-xs font-semibold text-muted-foreground hover:text-foreground">Edit cart</Link>}
            >
              <ul className="divide-y divide-border/70">
                {orderItems.map((item) => <CheckoutLineItem key={`${item.productId}-${item.licenseId}`} item={item} />)}
              </ul>
            </CheckoutSection>

            <CheckoutSection eyebrow="03 · Payment" title="Choose how you want to pay" description="No shipping address or delivery step — these are digital products.">
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setPaymentProvider("polar")}
                  aria-pressed={paymentProvider === "polar"}
                  className={cn(
                    "flex min-h-24 items-start gap-3 rounded-2xl border p-4 text-left transition-[border-color,background-color,transform] active:scale-[0.99]",
                    paymentProvider === "polar" ? "border-foreground bg-secondary/55" : "border-border hover:border-border-strong hover:bg-secondary/25",
                  )}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background"><CreditCard size={16} /></span>
                  <span><span className="block text-sm font-bold text-foreground">Card & wallets</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">Apple Pay, Google Pay and cards through secure Polar checkout.</span></span>
                </button>

                {TAMPAY_ENABLED && (
                  <button
                    type="button"
                    onClick={() => setPaymentProvider("tampay")}
                    aria-pressed={paymentProvider === "tampay"}
                    className={cn(
                      "flex min-h-24 items-start gap-3 rounded-2xl border p-4 text-left transition-[border-color,background-color,transform] active:scale-[0.99]",
                      paymentProvider === "tampay" ? "border-foreground bg-secondary/55" : "border-border hover:border-border-strong hover:bg-secondary/25",
                    )}
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background"><Wallet size={16} /></span>
                    <span><span className="block text-sm font-bold text-foreground">TamPay</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">Regional card and wallet options. Processing fees are disclosed there.</span></span>
                  </button>
                )}
              </div>

              {paymentProvider === "tampay" && (
                <div className="mt-5 border-t border-border/70 pt-5">
                  <p className="font-mono text-[9px] font-bold uppercase tracking-[0.1em] text-muted-foreground">TamPay method</p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {TAMPAY_METHODS.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setTampaySubMethod(method.id)}
                        aria-pressed={tampaySubMethod === method.id}
                        className={cn("rounded-xl border px-3 py-3 text-left", tampaySubMethod === method.id ? "border-foreground bg-secondary/50" : "border-border hover:bg-secondary/25")}
                      >
                        <span className="block text-sm font-bold text-foreground">{method.label}</span>
                        <span className="mt-0.5 block text-[11px] leading-4 text-muted-foreground">{method.description}</span>
                      </button>
                    ))}
                  </div>

                  {tampaySubMethod === "togo" && (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="tampay-phone">Phone</Label>
                        <Input id="tampay-phone" type="tel" autoComplete="tel" value={tampayPhone} onChange={(event) => setTampayPhone(event.target.value)} aria-invalid={!!tampayFieldError.phone} className="h-11 rounded-xl" />
                        {tampayFieldError.phone && <p className="text-xs text-destructive" role="alert">{tampayFieldError.phone}</p>}
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor="tampay-city">City</Label>
                        <Input id="tampay-city" autoComplete="address-level2" value={tampayCity} onChange={(event) => setTampayCity(event.target.value)} aria-invalid={!!tampayFieldError.city} className="h-11 rounded-xl" />
                        {tampayFieldError.city && <p className="text-xs text-destructive" role="alert">{tampayFieldError.city}</p>}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CheckoutSection>

            <div className="flex items-start gap-3 rounded-2xl bg-secondary/35 px-4 py-4 sm:px-5">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-background text-foreground"><Download size={15} /></span>
              <div><p className="text-sm font-bold text-foreground">Instant digital delivery</p><p className="mt-1 text-xs leading-5 text-muted-foreground">After confirmed payment, your order is available from the confirmation page and My Library where applicable.</p></div>
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
          isSubmitting={isPending}
          hideAction={paymentInProgress}
          submitLabel={ctaLabel}
          formId={FORM_ID}
          className="rounded-2xl border-border/80 shadow-[0_20px_70px_-44px_color-mix(in_oklch,var(--foreground)_26%,transparent)]"
        />
      </div>

      {!paymentInProgress && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 shadow-[var(--shadow-e3)] backdrop-blur supports-[backdrop-filter]:bg-background/90 lg:hidden">
          <div className="mx-auto flex max-w-lg items-center gap-4">
            <div className="min-w-0"><p className="font-mono text-[9px] font-bold uppercase tracking-[0.08em] text-muted-foreground">Total</p><p className="font-display text-lg font-black tabular-nums leading-tight"><PriceDisplay usdAmount={total} /></p></div>
            <Button type="submit" form={FORM_ID} size="lg" disabled={isPending} aria-busy={isPending} className="h-12 flex-1 rounded-xl bg-foreground font-bold text-background hover:bg-primary hover:text-primary-foreground">
              <Lock size={14} aria-hidden="true" />
              {isPending ? "Preparing…" : ctaLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

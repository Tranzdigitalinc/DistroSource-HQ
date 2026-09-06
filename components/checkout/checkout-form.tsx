"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { motion } from "motion/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PolarInlineCheckout } from "@/components/checkout/polar-inline-checkout"
import { TampayWaiting } from "@/components/checkout/tampay-waiting"
import { WhopWaiting } from "@/components/checkout/whop-waiting"
import { CheckoutLineItem, type CheckoutItem } from "@/components/checkout/checkout-line-item"
import { OrderSummary } from "@/components/checkout/order-summary"
import { saveAbandonedCart } from "@/lib/actions/recovery"
import { createPolarCheckout, createTampayCheckout, createWhopCheckout } from "@/lib/actions/checkout"
import { formatUsd } from "@/lib/format"
import { CreditCard, Download, Lock, Wallet, Zap } from "@/lib/storefront-icons"
import { cn } from "@/lib/utils"

type PaymentProvider = "polar" | "tampay" | "whop"
type TampaySubMethod = "togo" | "lahza" | "stripe"

const TAMPAY_ENABLED = true
const WHOP_ENABLED = false

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

function CheckoutSection({
  number,
  title,
  description,
  aside,
  children,
}: {
  number: string
  title: string
  description?: string
  aside?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <section className="overflow-hidden rounded-[30px] border border-border bg-card">
      <div className="grid gap-3 border-b border-border px-5 py-5 sm:grid-cols-[42px_1fr_auto] sm:items-start sm:px-6">
        <span className="font-mono text-[9px] font-black tracking-[0.12em] text-primary">{number}</span>
        <div>
          <h2 className="font-display text-xl font-black tracking-[-0.035em] text-foreground">{title}</h2>
          {description && <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">{description}</p>}
        </div>
        {aside}
      </div>
      <div className="px-5 py-5 sm:px-6 sm:py-6">{children}</div>
    </section>
  )
}

function PaymentCard({
  active,
  icon: Icon,
  title,
  description,
  onClick,
}: {
  active: boolean
  icon: typeof CreditCard
  title: string
  description: string
  onClick: () => void
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileTap={{ scale: 0.985 }}
      className={cn(
        "relative flex min-h-28 items-start gap-3 rounded-[22px] border p-4 text-left transition-[background-color,border-color]",
        active ? "border-foreground bg-foreground text-background" : "border-border bg-background hover:bg-secondary/45",
      )}
      aria-pressed={active}
    >
      <span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", active ? "bg-background text-foreground" : "bg-secondary text-foreground")}>
        <Icon size={17} />
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-bold">{title}</span>
        <span className={cn("mt-1 block text-xs leading-5", active ? "text-background/55" : "text-muted-foreground")}>{description}</span>
      </span>
      <span className={cn("absolute right-4 top-4 size-2 rounded-full", active ? "bg-primary" : "bg-border")} />
    </motion.button>
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
  const [whopOrder, setWhopOrder] = useState<{ orderNumber: string; url: string } | null>(null)

  const discount = Math.round(subtotal * (discountPercent / 100) * 100) / 100
  const total = Math.max(0, subtotal - discount)
  const itemCount = orderItems.reduce((count, item) => count + item.quantity, 0)
  const paymentInProgress = Boolean(polarCheckoutUrl) || Boolean(tampayOrder) || Boolean(whopOrder)

  function validate(): boolean {
    const contactErrors: typeof fieldError = {}
    if (!name.trim()) contactErrors.name = "Enter the name for this order."
    if (!EMAIL.test(email.trim())) contactErrors.email = "Enter a valid email address."
    setFieldError(contactErrors)

    const tampayErrors: typeof tampayFieldError = {}
    if (TAMPAY_ENABLED && paymentProvider === "tampay" && tampaySubMethod === "togo") {
      if (!tampayPhone.trim()) tampayErrors.phone = "Phone is required for Togo."
      if (!tampayCity.trim()) tampayErrors.city = "City is required for Togo."
    }
    setTampayFieldError(tampayErrors)

    return Object.keys(contactErrors).length === 0 && Object.keys(tampayErrors).length === 0
  }

  async function recordFailure(message: string) {
    await saveAbandonedCart({ email, subtotalUsd: subtotal, items: orderItems })
    toast.error(message)
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!validate()) return

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
            await recordFailure(checkout.error)
            return
          }
          window.open(checkout.url, "_blank", "noopener,noreferrer")
          setTampayOrder({ orderNumber: checkout.orderNumber, url: checkout.url })
          return
        }

        if (WHOP_ENABLED && paymentProvider === "whop") {
          const checkout = await createWhopCheckout({ billingEmail: email.trim(), billingName: name.trim(), couponCode })
          if ("error" in checkout) {
            await recordFailure(checkout.error)
            return
          }
          window.open(checkout.url, "_blank", "noopener,noreferrer")
          setWhopOrder({ orderNumber: checkout.orderNumber, url: checkout.url })
          return
        }

        const checkout = await createPolarCheckout({ billingEmail: email.trim(), billingName: name.trim(), couponCode })
        if ("error" in checkout) {
          await recordFailure(checkout.error)
          return
        }
        setPolarCheckoutUrl(checkout.url)
      } catch (error) {
        await recordFailure(error instanceof Error ? error.message : "Could not start secure checkout.")
      }
    })
  }

  function handleCancelPayment() {
    setPolarCheckoutUrl(null)
    setTampayOrder(null)
    setWhopOrder(null)
  }

  const submitLabel = paymentProvider === "tampay" ? "Continue to TamPay" : paymentProvider === "whop" ? "Continue to Whop" : `Pay ${formatUsd(total)}`

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-10 xl:gap-14">
      <div>
        {paymentInProgress ? (
          <div className="space-y-5">
            <div className="flex items-center justify-between rounded-[22px] border border-border bg-secondary/35 px-5 py-4 text-sm">
              <p className="min-w-0 truncate"><span className="text-muted-foreground">Paying as </span><strong>{email.trim()}</strong></p>
              <button type="button" onClick={handleCancelPayment} className="shrink-0 text-xs font-semibold text-muted-foreground hover:text-foreground">Edit</button>
            </div>

            <CheckoutSection number="01" title="Your products">
              <ul className="divide-y divide-border">
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
            {WHOP_ENABLED && whopOrder && <WhopWaiting orderNumber={whopOrder.orderNumber} paymentUrl={whopOrder.url} onCancel={handleCancelPayment} />}
          </div>
        ) : (
          <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-5" noValidate>
            <CheckoutSection
              number="01"
              title="Contact"
              description="Your receipt and digital access are tied to this email."
              aside={isGuest ? <Link href={`/sign-in?next=${encodeURIComponent("/checkout")}`} className="text-xs font-semibold text-muted-foreground hover:text-foreground">Already have an account?</Link> : undefined}
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="checkout-name">Full name</Label>
                  <Input id="checkout-name" value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" aria-invalid={!!fieldError.name} className="h-12 rounded-2xl" />
                  {fieldError.name && <p className="text-xs text-destructive" role="alert">{fieldError.name}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="checkout-email">Email</Label>
                  <Input id="checkout-email" type="email" inputMode="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" aria-invalid={!!fieldError.email} readOnly={!isGuest && !!defaultEmail} className="h-12 rounded-2xl" />
                  {fieldError.email && <p className="text-xs text-destructive" role="alert">{fieldError.email}</p>}
                </div>
              </div>
              {isGuest && <p className="mt-4 text-xs leading-5 text-muted-foreground">No password is required to pay. You can save the completed order to an account afterward.</p>}
            </CheckoutSection>

            <CheckoutSection number="02" title="Your products" aside={<Link href="/cart" className="text-xs font-semibold text-muted-foreground hover:text-foreground">Edit cart</Link>}>
              <ul className="divide-y divide-border">
                {orderItems.map((item) => <CheckoutLineItem key={`${item.productId}-${item.licenseId}`} item={item} />)}
              </ul>
            </CheckoutSection>

            <CheckoutSection number="03" title="Payment" description="Choose how you want to continue to secure payment.">
              <div className={cn("grid gap-3", TAMPAY_ENABLED ? "sm:grid-cols-2" : "grid-cols-1")}>
                <PaymentCard active={paymentProvider === "polar"} icon={CreditCard} title="Card & wallet" description="Secure checkout through Polar where available." onClick={() => setPaymentProvider("polar")} />
                {TAMPAY_ENABLED && <PaymentCard active={paymentProvider === "tampay"} icon={Wallet} title="TamPay" description="Regional card and wallet methods through TamPay." onClick={() => setPaymentProvider("tampay")} />}
                {WHOP_ENABLED && <PaymentCard active={paymentProvider === "whop"} icon={Zap} title="Whop" description="Continue through Whop's hosted checkout." onClick={() => setPaymentProvider("whop")} />}
              </div>

              {paymentProvider === "tampay" && (
                <div className="mt-5 border-t border-border pt-5">
                  <p className="font-mono text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground">TamPay method</p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {TAMPAY_METHODS.map((method) => (
                      <button
                        key={method.id}
                        type="button"
                        onClick={() => setTampaySubMethod(method.id)}
                        aria-pressed={tampaySubMethod === method.id}
                        className={cn("rounded-2xl border p-3 text-left transition-colors", tampaySubMethod === method.id ? "border-foreground bg-foreground text-background" : "border-border hover:bg-secondary")}
                      >
                        <span className="block text-xs font-bold">{method.label}</span>
                        <span className={cn("mt-1 block text-[10px] leading-4", tampaySubMethod === method.id ? "text-background/55" : "text-muted-foreground")}>{method.description}</span>
                      </button>
                    ))}
                  </div>

                  {tampaySubMethod === "togo" && (
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1.5">
                        <Label htmlFor="tampay-phone">Phone</Label>
                        <Input id="tampay-phone" type="tel" value={tampayPhone} onChange={(event) => setTampayPhone(event.target.value)} aria-invalid={!!tampayFieldError.phone} className="h-12 rounded-2xl" />
                        {tampayFieldError.phone && <p className="text-xs text-destructive" role="alert">{tampayFieldError.phone}</p>}
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor="tampay-city">City</Label>
                        <Input id="tampay-city" value={tampayCity} onChange={(event) => setTampayCity(event.target.value)} aria-invalid={!!tampayFieldError.city} className="h-12 rounded-2xl" />
                        {tampayFieldError.city && <p className="text-xs text-destructive" role="alert">{tampayFieldError.city}</p>}
                      </div>
                    </div>
                  )}
                  <p className="mt-4 text-[11px] leading-5 text-muted-foreground">TamPay may disclose its own processing fee on its payment page before you complete payment.</p>
                </div>
              )}
            </CheckoutSection>

            <div className="flex items-start gap-3 rounded-[24px] bg-secondary/45 px-5 py-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-background text-primary"><Download size={16} /></span>
              <div>
                <p className="text-sm font-bold">Digital delivery</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">After payment confirmation, the available digital access for this order is shown on the confirmation page and associated with your purchase.</p>
              </div>
            </div>
          </form>
        )}
      </div>

      <aside className="lg:sticky lg:top-24">
        <OrderSummary
          subtotal={subtotal}
          discount={discount}
          discountPercent={discountPercent}
          total={total}
          itemCount={itemCount}
          isSubmitting={isPending}
          hideAction={paymentInProgress}
          submitLabel={submitLabel}
          formId={FORM_ID}
        />
      </aside>

      {!paymentInProgress && (
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/90 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl lg:hidden">
          <div className="mx-auto flex max-w-xl items-center gap-4">
            <div className="min-w-0 shrink-0">
              <p className="font-mono text-[8px] font-black uppercase tracking-[0.1em] text-muted-foreground">Total</p>
              <p className="font-display text-xl font-black tracking-tight">{formatUsd(total)}</p>
            </div>
            <Button type="submit" form={FORM_ID} size="lg" disabled={isPending} className="h-13 flex-1 rounded-full font-bold">
              <Lock size={14} /> {isPending ? "Preparing…" : submitLabel}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { PolarInlineCheckout } from "@/components/checkout/polar-inline-checkout"
import { TampayWaiting } from "@/components/checkout/tampay-waiting"
import { CheckoutLineItem, type CheckoutItem } from "@/components/checkout/checkout-line-item"
import { OrderSummary } from "@/components/checkout/order-summary"
import { saveAbandonedCart } from "@/lib/actions/recovery"
import { createPolarCheckout, createTampayCheckout } from "@/lib/actions/checkout"
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

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

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
  const paymentInProgress = Boolean(polarCheckoutUrl || tampayOrder)

  function validate(): boolean {
    const errors: typeof fieldError = {}
    if (!name.trim()) errors.name = "Enter the name for this order."
    if (!EMAIL.test(email.trim())) errors.email = "Enter a valid email address."
    setFieldError(errors)

    const tampayErrors: typeof tampayFieldError = {}
    if (paymentProvider === "tampay" && tampaySubMethod === "togo") {
      if (!tampayPhone.trim()) tampayErrors.phone = "Phone is required for Togo."
      if (!tampayCity.trim()) tampayErrors.city = "City is required for Togo."
    }
    setTampayFieldError(tampayErrors)
    return Object.keys(errors).length === 0 && Object.keys(tampayErrors).length === 0
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!validate()) return

    if (TAMPAY_ENABLED && paymentProvider === "tampay") {
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
            await saveAbandonedCart({ email, subtotalUsd: subtotal, items: orderItems })
            toast.error(checkout.error)
            return
          }
          window.open(checkout.url, "_blank", "noopener,noreferrer")
          setTampayOrder({ orderNumber: checkout.orderNumber, url: checkout.url })
        } catch (error) {
          await saveAbandonedCart({ email, subtotalUsd: subtotal, items: orderItems })
          toast.error(error instanceof Error ? error.message : "Could not start TamPay checkout.")
        }
      })
      return
    }

    startTransition(async () => {
      try {
        const checkout = await createPolarCheckout({ billingEmail: email.trim(), billingName: name.trim(), couponCode })
        if ("error" in checkout) {
          await saveAbandonedCart({ email, subtotalUsd: subtotal, items: orderItems })
          toast.error(checkout.error)
          return
        }
        setPolarCheckoutUrl(checkout.url)
      } catch (error) {
        await saveAbandonedCart({ email, subtotalUsd: subtotal, items: orderItems })
        toast.error(error instanceof Error ? error.message : "Could not start secure checkout.")
      }
    })
  }

  function cancelPayment() {
    setPolarCheckoutUrl(null)
    setTampayOrder(null)
  }

  return (
    <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-16">
      <form id="checkout-form" onSubmit={handleSubmit} noValidate className="space-y-10">
        <CheckoutSection index="01" title="Contact" description="Your receipt and download access are tied to this email.">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" error={fieldError.name}><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="name" className="h-12 w-full border-b border-border bg-transparent px-0 text-sm outline-none transition-colors focus:border-foreground" /></Field>
            <Field label="Email" error={fieldError.email}><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" readOnly={!isGuest && Boolean(defaultEmail)} className="h-12 w-full border-b border-border bg-transparent px-0 text-sm outline-none transition-colors focus:border-foreground read-only:text-muted-foreground" /></Field>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
            <span>{isGuest ? "No account or password required to pay." : "Signed-in account details are used for delivery."}</span>
            {isGuest && <Link href={`/sign-in?next=${encodeURIComponent("/checkout")}`} className="font-semibold text-foreground">Already have an account? Sign in</Link>}
          </div>
        </CheckoutSection>

        <CheckoutSection index="02" title="Your order" description={`${itemCount} ${itemCount === 1 ? "digital product" : "digital products"} ready for checkout.`}>
          <ul className="divide-y divide-border border-y border-border">{orderItems.map((item) => <CheckoutLineItem key={`${item.productId}-${item.licenseId}`} item={item} />)}</ul>
          <div className="mt-4 text-right"><Link href="/cart" className="text-xs font-semibold text-muted-foreground hover:text-foreground">Edit cart</Link></div>
        </CheckoutSection>

        <CheckoutSection index="03" title="Payment" description="Choose how you want to complete the order.">
          <div className="grid gap-3 sm:grid-cols-2">
            <PaymentOption active={paymentProvider === "polar"} onClick={() => setPaymentProvider("polar")} icon={<CreditCard size={18} />} title="Card" description="Cards, Apple Pay & Google Pay via Polar" />
            {TAMPAY_ENABLED && <PaymentOption active={paymentProvider === "tampay"} onClick={() => setPaymentProvider("tampay")} icon={<Wallet size={18} />} title="TamPay" description="Regional cards and wallets" />}
          </div>

          {paymentProvider === "tampay" && (
            <div className="mt-5 border-t border-border pt-5">
              <p className="font-mono text-[9px] font-black uppercase tracking-[0.12em] text-muted-foreground">TamPay method</p>
              <div className="mt-3 grid gap-2 sm:grid-cols-3">{TAMPAY_METHODS.map((method) => <button key={method.id} type="button" onClick={() => setTampaySubMethod(method.id)} className={cn("border px-3 py-3 text-left", tampaySubMethod === method.id ? "border-foreground bg-secondary/35" : "border-border")}><span className="block text-sm font-bold">{method.label}</span><span className="mt-1 block text-[11px] leading-4 text-muted-foreground">{method.description}</span></button>)}</div>
              {tampaySubMethod === "togo" && <div className="mt-5 grid gap-5 sm:grid-cols-2"><Field label="Phone (international format)" error={tampayFieldError.phone}><input type="tel" value={tampayPhone} onChange={(event) => setTampayPhone(event.target.value)} className="h-12 w-full border-b border-border bg-transparent outline-none focus:border-foreground" /></Field><Field label="City" error={tampayFieldError.city}><input value={tampayCity} onChange={(event) => setTampayCity(event.target.value)} className="h-12 w-full border-b border-border bg-transparent outline-none focus:border-foreground" /></Field></div>}
              <p className="mt-4 text-xs leading-5 text-muted-foreground">TamPay may add a processing fee that is shown on its payment page before you pay.</p>
            </div>
          )}
        </CheckoutSection>

        <div className="flex items-start gap-3 border-t border-border pt-6 text-sm text-muted-foreground"><Download size={16} className="mt-0.5 shrink-0 text-primary" /><p>After payment is confirmed, your order is delivered digitally and the receipt is sent to <strong className="font-semibold text-foreground">{email || "your email"}</strong>.</p></div>
      </form>

      <aside className="lg:sticky lg:top-24">
        <OrderSummary subtotal={subtotal} discount={discount} discountPercent={discountPercent} total={total} itemCount={itemCount} isSubmitting={isPending} hideAction={paymentInProgress} submitLabel="Complete secure checkout" formId="checkout-form" />
      </aside>

      {polarCheckoutUrl && <PolarInlineCheckout checkoutUrl={polarCheckoutUrl} onSuccess={(successUrl) => { const url = new URL(successUrl); router.push(`${url.pathname}${url.search}`) }} onClose={(reason) => { setPolarCheckoutUrl(null); if (reason === "failed") toast.error("We couldn't open secure payment. Please try again.") }} />}
      {tampayOrder && <TampayWaiting orderNumber={tampayOrder.orderNumber} paymentUrl={tampayOrder.url} onPaid={(orderNumber) => router.push(`/checkout/success?order=${encodeURIComponent(orderNumber)}`)} onCancel={cancelPayment} />}

      {!paymentInProgress && <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/95 px-4 py-3 backdrop-blur lg:hidden"><div className="mx-auto flex max-w-xl items-center gap-4"><div className="min-w-0"><p className="font-mono text-[8px] font-black uppercase tracking-[0.1em] text-muted-foreground">Total</p><p className="font-display text-xl font-black">${total.toFixed(2)}</p></div><button type="submit" form="checkout-form" disabled={isPending} className="flex h-12 flex-1 items-center justify-center gap-2 bg-[#111827] text-sm font-black text-white"><Lock size={14} />{isPending ? "Preparing…" : "Secure checkout"}</button></div></div>}
    </div>
  )
}

function CheckoutSection({ index, title, description, children }: { index: string; title: string; description: string; children: React.ReactNode }) {
  return <section><div className="grid gap-3 border-b border-border pb-4 sm:grid-cols-[54px_1fr]"><span className="font-mono text-[10px] font-black text-primary">{index}</span><div><h2 className="font-display text-2xl font-black tracking-[-0.04em]">{title}</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p></div></div><div className="pt-5 sm:pl-[54px]">{children}</div></section>
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return <label className="block"><span className="font-mono text-[9px] font-black uppercase tracking-[0.1em] text-muted-foreground">{label}</span>{children}{error && <span className="mt-1 block text-xs text-destructive" role="alert">{error}</span>}</label>
}

function PaymentOption({ active, onClick, icon, title, description }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; description: string }) {
  return <button type="button" onClick={onClick} aria-pressed={active} className={cn("flex min-h-24 items-start gap-3 border p-4 text-left transition-colors", active ? "border-foreground bg-secondary/35" : "border-border hover:border-border-strong")}><span className={cn("flex size-10 shrink-0 items-center justify-center rounded-full", active ? "bg-foreground text-background" : "bg-secondary text-foreground")}>{icon}</span><span><span className="block text-sm font-black">{title}</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">{description}</span></span></button>
}

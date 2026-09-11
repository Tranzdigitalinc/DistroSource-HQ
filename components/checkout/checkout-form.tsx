"use client"

import { useRef, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { AnimatePresence, motion } from "motion/react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PolarInlineCheckout } from "@/components/checkout/polar-inline-checkout"
import { TampayWaiting } from "@/components/checkout/tampay-waiting"
import { Card2CryptoWaiting } from "@/components/checkout/card2crypto-waiting"
import { FungiesCheckout, type FungiesBillingData } from "@/components/checkout/fungies-checkout"
import { CheckoutLineItem, type CheckoutItem } from "@/components/checkout/checkout-line-item"
import { OrderSummary } from "@/components/checkout/order-summary"
import { saveAbandonedCart } from "@/lib/actions/recovery"
import { createCard2CryptoCheckout, createFungiesCheckout, createPolarCheckout, createTampayCheckout } from "@/lib/actions/checkout"
import { formatUsd } from "@/lib/format"
import { Check, ChevronDown, CreditCard, Crypto, Download, Lock, Store, User, Wallet, ICON_SIZE } from "@/lib/storefront-icons"
import { cn } from "@/lib/utils"

type PaymentProvider = "polar" | "tampay" | "card2crypto" | "fungies"
  // The action itself (lib/actions/checkout.ts) enforces Lahza server-side.
  const TAMPAY_ENABLED = true

const CARD_ICONS = ["visa", "mastercard", "american-express", "apple-pay", "google-pay"]

interface CheckoutFormProps {
  defaultEmail: string
  defaultName: string
  subtotal: number
  discountPercent: number
  isGuest: boolean
  orderItems: CheckoutItem[]
  /** Server-computed: true when CARD2CRYPTO_PAYOUT_ADDRESS is configured. */
  card2cryptoEnabled?: boolean
  /** Server-computed: true when the Fungies keys, product and webhook secret are configured. */
  fungiesEnabled?: boolean
}

function Radio({ active }: { active: boolean }) {
  return (
    <span className={cn("mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors", active ? "border-primary bg-primary text-primary-foreground" : "border-border-strong")}>
      {active && <Check size={11} weight="bold" aria-hidden="true" />}
    </span>
  )
}

const FORM_ID = "checkout-form"
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function Section({ step, title, description, aside, children, className }: { step: number; title: string; description?: string; aside?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: step * 0.06, ease: [0.16, 1, 0.3, 1] }}
      className={cn("overflow-hidden rounded-2xl border border-border bg-card", className)}
    >
      <div className="flex items-start justify-between gap-4 px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-foreground font-mono text-[11px] font-bold text-background">{step}</span>
          <div>
            <h2 className="font-display text-base font-bold text-foreground">{title}</h2>
            {description && <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">{description}</p>}
          </div>
        </div>
        {aside}
      </div>
      <div className="border-t border-border px-5 py-4">{children}</div>
    </motion.section>
  )
}

/**
 * Express one-page checkout. Contact, payment method and the order sit on
 * one screen with a single "Pay" button; signed-in shoppers see their
 * details collapsed and go straight to paying. Provider logic is the same
 * as before: Polar opens inline, TamPay opens in a new tab with a
 * waiting screen here.
 */
export function CheckoutForm({ defaultEmail, defaultName, subtotal, discountPercent, isGuest, orderItems, card2cryptoEnabled = false, fungiesEnabled = false }: CheckoutFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const couponCode = searchParams.get("coupon") ?? undefined
  const [email, setEmail] = useState(defaultEmail)
  const [name, setName] = useState(defaultName)
  const [fieldError, setFieldError] = useState<{ name?: string; email?: string }>({})
  const [editingContact, setEditingContact] = useState(isGuest || !defaultEmail)
  const [showItems, setShowItems] = useState(orderItems.length <= 3)
  const [isPending, startTransition] = useTransition()
  const [polarCheckoutUrl, setPolarCheckoutUrl] = useState<string | null>(null)
  const [paymentProvider, setPaymentProvider] = useState<PaymentProvider>("polar")
  const tampaySubMethod = "lahza" as const
  const [tampayOrder, setTampayOrder] = useState<{ orderNumber: string; url: string } | null>(null)
  const [card2cryptoOrder, setCard2cryptoOrder] = useState<{ orderNumber: string; url: string } | null>(null)
  const [fungiesOrder, setFungiesOrder] = useState<{ orderNumber: string; url: string; fallbackUrl: string; billingData: FungiesBillingData } | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)

  const discount = Math.round(subtotal * (discountPercent / 100) * 100) / 100
  const total = Math.max(0, subtotal - discount)
  const itemCount = orderItems.reduce((n, i) => n + i.quantity, 0)
  const paymentInProgress = Boolean(polarCheckoutUrl) || Boolean(tampayOrder) || Boolean(card2cryptoOrder) || Boolean(fungiesOrder)
  const payLabel = `Pay ${formatUsd(total)}`

  function validateContact(): boolean {
    const errors: typeof fieldError = {}
    if (!name.trim()) errors.name = "Enter the name for this order."
    if (!EMAIL.test(email.trim())) errors.email = "Enter a valid email address."
    setFieldError(errors)
    if (errors.name) nameRef.current?.focus()
    else if (errors.email) emailRef.current?.focus()
    if (Object.keys(errors).length > 0) setEditingContact(true)
    return Object.keys(errors).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateContact()) return

    if (TAMPAY_ENABLED && paymentProvider === "tampay") {
      startTransition(async () => {
        try {
          const checkout = await createTampayCheckout({
            billingEmail: email.trim(),
            billingName: name.trim(),
            couponCode,
            paymentMethod: tampaySubMethod,
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

    if (fungiesEnabled && paymentProvider === "fungies") {
      startTransition(async () => {
        try {
          const checkout = await createFungiesCheckout({ billingEmail: email.trim(), billingName: name.trim(), couponCode })
          if ("error" in checkout) {
            await saveAbandonedCart({ email, subtotalUsd: subtotal, items: orderItems })
            toast.error(checkout.error)
            return
          }
          // Opens as an overlay over this page — no second tab.
          setFungiesOrder({
            orderNumber: checkout.orderNumber,
            url: checkout.url,
            fallbackUrl: checkout.fallbackUrl,
            billingData: { email: email.trim(), firstName: checkout.firstName, lastName: checkout.lastName || undefined },
          })
        } catch (error) {
          await saveAbandonedCart({ email, subtotalUsd: subtotal, items: orderItems })
          toast.error(error instanceof Error ? error.message : "Could not start this payment.")
        }
      })
      return
    }

    if (card2cryptoEnabled && paymentProvider === "card2crypto") {
      startTransition(async () => {
        try {
          const checkout = await createCard2CryptoCheckout({ billingEmail: email.trim(), billingName: name.trim(), couponCode })
          if ("error" in checkout) {
            await saveAbandonedCart({ email, subtotalUsd: subtotal, items: orderItems })
            toast.error(checkout.error)
            return
          }
          // Card2Crypto's page must not be embedded, so it opens in a new
          // tab while this one waits for the callback to confirm payment.
          window.open(checkout.url, "_blank", "noopener,noreferrer")
          setCard2cryptoOrder({ orderNumber: checkout.orderNumber, url: checkout.url })
        } catch (error) {
          await saveAbandonedCart({ email, subtotalUsd: subtotal, items: orderItems })
          toast.error(error instanceof Error ? error.message : "Could not start this payment.")
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

  function handleCancelPayment() {
    setPolarCheckoutUrl(null)
    setTampayOrder(null)
    setCard2cryptoOrder(null)
    setFungiesOrder(null)
  }

  const optionClass = (active: boolean) =>
    cn(
      "relative flex items-start gap-3 rounded-xl border px-4 py-3.5 text-left transition-[border-color,background-color] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      active ? "border-primary bg-primary/[0.05]" : "border-border hover:border-border-strong hover:bg-secondary/40",
    )

  return (
    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-8">
      <div className="flex flex-col gap-4">
        {paymentInProgress ? (
          <>
            <div className="flex items-center justify-between rounded-2xl border border-border bg-secondary/40 px-5 py-3 text-sm">
              <p className="min-w-0 truncate">
                <span className="text-muted-foreground">Paying as </span>
                <span className="font-medium text-foreground">{email.trim()}</span>
              </p>
              <button type="button" onClick={handleCancelPayment} className="shrink-0 text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                Edit details
              </button>
            </div>
            <Section step={1} title="Your products">
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
            {fungiesEnabled && fungiesOrder && (
              <FungiesCheckout
                orderNumber={fungiesOrder.orderNumber}
                checkoutUrl={fungiesOrder.url}
                fallbackUrl={fungiesOrder.fallbackUrl}
                billingData={fungiesOrder.billingData}
                onPaid={(orderNumber) => router.push(`/checkout/success?order=${encodeURIComponent(orderNumber)}`)}
                onCancel={handleCancelPayment}
              />
            )}
            {card2cryptoEnabled && card2cryptoOrder && (
              <Card2CryptoWaiting
                orderNumber={card2cryptoOrder.orderNumber}
                paymentUrl={card2cryptoOrder.url}
                onPaid={(orderNumber) => router.push(`/checkout/success?order=${encodeURIComponent(orderNumber)}`)}
                onCancel={handleCancelPayment}
              />
            )}
          </>
        ) : (
          <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
            {/* 1 · Contact */}
            <Section
              step={1}
              title="Contact"
              description={editingContact ? "Your receipt and download access are tied to this email." : undefined}
              aside={
                isGuest ? (
                  <Link href={`/sign-in?next=${encodeURIComponent("/checkout")}`} className="shrink-0 whitespace-nowrap text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                    Sign in
                  </Link>
                ) : !editingContact ? (
                  <button type="button" onClick={() => setEditingContact(true)} className="shrink-0 text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                    Edit
                  </button>
                ) : undefined
              }
            >
              {editingContact ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="checkout-name">Full name</Label>
                    <Input
                      ref={nameRef}
                      id="checkout-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onBlur={() => name.trim() && setFieldError((f) => ({ ...f, name: undefined }))}
                      autoComplete="name"
                      autoFocus={isGuest && !name}
                      aria-invalid={!!fieldError.name}
                      className="h-12 rounded-xl"
                    />
                    {fieldError.name && <p className="text-xs text-destructive" role="alert">{fieldError.name}</p>}
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="checkout-email">Email</Label>
                    <Input
                      ref={emailRef}
                      id="checkout-email"
                      type="email"
                      inputMode="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onBlur={() => EMAIL.test(email.trim()) && setFieldError((f) => ({ ...f, email: undefined }))}
                      autoComplete="email"
                      aria-invalid={!!fieldError.email}
                      className="h-12 rounded-xl"
                      readOnly={!isGuest && !!defaultEmail}
                    />
                    {fieldError.email && <p className="text-xs text-destructive" role="alert">{fieldError.email}</p>}
                  </div>
                  {isGuest && <p className="text-xs leading-relaxed text-muted-foreground sm:col-span-2">No account or password needed. You can save this order to an account after paying.</p>}
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-secondary text-foreground">
                    <User size={ICON_SIZE.base} weight="duotone" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-foreground">{name.trim() || "—"}</p>
                    <p className="truncate text-xs text-muted-foreground">{email.trim()}</p>
                  </div>
                  <span className="ml-auto flex items-center gap-1 font-mono text-[10px] font-semibold uppercase tracking-[0.08em] text-success">
                    <Check size={12} weight="bold" aria-hidden="true" />
                    Signed in
                  </span>
                </div>
              )}
            </Section>

            {/* 2 · Payment method */}
            <Section step={2} title="Payment" description="Choose how to pay. You'll confirm on the next screen.">
              <div className={cn("grid grid-cols-1 gap-3 sm:grid-cols-2", (card2cryptoEnabled || fungiesEnabled) && "lg:grid-cols-3")}>
                <button type="button" onClick={() => setPaymentProvider("polar")} aria-pressed={paymentProvider === "polar"} className={optionClass(paymentProvider === "polar")}>
                  <Radio active={paymentProvider === "polar"} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                      <CreditCard size={ICON_SIZE.base} weight="duotone" className="text-primary" aria-hidden="true" />
                      Card
                    </span>
                    <span className="mt-1.5 flex flex-wrap gap-1">
                      {CARD_ICONS.map((c) => (
                        <span key={c} className="flex h-5 items-center rounded border border-border bg-background px-0.5">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={`/payment-icons/${c}.svg`} alt="" className="h-3 w-auto" loading="lazy" />
                        </span>
                      ))}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">Apple Pay, Google Pay & cards via Polar</span>
                  </span>
                </button>
                {TAMPAY_ENABLED && (
                  <button type="button" onClick={() => setPaymentProvider("tampay")} aria-pressed={paymentProvider === "tampay"} className={optionClass(paymentProvider === "tampay")}>
                    <Radio active={paymentProvider === "tampay"} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Wallet size={ICON_SIZE.base} weight="duotone" className="text-primary" aria-hidden="true" />
                        TamPay
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">Secure card checkout</span>
                    </span>
                  </button>
                )}
                {fungiesEnabled && (
                  <button type="button" onClick={() => setPaymentProvider("fungies")} aria-pressed={paymentProvider === "fungies"} className={optionClass(paymentProvider === "fungies")}>
                    <Radio active={paymentProvider === "fungies"} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Store size={ICON_SIZE.base} weight="duotone" className="text-primary" aria-hidden="true" />
                        Fungies
                      </span>
                      <span className="mt-1.5 flex flex-wrap gap-1">
                        {CARD_ICONS.map((c) => (
                          <span key={c} className="flex h-5 items-center rounded border border-border bg-background px-0.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={`/payment-icons/${c}.svg`} alt="" className="h-3 w-auto" loading="lazy" />
                          </span>
                        ))}
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">Cards & wallets, tax handled for you</span>
                    </span>
                  </button>
                )}
                {card2cryptoEnabled && (
                  <button type="button" onClick={() => setPaymentProvider("card2crypto")} aria-pressed={paymentProvider === "card2crypto"} className={optionClass(paymentProvider === "card2crypto")}>
                    <Radio active={paymentProvider === "card2crypto"} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <Crypto size={ICON_SIZE.base} weight="duotone" className="text-primary" aria-hidden="true" />
                        Pay by crypto
                      </span>
                      <span className="mt-1 block text-xs text-muted-foreground">Crypto, cards & bank transfer via Card2Crypto</span>
                    </span>
                  </button>
                )}
              </div>

              <AnimatePresence initial={false}>
                {TAMPAY_ENABLED && paymentProvider === "tampay" && (
                  <motion.div
                    key="tampay"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 flex flex-col gap-4 border-t border-border pt-4">
                      <p className="text-xs leading-relaxed text-muted-foreground">
                        TamPay adds a small processing fee on top of the total shown here — it&rsquo;s calculated and disclosed on TamPay&rsquo;s payment page before you pay.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </Section>

            {/* 3 · Order */}
            <Section
              step={3}
              title={`Your order · ${itemCount} ${itemCount === 1 ? "item" : "items"}`}
              aside={
                <div className="flex shrink-0 items-center gap-3">
                  <Link href="/cart" className="text-xs font-semibold text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
                    Edit cart
                  </Link>
                  {orderItems.length > 3 && (
                    <button type="button" onClick={() => setShowItems((v) => !v)} aria-expanded={showItems} className="flex items-center gap-1 text-xs font-semibold text-foreground">
                      {showItems ? "Hide" : "Show"}
                      <ChevronDown size={14} weight="bold" className={cn("transition-transform", showItems && "rotate-180")} aria-hidden="true" />
                    </button>
                  )}
                </div>
              }
            >
              <AnimatePresence initial={false}>
                {showItems ? (
                  <motion.ul key="items" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="divide-y divide-border overflow-hidden">
                    {orderItems.map((item) => (
                      <CheckoutLineItem key={`${item.productId}-${item.licenseId}`} item={item} />
                    ))}
                  </motion.ul>
                ) : (
                  <motion.div key="thumbs" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                    {orderItems.slice(0, 6).map((item) => (
                      <span key={`${item.productId}-${item.licenseId}`} className="relative aspect-[16/10] w-16 overflow-hidden rounded-lg border border-border bg-secondary/60">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        {item.imageUrl && <img src={item.imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />}
                      </span>
                    ))}
                    {orderItems.length > 6 && <span className="text-xs text-muted-foreground">+{orderItems.length - 6} more</span>}
                  </motion.div>
                )}
              </AnimatePresence>
            </Section>

            <div className="flex items-start gap-3 rounded-2xl border border-border bg-secondary/30 px-5 py-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-card text-primary">
                <Download size={ICON_SIZE.base} weight="duotone" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold text-foreground">Instant digital delivery</p>
                <p className="mt-0.5 text-sm leading-relaxed text-muted-foreground">
                  Files unlock in My Library the moment payment is confirmed. A receipt goes to {email.trim() || "your email"}.
                </p>
              </div>
            </div>
          </form>
        )}
      </div>

      <div className="lg:sticky lg:top-24">
        <OrderSummary subtotal={subtotal} discount={discount} discountPercent={discountPercent} total={total} itemCount={itemCount} isSubmitting={isPending} hideAction={paymentInProgress} submitLabel={payLabel} formId={FORM_ID} />
      </div>

      {!paymentInProgress && (
        <div className="fixed inset-x-3 bottom-3 z-30 flex items-center gap-3 rounded-full border border-border bg-background/90 p-2 pl-5 shadow-[var(--shadow-e3)] backdrop-blur-xl lg:hidden">
          <div className="min-w-0">
            <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-muted-foreground">Total</p>
            <p className="font-display text-lg font-bold tabular-nums leading-tight">{formatUsd(total)}</p>
          </div>
          <button type="submit" form={FORM_ID} disabled={isPending} aria-busy={isPending} className="ml-auto flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-[15px] font-semibold text-primary-foreground shadow-[0_10px_30px_-10px_var(--primary)] active:scale-[0.98] disabled:opacity-80">
            <Lock size={ICON_SIZE.sm} weight="bold" aria-hidden="true" />
            {isPending ? "Opening…" : payLabel}
          </button>
        </div>
      )}
    </div>
  )
}

"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Bitcoin, CreditCard, Loader2, Lock, Mail, ShieldCheck, Package } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PriceDisplay } from "@/components/price-display"
import { Reveal } from "@/components/motion/reveal"
import { checkout } from "@/lib/actions/checkout"
import { cn } from "@/lib/utils"

interface OrderItem {
  name: string
  brand: string
  denomination: string
  quantity: number
  unitPriceUsd: string
}

interface CheckoutFormProps {
  defaultEmail: string
  defaultName: string
  subtotal: number
  discountPercent: number
  isGuest: boolean
  orderItems: OrderItem[]
}

const FORM_ID = "checkout-form"

function detectCardBrand(digits: string): "visa" | "mastercard" | "amex" | null {
  if (/^4/.test(digits)) return "visa"
  if (/^5[1-5]/.test(digits)) return "mastercard"
  if (/^3[47]/.test(digits)) return "amex"
  return null
}

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 16)
  const groups = digits.match(/.{1,4}/g) ?? []
  return groups.join(" ")
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 4)
  if (digits.length <= 2) return digits
  return `${digits.slice(0, 2)}/${digits.slice(2)}`
}

const CARD_BRAND_LABEL: Record<string, string> = {
  visa: "Visa",
  mastercard: "Mastercard",
  amex: "Amex",
}

export function CheckoutForm({ defaultEmail, defaultName, subtotal, discountPercent, isGuest, orderItems }: CheckoutFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const couponCode = searchParams.get("coupon") ?? undefined
  const [email, setEmail] = useState(defaultEmail)
  const [name, setName] = useState(defaultName)
  const [cardNumber, setCardNumber] = useState("")
  const [expiry, setExpiry] = useState("")
  const [cvc, setCvc] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<"crypto" | "card">("crypto")
  const [isPending, startTransition] = useTransition()

  const discount = Math.round(subtotal * (discountPercent / 100) * 100) / 100
  const total = Math.max(0, subtotal - discount)
  const cardBrand = detectCardBrand(cardNumber.replace(/\D/g, ""))
  const formattedTotal = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(total)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    toast.info("Payments are temporarily unavailable. Please check back soon.")
    return
    startTransition(async () => {
      try {
        const result = await checkout({ billingEmail: email, billingName: name, couponCode })
        router.push(`/checkout/success?order=${result.orderNumber}`)
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Checkout failed. Please try again.")
      }
    })
  }

  return (
    <div className="flex flex-col gap-8 pb-24 lg:pb-0">
      <form id={FORM_ID} onSubmit={handleSubmit} className="flex flex-col gap-8">
        {isGuest && (
          <Reveal className="flex items-center justify-between gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm">
            <span className="flex items-center gap-2 text-foreground/80">
              <Mail className="size-4 shrink-0 text-primary" aria-hidden="true" />
              Checking out as a guest — codes go to your email below.
            </span>
            <Link href="/sign-in?redirect=/checkout" className="shrink-0 font-semibold text-primary hover:underline">
              Sign in
            </Link>
          </Reveal>
        )}

        <Reveal delay={0.05} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Package className="size-4 text-muted-foreground" aria-hidden="true" />
            <h2 className="font-display text-lg font-bold">Your items</h2>
          </div>
          <div className="flex flex-col divide-y divide-border">
            {orderItems.map((item, i) => (
              <div key={i} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.brand} &middot; {item.denomination} &times; {item.quantity}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold">
                  <PriceDisplay usdAmount={Number.parseFloat(item.unitPriceUsd) * item.quantity} />
                </span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={0.1} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
          <h2 className="font-display text-lg font-bold">Contact details</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Full name</Label>
              <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email — codes are delivered here</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.15} className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <Lock className="size-4 text-muted-foreground" aria-hidden="true" />
            <h2 className="font-display text-lg font-bold">Payment</h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Payment methods are temporarily unavailable while we finish connecting secure checkout.
          </p>
          <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-label="Payment method">
            <button
              type="button"
              role="radio"
              aria-checked={paymentMethod === "crypto"}
              onClick={() => setPaymentMethod("crypto")}
              disabled
              className={cn(
                "flex min-h-20 flex-col items-start justify-between rounded-xl border p-3 text-left opacity-60 transition-colors disabled:cursor-not-allowed",
                paymentMethod === "crypto"
                  ? "border-accent bg-accent/10 text-foreground ring-1 ring-accent"
                  : "border-border bg-background hover:border-accent/50",
              )}
            >
              <span className="flex items-center gap-2 text-sm font-semibold"><Bitcoin className="size-4 text-accent" /> Crypto</span>
              <span className="text-[11px] text-muted-foreground">Recommended</span>
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={paymentMethod === "card"}
              onClick={() => setPaymentMethod("card")}
              disabled
              className={cn(
                "flex min-h-20 flex-col items-start justify-between rounded-xl border p-3 text-left opacity-60 transition-colors disabled:cursor-not-allowed",
                paymentMethod === "card"
                  ? "border-accent bg-accent/10 text-foreground ring-1 ring-accent"
                  : "border-border bg-background hover:border-accent/50",
              )}
            >
              <span className="flex items-center gap-2 text-sm font-semibold"><CreditCard className="size-4" /> Card</span>
              <span className="text-[11px] text-muted-foreground">Alternative</span>
            </button>
          </div>
          <div className="rounded-lg border border-border bg-secondary/50 p-3 text-xs leading-relaxed text-muted-foreground">
            Crypto and card payments are temporarily disabled. Your cart is saved, and you can return when checkout is available.
          </div>
          {false && (
            <>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="card">Card number</Label>
            <div className="relative">
              <Input
                id="card"
                value={cardNumber}
                onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                placeholder="1234 1234 1234 1234"
                autoComplete="cc-number"
                inputMode="numeric"
                className={cn(cardBrand && "pr-16")}
                required
              />
              {cardBrand && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md border border-border bg-secondary px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {CARD_BRAND_LABEL[cardBrand]}
                </span>
              )}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="expiry">Expiry</Label>
              <Input
                id="expiry"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                placeholder="MM/YY"
                autoComplete="cc-exp"
                inputMode="numeric"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="cvc">CVC</Label>
              <Input
                id="cvc"
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="123"
                autoComplete="cc-csc"
                inputMode="numeric"
                required
              />
            </div>
          </div>
            </>
          )}
        </Reveal>

        <Reveal delay={0.2} className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <PriceDisplay usdAmount={subtotal} />
          </div>
          {discountPercent > 0 && (
            <div className="flex justify-between text-sm text-success">
              <span>Discount ({discountPercent}%)</span>
              <span>
                -<PriceDisplay usdAmount={discount} />
              </span>
            </div>
          )}
          <div className="flex justify-between border-t border-border pt-3 font-display text-lg font-bold">
            <span>Total</span>
            <PriceDisplay usdAmount={total} />
          </div>
          <Button
            type="submit"
            size="lg"
            disabled
            className="mt-2 hidden h-12 font-semibold lg:flex"
          >
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Placing order...
              </span>
            ) : (
              paymentMethod === "crypto" ? "Continue to crypto payment" : `Pay ${formattedTotal}`
            )}
          </Button>
          <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3.5" aria-hidden="true" />
            Secured checkout — your details are protected
          </p>
        </Reveal>
      </form>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-4">
          <div className="flex flex-col leading-tight">
            <span className="text-[11px] text-muted-foreground">Total</span>
            <span className="font-display text-base font-bold">
              <PriceDisplay usdAmount={total} />
            </span>
          </div>
          <Button type="submit" form={FORM_ID} size="lg" disabled className="h-11 flex-1 font-semibold">
            {isPending ? (
              <span className="flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Placing order...
              </span>
            ) : (
              paymentMethod === "crypto" ? "Continue to crypto payment" : `Pay ${formattedTotal}`
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

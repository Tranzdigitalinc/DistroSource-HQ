"use client"

import { useState, useTransition } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Lock, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { PriceDisplay } from "@/components/price-display"
import { checkout } from "@/lib/actions/checkout"

interface CheckoutFormProps {
  defaultEmail: string
  defaultName: string
  subtotal: number
  discountPercent: number
}

export function CheckoutForm({ defaultEmail, defaultName, subtotal, discountPercent }: CheckoutFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const couponCode = searchParams.get("coupon") ?? undefined
  const [email, setEmail] = useState(defaultEmail)
  const [name, setName] = useState(defaultName)
  const [cardNumber, setCardNumber] = useState("4242 4242 4242 4242")
  const [expiry, setExpiry] = useState("12/28")
  const [cvc, setCvc] = useState("123")
  const [isPending, startTransition] = useTransition()

  const discount = Math.round(subtotal * (discountPercent / 100) * 100) / 100
  const total = Math.max(0, subtotal - discount)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
        <h2 className="font-display text-lg font-bold">Contact details</h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Full name</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="email">Email — codes are delivered here</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4 rounded-xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <Lock className="size-4 text-muted-foreground" aria-hidden="true" />
          <h2 className="font-display text-lg font-bold">Payment</h2>
        </div>
        <p className="text-xs text-muted-foreground">
          This is a simulated checkout for demo purposes. No real payment is processed.
        </p>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="card">Card number</Label>
          <Input id="card" value={cardNumber} onChange={(e) => setCardNumber(e.target.value)} required />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="expiry">Expiry</Label>
            <Input id="expiry" value={expiry} onChange={(e) => setExpiry(e.target.value)} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="cvc">CVC</Label>
            <Input id="cvc" value={cvc} onChange={(e) => setCvc(e.target.value)} required />
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-6">
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
        <Button type="submit" size="lg" disabled={isPending} className="mt-2 h-12 font-semibold">
          {isPending ? "Placing order..." : `Pay ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(total)}`}
        </Button>
        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <ShieldCheck className="size-3.5" aria-hidden="true" />
          Secured checkout — your details are protected
        </p>
      </div>
    </form>
  )
}

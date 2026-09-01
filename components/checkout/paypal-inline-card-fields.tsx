"use client"

import { useState } from "react"
import {
  PayPalCardFieldsProvider,
  PayPalNameField,
  PayPalNumberField,
  PayPalExpiryField,
  PayPalCVVField,
  usePayPalCardFields,
} from "@paypal/react-paypal-js"
import { Loader2, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { createPaypalCheckoutOrder, capturePaypalCheckoutOrder } from "@/lib/actions/checkout"

// PayPal's card fields render inside a cross-origin iframe with no access to
// this app's CSS custom properties, so colors must be literal values that
// mirror the app's design tokens (see globals.css) rather than var(--*).
const cardFieldStyle = {
  input: {
    fontFamily: "Inter, sans-serif",
    fontSize: "14px",
    color: "#f3f4f6",
    backgroundColor: "transparent",
    border: "0",
    outline: "none",
    boxShadow: "none",
    padding: "0",
    width: "100%",
    height: "100%",
  },
  "input::placeholder": {
    color: "#9ca3af",
    opacity: "1",
  },
  ".invalid": {
    color: "#f3f4f6",
    border: "0",
    outline: "none",
    boxShadow: "none",
  },
  "input:focus": {
    border: "0",
    outline: "none",
    boxShadow: "none",
  },
}

const fieldWrapperClass =
  "flex h-12 w-full items-center overflow-hidden rounded-md border border-border bg-input/30 px-3 shadow-xs transition-colors focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/40"

interface PaypalInlineCardFieldsProps {
  billingEmail: string
  billingName: string
  couponCode?: string
  disabled: boolean
  onBeforeSubmit: () => Promise<boolean>
  onSuccess: (orderNumber: string) => void
  onFailure: (message: string) => void
}

function SubmitButton({
  billingEmail,
  billingName,
  couponCode,
  disabled,
  onBeforeSubmit,
  onSuccess,
  onFailure,
}: PaypalInlineCardFieldsProps) {
  const { cardFieldsForm } = usePayPalCardFields()
  const [isProcessing, setIsProcessing] = useState(false)

  async function handlePay() {
    if (!cardFieldsForm) return
    const ready = await onBeforeSubmit()
    if (!ready) return

    setIsProcessing(true)
    try {
      await cardFieldsForm.submit({ name: billingName })
      // onApprove (wired into the CardFields instance below) takes over from
      // here — it captures the order and reports success/failure.
    } catch (error) {
      console.error("[v0] PayPal card submit failed:", error)
      onFailure("We couldn't process that card. Double-check the details and try again.")
      setIsProcessing(false)
    }
  }

  return (
    <Button
      type="button"
      size="lg"
      className="h-11 w-full font-semibold"
      disabled={disabled || isProcessing}
      onClick={handlePay}
    >
      {isProcessing ? (
        <span className="flex items-center gap-2">
          <Loader2 className="size-4 animate-spin" />
          Processing payment...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <Lock className="size-4" />
          Pay securely
        </span>
      )}
    </Button>
  )
}

/**
 * Inline card payment form rendered directly on the page — no PayPal login
 * popup and no PayPal branding. Card number/expiry/CVC are still collected
 * inside PayPal-hosted iframes (so raw card data never touches this app's
 * server), but visually it's just a form on the checkout page.
 *
 * Requires the connected PayPal business account to be approved for
 * Advanced Credit and Debit Card Payments. Callers should wrap this in
 * PaypalErrorBoundary and fall back to PayPalButtons if that approval isn't
 * in place yet.
 */
export function PaypalInlineCardFields(props: PaypalInlineCardFieldsProps) {
  const { billingEmail, billingName, couponCode, disabled, onSuccess, onFailure } = props

  return (
    <div className="flex flex-col gap-3">
      <PayPalCardFieldsProvider
        style={cardFieldStyle}
        createOrder={async () => {
          const result = await createPaypalCheckoutOrder({ billingEmail, billingName, couponCode })
          return result.paypalOrderId
        }}
        onApprove={async (data) => {
          try {
            const result = await capturePaypalCheckoutOrder({
              paypalOrderId: data.orderID,
              billingEmail,
              billingName,
              couponCode,
            })
            onSuccess(result.orderNumber)
          } catch (error) {
            onFailure(error instanceof Error ? error.message : "Your payment could not be completed.")
          }
        }}
        onError={(error) => {
          console.error("[v0] PayPal card fields error:", error)
          onFailure("Your card could not be charged. Please check the details and try again.")
        }}
      >
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Name on card</Label>
            <div className={fieldWrapperClass}>
              <PayPalNameField className="block h-12 w-full" placeholder={billingName || "Full name"} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-muted-foreground">Card number</Label>
            <div className={fieldWrapperClass}>
              <PayPalNumberField className="block h-12 w-full" placeholder="1234 1234 1234 1234" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">Expiry</Label>
              <div className={fieldWrapperClass}>
                <PayPalExpiryField className="block h-12 w-full" placeholder="MM/YY" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-muted-foreground">CVC</Label>
              <div className={fieldWrapperClass}>
                <PayPalCVVField className="block h-12 w-full" placeholder="CVC" />
              </div>
            </div>
          </div>
        </div>
        <SubmitButton {...props} />
      </PayPalCardFieldsProvider>
    </div>
  )
}

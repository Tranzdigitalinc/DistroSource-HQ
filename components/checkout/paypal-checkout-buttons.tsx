"use client"

import { useEffect, useState } from "react"
import { PayPalButtons, PayPalScriptProvider, usePayPalScriptReducer } from "@paypal/react-paypal-js"
import { Loader2 } from "@/lib/storefront-icons"
import { createPaypalCheckoutOrder, capturePaypalCheckoutOrder } from "@/lib/actions/checkout"
import { PaypalInlineCardFields } from "@/components/checkout/paypal-inline-card-fields"

interface PaypalCheckoutButtonsProps {
  clientId: string
  billingEmail: string
  billingName: string
  couponCode?: string
  disabled: boolean
  disabledReason?: string
  onBeforeCreateOrder: () => Promise<boolean>
  onSuccess: (orderNumber: string) => void
  onFailure: (message: string) => void
}

/**
 * Fallback shown only if the connected PayPal business account is not
 * (yet) approved for Advanced Credit and Debit Card Payments, which is
 * required to render the inline card form. It still stays on this page —
 * PayPal only opens a small login popup, no full-page redirect.
 */
function PaypalButtonsFallback({
  billingEmail,
  billingName,
  couponCode,
  disabled,
  onBeforeCreateOrder,
  onSuccess,
  onFailure,
}: Omit<PaypalCheckoutButtonsProps, "clientId" | "disabledReason">) {
  const [isProcessing, setIsProcessing] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <div className={disabled ? "pointer-events-none opacity-50" : ""}>
        <PayPalButtons
          disabled={disabled || isProcessing}
          style={{ layout: "vertical", color: "black", shape: "rect", label: "pay" }}
          onClick={async (_data, actions) => {
            if (disabled) return actions.reject()
            const ready = await onBeforeCreateOrder()
            if (!ready) return actions.reject()
            return actions.resolve()
          }}
          createOrder={async () => {
            setIsProcessing(true)
            try {
              const result = await createPaypalCheckoutOrder({ billingEmail, billingName, couponCode })
              return result.paypalOrderId
            } catch (error) {
              setIsProcessing(false)
              onFailure(error instanceof Error ? error.message : "Could not start checkout.")
              throw error
            }
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
              onFailure(error instanceof Error ? error.message : "Payment could not be completed.")
            } finally {
              setIsProcessing(false)
            }
          }}
          onCancel={() => setIsProcessing(false)}
          onError={(error) => {
            setIsProcessing(false)
            console.error("[v0] PayPal buttons error:", error)
            onFailure("Payment ran into a problem. Please try again.")
          }}
        />
      </div>
      {isProcessing && (
        <span className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
          Finishing your order...
        </span>
      )}
    </div>
  )
}

type CardFieldsFactory = (options: {
  createOrder: () => Promise<string>
  onApprove: () => void
}) => { isEligible: () => boolean }

/**
 * Decides which payment UI to render once the PayPal JS SDK has finished
 * loading. Advanced Credit and Debit Card Payments (the inline card form)
 * requires case-by-case approval from PayPal — `window.paypal.CardFields`
 * is always present once the `card-fields` component is requested, but a
 * throwaway instance's `isEligible()` reports whether this business
 * account is actually approved to use it. We check that *before* mounting
 * the real card fields provider, since it silently renders nothing when
 * ineligible instead of exposing that state to us.
 */
function PaypalPaymentMethod(props: Omit<PaypalCheckoutButtonsProps, "clientId" | "disabledReason">) {
  const [{ isResolved }] = usePayPalScriptReducer()
  const [cardFieldsEligible, setCardFieldsEligible] = useState<boolean | null>(null)

  useEffect(() => {
    if (!isResolved) return
    try {
      const CardFields = (window.paypal as { CardFields?: CardFieldsFactory } | undefined)?.CardFields
      if (!CardFields) {
        setCardFieldsEligible(false)
        return
      }
      const probe = CardFields({ createOrder: async () => "", onApprove: () => {} })
      setCardFieldsEligible(probe.isEligible())
    } catch (error) {
      console.error("[v0] PayPal card fields eligibility check failed:", error)
      setCardFieldsEligible(false)
    }
  }, [isResolved])

  if (!isResolved || cardFieldsEligible === null) {
    return (
      <div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-secondary/50 p-4 text-xs text-muted-foreground">
        <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
        Loading secure payment form...
      </div>
    )
  }

  return cardFieldsEligible ? <PaypalInlineCardFields {...props} onBeforeSubmit={props.onBeforeCreateOrder} /> : <PaypalButtonsFallback {...props} />
}

export function PaypalCheckoutButtons({
  clientId,
  billingEmail,
  billingName,
  couponCode,
  disabled,
  disabledReason,
  onBeforeCreateOrder,
  onSuccess,
  onFailure,
}: PaypalCheckoutButtonsProps) {
  return (
    <div className="flex flex-col gap-2">
      {disabled && disabledReason && <p className="text-xs text-muted-foreground">{disabledReason}</p>}
      <div className={disabled ? "pointer-events-none opacity-50" : ""}>
        <PayPalScriptProvider
          options={{ clientId, currency: "USD", intent: "capture", components: "card-fields,buttons" }}
        >
          <PaypalPaymentMethod
            billingEmail={billingEmail}
            billingName={billingName}
            couponCode={couponCode}
            disabled={disabled}
            onBeforeCreateOrder={onBeforeCreateOrder}
            onSuccess={onSuccess}
            onFailure={onFailure}
          />
        </PayPalScriptProvider>
      </div>
    </div>
  )
}

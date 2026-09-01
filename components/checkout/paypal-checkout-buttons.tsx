"use client"

import { useState } from "react"
import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js"
import { Loader2 } from "lucide-react"
import { createPaypalCheckoutOrder, capturePaypalCheckoutOrder } from "@/lib/actions/checkout"

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
  const [isProcessing, setIsProcessing] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      {disabled && disabledReason && <p className="text-xs text-muted-foreground">{disabledReason}</p>}
      <div className={disabled ? "pointer-events-none opacity-50" : ""}>
        <PayPalScriptProvider options={{ clientId, currency: "USD", intent: "capture" }}>
          <PayPalButtons
            disabled={disabled || isProcessing}
            style={{ layout: "vertical", color: "gold", shape: "rect", label: "paypal" }}
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
                onFailure(error instanceof Error ? error.message : "Could not start PayPal checkout.")
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
                onFailure(error instanceof Error ? error.message : "PayPal payment could not be completed.")
              } finally {
                setIsProcessing(false)
              }
            }}
            onCancel={() => setIsProcessing(false)}
            onError={(error) => {
              setIsProcessing(false)
              console.error("[v0] PayPal buttons error:", error)
              onFailure("PayPal ran into a problem. Please try again.")
            }}
          />
        </PayPalScriptProvider>
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
